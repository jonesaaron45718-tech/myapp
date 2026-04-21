# myapp — Complete Setup & Deployment Guide
### For Complete Beginners — Every Step Explained

---

## PART 1: YOUR ACCOUNTS — WHAT YOU ALREADY HAVE

Good news! From your screenshots, you already have:

| Account | Status | Username/Details |
|---|---|---|
| **GitHub** | ✅ Ready | jonesaaron45718-tech |
| **Vercel** | ✅ Ready | Logged in via Google |
| **Gemini API** | ✅ Ready | 2 keys provided |
| **e2b.dev** | ✅ Ready | Key provided |
| **Together AI** | ✅ Ready | Key provided |

No new accounts needed! Let's go straight to deploying.

---

## PART 2: FIXING YOUR BROTHER'S GITHUB SETUP (IMPORTANT — DO THIS FIRST)

Your brother uploaded something to GitHub from the command prompt. Before you can upload your new app, you need to clean that up. Here's exactly what to do:

### Step 1 — Install Git (if not already installed)
1. Go to **https://git-scm.com/download/win**
2. Click the big green download button
3. Run the installer — click "Next" on every screen, keep all defaults
4. When done, right-click your Desktop and look for **"Git Bash Here"** — if you see it, Git is installed

### Step 2 — Install Node.js
1. Go to **https://nodejs.org**
2. Click the big button that says **"LTS"** (the left one)
3. Run the installer — click Next on every screen
4. When done, open Command Prompt (press Windows key, type "cmd", press Enter)
5. Type `node -v` and press Enter — you should see something like `v20.x.x`

### Step 3 — Create a NEW GitHub Repository for your app
Your brother's repo might have old stuff. Let's create a clean one:

1. Go to **https://github.com**
2. Log in to your account (jonesaaron45718-tech)
3. Click the **"+"** button at the top right
4. Click **"New repository"**
5. Repository name: type `myapp`
6. Make sure **"Private"** is selected (keeps your API keys safer)
7. ⚠️ **Do NOT** check "Add a README file"
8. Click **"Create repository"**
9. GitHub will show you a page with setup commands — **keep this page open**, you'll need it soon

---

## PART 3: SETTING UP THE APP ON YOUR COMPUTER

### Step 1 — Download your app files
You received a ZIP file called `myapp.zip`. Do this:
1. Find the ZIP file
2. Right-click it → **"Extract All"**
3. Choose your Desktop as the destination
4. Click Extract
5. You should now have a folder called `myapp` on your Desktop

### Step 2 — Open the folder in Command Prompt
1. Press the **Windows key**
2. Type `cmd` and press Enter
3. Type this exactly and press Enter:
   ```
   cd Desktop\myapp
   ```
4. You should see the path change to `...\Desktop\myapp>`

### Step 3 — Install the app's dependencies
In the Command Prompt (still in the myapp folder), type:
```
npm install
```
Press Enter. Wait about 1–2 minutes. You'll see a lot of text scrolling — that's normal.

### Step 4 — Remove your brother's old Git setup
In the same Command Prompt window, type these commands **one at a time**, pressing Enter after each:

**First**, check if there's an old connection:
```
git remote -v
```
If you see something like `origin  https://github.com/...` appear, type this to remove it:
```
git remote remove origin
```
If you see `error: No such remote 'origin'` — that's fine, just means there was nothing to remove.

Now reset Git completely for a fresh start:
```
git init
git add .
git commit -m "Initial commit — myapp"
```

### Step 5 — Connect to YOUR new GitHub repo
Go back to the GitHub page from Step 3 above (your new `myapp` repo page).
You'll see a section called **"…or push an existing repository from the command line"**
Copy the second line — it looks like:
```
git remote add origin https://github.com/jonesaaron45718-tech/myapp.git
```
Paste it into Command Prompt and press Enter.

Then type:
```
git branch -M main
git push -u origin main
```
Press Enter. GitHub may ask for your username and password — enter them.

✅ **Your code is now on GitHub!**

---

## PART 4: DEPLOYING TO VERCEL (Publishing Your App)

### Step 1 — Go to Vercel
1. Go to **https://vercel.com**
2. Click **"Sign in"** — since you logged in with Google, click **"Continue with Google"**
3. Choose the same Google account you used before
4. You should see your Vercel dashboard

### Step 2 — Import your GitHub project
Since you logged in with Google (not GitHub), you need to connect GitHub to Vercel first:

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. On the left side you'll see **"Import Git Repository"**
3. Click **"GitHub"** — Vercel will ask you to connect your GitHub account
4. Click **"Install Vercel"** — this opens GitHub in a new tab
5. On the GitHub page, select **"Only select repositories"**
6. Choose **myapp** from the list
7. Click **"Install"**
8. Go back to Vercel — you should now see your `myapp` repository listed
9. Click **"Import"** next to it

### Step 3 — Configure the project settings
On the next screen:
- **Project Name**: `myapp` (or change it to whatever you like — this becomes part of your URL)
- **Framework Preset**: Vercel should auto-detect **Vite** — if not, select it manually
- **Root Directory**: Leave as `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

**⚠️ DO NOT click Deploy yet** — you need to add your API keys first!

### Step 4 — Add your API keys (Environment Variables)
This is the most important step. Your keys must NEVER be in the code itself.

1. Click **"Environment Variables"** to expand that section
2. Add each variable below by typing the Name, pasting the Value, then clicking **"Add"**:

| Name | Value |
|---|---|
| `GEMINI_API_KEY_1` | `AIzaSyDgoLK6SSX9zKEUOaX2ywiKFNeWacYahws` |
| `GEMINI_API_KEY_2` | `AIzaSyAyNw6uVgUZ20uBEu-JvkeLIF-T7Ds0d3A` |
| `E2B_API_KEY` | `e2b_f31b0bd25db3c09549af9d7a97578c9ce38462bf` |
| `TOGETHER_API_KEY` | `tgp_v1_5HpUKNMLKFTkwEb4SXxIOddFIhbHA6YZ0PiVCfQ98zg` |

After adding all 4 keys, you should see them listed.

### Step 5 — Deploy!
1. Click the big **"Deploy"** button
2. Vercel will start building your app — you'll see a progress log
3. This takes about 2–3 minutes
4. When you see a big **"🎉 Congratulations!"** screen, your app is live!
5. Click **"Continue to Dashboard"**
6. You'll see a URL like `myapp-xxxxx.vercel.app` — **click it to open your app!**

---

## PART 5: YOUR APP'S ACCESS CODE

Your app is protected by an access code. To log in:
- **Access Code**: `myapp2024`

You can change this by opening `src/App.jsx`, finding the line:
```javascript
const ACCESS_CODE = "myapp2024";
```
And changing `myapp2024` to anything you want. Then follow the "Making Updates" section below.

---

## PART 6: TESTING YOUR APP

Once your app is live, test each feature:

### ✅ Test 1 — Basic Chat
Type: `What is compound interest and how does it work?`
Expected: A well-structured response with headers and a key takeaways section

### ✅ Test 2 — Excel File
Type: `Create a financial model Excel file for a tech startup with 3-year projections`
Expected: A file card appears with a Download button — the Excel file should have multiple sheets

### ✅ Test 3 — PDF
Type: `Create a professional PDF report about the global AI industry in 2024`
Expected: A downloadable PDF with proper formatting

### ✅ Test 4 — Word Document
Type: `Write a professional business proposal Word document for a coffee shop`
Expected: A .docx download

### ✅ Test 5 — PowerPoint
Type: `Create a 10-slide PowerPoint presentation on climate change`
Expected: A .pptx download

### ✅ Test 6 — Image Generation
Type: `Generate an image of a futuristic city at night with neon lights`
Expected: An image appears in the chat

### ✅ Test 7 — Dark/Light Mode
Click the ☀️/🌙 button in the top right — the theme should switch

### ✅ Test 8 — Conversation History
Start a new chat (sidebar), then go back to the old one — messages should be saved

---

## PART 7: MAKING UPDATES LATER

If you want to change anything in the app:

1. Edit the files on your computer (use Notepad, or better yet install VS Code from code.visualstudio.com)
2. Open Command Prompt in the myapp folder
3. Type these commands:
   ```
   git add .
   git commit -m "Update: describe what you changed"
   git push
   ```
4. Vercel automatically detects the push and rebuilds your app in ~2 minutes!

---

## PART 8: MONITORING API USAGE (So You Don't Get Billed)

### Gemini (Google AI Studio)
- Go to **https://aistudio.google.com**
- Click your account icon → **"API Keys"**
- The free tier gives you **15 requests per minute** per key (you have 2 keys, so ~30/min)
- No billing unless you upgrade — you're safe on the free tier

### e2b.dev
- Go to **https://e2b.dev/dashboard**
- Click **"Usage"** in the left sidebar
- Free tier: **100 sandbox hours/month**
- Each file generation uses about 1–2 minutes, so you get ~3,000–6,000 file generations free per month

### Together AI (Image Generation)
- Go to **https://api.together.xyz**
- Click **"Usage"** in the sidebar
- The FLUX.1-schnell-Free model is completely free with no limits

---

## PART 9: WHAT TO DO IF SOMETHING BREAKS

### Problem: App shows white screen / won't load
**Fix**: Go to Vercel dashboard → your project → "Deployments" tab → click the latest deployment → check the build logs for red error text

### Problem: Chat says "Something went wrong"
**Fix**: Your Gemini API keys may have hit the rate limit. Wait 1 minute and try again.

### Problem: File generation fails
**Fix**: The e2b sandbox takes ~30 seconds. If it fails, try a simpler request first. Check e2b.dev dashboard for errors.

### Problem: Images don't generate
**Fix**: Check that your Together AI key is correctly entered in Vercel's Environment Variables.

### Problem: Need to update an API key
**Fix**: Vercel Dashboard → Your Project → Settings → Environment Variables → click the key → Edit → paste new value → Save → Redeploy

---

## PART 10: YOUR APP URL

After deployment, share this with yourself (bookmark it):
- Your app will be at: `https://myapp-[random].vercel.app`
- You can get a custom URL later by going to Vercel → Project → Settings → Domains

---

## QUICK REFERENCE CARD

| What | Where |
|---|---|
| Your app | `https://[your-url].vercel.app` |
| Access code | `myapp2024` |
| Change anything | Edit files → `git add . && git commit -m "msg" && git push` |
| Add env variable | Vercel Dashboard → Project → Settings → Environment Variables |
| Check errors | Vercel Dashboard → Project → Deployments → Latest |
| Gemini usage | aistudio.google.com |
| e2b usage | e2b.dev/dashboard |

---

*Built with React + Vite (frontend), Vercel Serverless Functions (backend), Gemini 1.5 Flash (AI), e2b Code Interpreter (file generation), Together AI FLUX (image generation)*
