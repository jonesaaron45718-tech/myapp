// api/chat.js  — Vercel Serverless Function
// Handles: AI chat (Gemini), file generation (e2b v1), image generation (Together AI)

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Sandbox } = require("e2b");

// ── API Keys (from Vercel env vars) ──
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
].filter(Boolean);

const E2B_KEY = process.env.E2B_API_KEY;
const TOGETHER_KEY = process.env.TOGETHER_API_KEY;

function detectIntent(text) {
  const t = text.toLowerCase();
  const imageWords = ["generate image","create image","draw","make an image","picture of","illustration of","photo of","generate a picture","create a picture"];
  const fileWords = {
    xlsx: ["excel","spreadsheet","xlsx","financial model","balance sheet","income statement","cash flow"],
    pdf: ["pdf","report in pdf","create a pdf","make a pdf"],
    docx: ["word document","word doc","docx","letter","contract","write a document"],
    pptx: ["powerpoint","pptx","presentation","slides","slide deck","deck"],
    csv: ["csv","comma separated","data file","create a csv"],
    html: ["html file","html page","webpage file"],
    txt: ["text file",".txt","plain text file"],
  };
  if (imageWords.some(w => t.includes(w))) return { type: "image" };
  for (const [ext, words] of Object.entries(fileWords)) {
    if (words.some(w => t.includes(w))) return { type: "file", fileType: ext };
  }
  return { type: "chat" };
}

async function callGemini(messages, systemPrompt, keyIndex = 0) {
  const key = GEMINI_KEYS[keyIndex % GEMINI_KEYS.length];
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: systemPrompt });
  const allMsgs = [...messages];
  const lastMsg = allMsgs.pop();
  const history = allMsgs.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const chat = model.startChat({ history });
  try {
    const result = await chat.sendMessage(lastMsg.content);
    return result.response.text();
  } catch (err) {
    if (keyIndex === 0 && GEMINI_KEYS.length > 1) return callGemini(messages, systemPrompt, 1);
    throw err;
  }
}

async function generateFile(userRequest, fileType) {
  const planPrompt = `You are a professional Python developer. The user wants: "${userRequest}"
Write a complete Python script to create a ${fileType.toUpperCase()} file.
- Libraries: ${getLibs(fileType)}
- Save file to: /tmp/output.${fileType}
- Create REAL professional content based on the request. No placeholders. No lorem ipsum.
- Excel: multiple sheets, blue input cells (#0070C0), alternating row colors, headers.
- PDF: reportlab with title, sections, tables, colors.
- Word: python-docx with styled headings, paragraphs, tables.
- PowerPoint: python-pptx with consistent theme, proper layouts.
- CSV: meaningful headers and 10+ realistic data rows.
- HTML: complete styled page with embedded CSS.
Return ONLY raw Python code. No backticks. No markdown. No explanation.`;

  const pythonCode = await callGemini(
    [{ role: "user", content: planPrompt }],
    "Return ONLY raw executable Python code. No markdown fences. No backticks. No explanation whatsoever."
  );

  const cleanCode = pythonCode.replace(/```python\n?/gi,"").replace(/```\n?/g,"").trim();

  const sandbox = await Sandbox.create({ apiKey: E2B_KEY, timeoutMs: 120000 });
  try {
    const libList = getLibs(fileType);
    if (libList) {
      await sandbox.commands.run(`pip install -q ${libList}`, { timeoutMs: 60000 });
    }
    const scriptPath = "/tmp/script.py";
    await sandbox.files.write(scriptPath, cleanCode);
    const result = await sandbox.commands.run(`python3 ${scriptPath}`, { timeoutMs: 60000 });
    if (result.exitCode !== 0) throw new Error(`Script failed: ${result.stderr}`);
    const fileBytes = await sandbox.files.read(`/tmp/output.${fileType}`);
    const base64 = Buffer.from(fileBytes).toString("base64");
    return { dataUrl: `data:${getMime(fileType)};base64,${base64}`, fileType };
  } finally {
    await sandbox.kill();
  }
}

async function generateImage(prompt) {
  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: { "Authorization": `Bearer ${TOGETHER_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "black-forest-labs/FLUX.1-schnell-Free", prompt, width: 1024, height: 768, steps: 4, n: 1, response_format: "b64_json" }),
  });
  const data = await res.json();
  if (!data.data?.[0]?.b64_json) throw new Error(data.error?.message || "Image generation failed");
  return `data:image/png;base64,${data.data[0].b64_json}`;
}

const SYSTEM_PROMPT = `You are myapp's AI assistant — brilliant, professional, and thorough.
RESPONSE FORMAT:
- Questions: Direct answer first, then ## headers for explanation, then ## Key Takeaways
- Research: ## Executive Summary (bullets), then ## sections, then ## Conclusion
- File requests: ## File Overview, ## Structure, ## Key Content, then say file is generating
- Use **bold** for key terms, ## headers for sections
- Never truncate — always complete the full response
- You are myapp's AI — never say you are Gemini or made by Google`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: "No messages" });
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  if (!lastUserMsg) return res.status(400).json({ error: "No user message" });

  try {
    const intent = detectIntent(lastUserMsg.content);

    if (intent.type === "image") {
      const imageUrl = await generateImage(lastUserMsg.content);
      return res.json({ text: "✅ Here's your generated image!", imageUrl });
    }

    if (intent.type === "file") {
      const planText = await callGemini(messages,
        `${SYSTEM_PROMPT}\nThe user wants a ${intent.fileType.toUpperCase()} file. Describe what you will create: ## File Overview, ## Structure, ## Key Content. End with "Generating your file now…"`
      );
      const { dataUrl, fileType } = await generateFile(lastUserMsg.content, intent.fileType);
      return res.json({
        text: planText,
        fileCard: { name: `myapp_${fileType}_${Date.now()}.${fileType}`, type: fileType, url: dataUrl, summary: `${fileType.toUpperCase()} file ready — click Download` },
      });
    }

    const text = await callGemini(messages, SYSTEM_PROMPT);
    return res.json({ text });

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

function getLibs(type) {
  return { xlsx:"openpyxl", pdf:"reportlab", docx:"python-docx", pptx:"python-pptx", csv:"pandas", html:"", txt:"" }[type] || "";
}
function getMime(type) {
  return {
    xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pdf:"application/pdf",
    docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation",
    csv:"text/csv", html:"text/html", txt:"text/plain"
  }[type] || "application/octet-stream";
}
