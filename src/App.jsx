import { useState, useEffect, useRef } from "react";

const ACCESS_CODE = "myapp2024";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function parseMarkdown(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^(.+)$/, '<p>$1</p>');
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  const [dark, setDark] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("convos") || "[]"); } catch { return []; }
  });
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (authed && conversations.length === 0) {
      const id = Date.now().toString();
      const fresh = { id, title: "New Chat", messages: [] };
      setConversations([fresh]);
      setActiveConvo(fresh);
      setMessages([]);
    }
  }, [authed]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (activeConvo) {
      const updated = conversations.map(c => c.id === activeConvo.id ? { ...c, messages } : c);
      setConversations(updated);
      localStorage.setItem("convos", JSON.stringify(updated));
    }
  }, [messages]);

  function login() {
    if (codeInput.trim() === ACCESS_CODE) { setAuthed(true); }
    else { setCodeError("Wrong access code. Try again."); }
  }

  function newChat() {
    const id = Date.now().toString();
    const fresh = { id, title: "New Chat", messages: [] };
    setConversations(prev => [fresh, ...prev]);
    setActiveConvo(fresh);
    setMessages([]);
    setSidebarOpen(false);
  }

  function selectConvo(c) {
    setActiveConvo(c);
    setMessages(c.messages || []);
    setSidebarOpen(false);
  }

  function deleteConvo(id, e) {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    localStorage.setItem("convos", JSON.stringify(updated));
    if (activeConvo?.id === id) {
      if (updated.length > 0) { selectConvo(updated[0]); }
      else { newChat(); }
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text, time: formatTime() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);

    // Update convo title from first message
    if (messages.length === 0 && activeConvo) {
      const title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
      setConversations(prev => prev.map(c => c.id === activeConvo.id ? { ...c, title } : c));
    }

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg = {
        role: "assistant",
        content: data.text || "",
        time: formatTime(),
        fileCard: data.fileCard || null,
        imageUrl: data.imageUrl || null,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ " + err.message, time: formatTime() }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  // ── Auth Screen ──
  if (!authed) {
    return (
      <div className={`auth-screen ${dark ? "dark" : "light"}`}>
        <div className="auth-card">
          <div className="auth-logo">⚡</div>
          <h1>myapp</h1>
          <p>Your AI-powered workspace</p>
          <input
            type="password"
            placeholder="Enter access code"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            autoFocus
          />
          {codeError && <div className="auth-error">{codeError}</div>}
          <button onClick={login}>Enter →</button>
        </div>
      </div>
    );
  }

  // ── Main UI ──
  return (
    <div className={`app ${dark ? "dark" : "light"}`}>
      {/* Sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">⚡ myapp</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <button className="new-chat-btn" onClick={newChat}>+ New Chat</button>
        <div className="convo-list">
          {conversations.map(c => (
            <div
              key={c.id}
              className={`convo-item ${activeConvo?.id === c.id ? "active" : ""}`}
              onClick={() => selectConvo(c)}
            >
              <span className="convo-title">{c.title || "New Chat"}</span>
              <button className="delete-btn" onClick={e => deleteConvo(c.id, e)}>🗑</button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        {/* Header */}
        <header className="header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <span className="header-title">⚡ myapp</span>
          <button className="theme-toggle" onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </header>

        {/* Messages */}
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-icon">⚡</div>
              <h2>Welcome to myapp</h2>
              <p>Ask anything. Generate files. Create images.</p>
              <div className="suggestions">
                {["Create an Excel financial model", "Generate a PDF report", "What is compound interest?", "Make a PowerPoint presentation"].map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => { setInput(s); textareaRef.current?.focus(); }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg-row ${m.role}`}>
              <div className="msg-avatar">{m.role === "user" ? "U" : "⚡"}</div>
              <div className="msg-bubble-wrap">
                {m.imageUrl && (
                  <div className="msg-image">
                    <img src={m.imageUrl} alt="Generated" />
                  </div>
                )}
                {m.fileCard && (
                  <div className="file-card">
                    <div className="file-card-icon">{fileIcon(m.fileCard.type)}</div>
                    <div className="file-card-info">
                      <div className="file-card-name">{m.fileCard.name}</div>
                      <div className="file-card-summary">{m.fileCard.summary}</div>
                    </div>
                    <a className="file-card-btn" href={m.fileCard.url} download={m.fileCard.name}>⬇ Download</a>
                  </div>
                )}
                {m.content && (
                  <div
                    className="msg-bubble"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(m.content) }}
                  />
                )}
                <div className="msg-time">{m.time}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-row assistant">
              <div className="msg-avatar">⚡</div>
              <div className="msg-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
              onKeyDown={handleKey}
              placeholder="Ask anything or request a file…"
            />
            <button className="send-btn" onClick={send} disabled={loading || !input.trim()}>
              {loading ? "…" : "↑"}
            </button>
          </div>
          <div className="input-hint">Press Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
}

function fileIcon(type) {
  const icons = { xlsx: "📊", pdf: "📄", docx: "📝", pptx: "📊", csv: "📋", html: "🌐", txt: "📃" };
  return icons[type] || "📁";
}
