# 🎙 MURF AI Narrative Engine — Setup Guide

Follow these steps to run this project on your machine.

---

## Step 1 — Get Your Free API Keys

### Gemini API (for AI text generation)
1. Go to: https://aistudio.google.com
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### Murf AI API (for voice narration)
1. Go to: https://murf.ai
2. Sign up for a free account
3. Go to **Dashboard → API** section
4. Copy your API key (starts with `ap2_...`)

---

## Step 2 — Set Up Your Environment Variables

1. Copy the file `.env.example` and rename it to `.env`.
2. Open the `.env` file and paste your keys:
```env
GEMINI_API_KEY=AIzaSy...
MURF_API_KEY=ap2_...
```
*Note: Your `.env` file is already listed in `.gitignore`, so it will stay safe and private.*

---

## Step 3 — Install Python & Dependencies

Make sure **Python 3.10+** is installed: https://python.org/downloads

Then open a Terminal/PowerShell in this folder and run:

```bash
python -m venv .venv

# Install required packages
.venv\Scripts\python.exe -m pip install flask flask-cors google-generativeai requests PyPDF2 python-dotenv
```

---

## Step 4 — Start the Server

```bash
.venv\Scripts\python.exe server.py
```

You should see: `Running on http://127.0.0.1:3000`

---

## Step 5 — Open the App

Open the file `index.html` directly in your browser. That's it! 🎉

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `quota exceeded` error | You've used up today's free requests. Wait until tomorrow or use a different API key |
| `model not found` error | Your Gemini API key may not support newer models. Try changing `MODEL_NAME` in `server.py` to `gemini-1.0-pro` |
| No voice plays | Check your Murf API key. The free tier has limited character credits per month |
| Port 3000 in use | Close other apps using port 3000, or change the port at the bottom of `server.py` |
