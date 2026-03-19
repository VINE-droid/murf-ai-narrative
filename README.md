# 🎙 MURF AI Narrative Engine

> A voice-driven interactive web experience powered by **Google Gemini** (AI text) and **Murf AI** (realistic voice narration).

---

## ✨ Features

- **📄 AI Summarizer** — Paste text or upload a PDF and get a concise AI-generated summary, read aloud in your chosen voice and tone
- **📖 Interactive Story Mode** — A branching choose-your-own-adventure story generated in real-time by AI, with full voice narration and genre-specific background music
- **🎤 7 Murf AI Voices** — Marcus, Cooper, Ken, Natalie, Hazel, Terrell, Edmund
- **🌗 Light/Dark Mode** — Persistent theme toggle
- **🎵 Dynamic BGM** — Each story genre has its own background music track

---

## 🖥️ Demo Preview

| Summarizer Tab | Story Tab |
|---|---|
| Upload a PDF or paste text → pick a tone → generate a summary → listen | Pick a genre & tone → start an adventure → make choices → hear it narrated |

---

## 🚀 How to Run Locally

### 1. Get Your Free API Keys

| Service | Where to Get It |
|---|---|
| **Google Gemini** | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| **Murf AI** | [murf.ai](https://murf.ai) → Dashboard → API |

### 2. Clone the Repo

```bash
git clone https://github.com/VINE-droid/murf-ai-narrative.git
cd murf-ai-narrative
```

### 3. Set Up Your API Keys

Create a file named `.env` in the root folder (or copy `.env.example`) and add your keys:

```env
GEMINI_API_KEY=your_key_here
MURF_API_KEY=your_key_here
```

### 4. Install Python Dependencies

Make sure **Python 3.10+** is installed, then run:

```bash
python -m venv .venv

# Windows
.venv\Scripts\python.exe -m pip install flask flask-cors google-generativeai requests PyPDF2 python-dotenv

# Mac/Linux
.venv/bin/pip install flask flask-cors google-generativeai requests PyPDF2 python-dotenv
```

### 5. Start the Backend Server

```bash
# Windows
.venv\Scripts\python.exe server.py

# Mac/Linux
.venv/bin/python server.py
```

You should see: `Running on http://127.0.0.1:3000`

### 6. Open the App

Open `index.html` directly in your browser. **That's it!** 🎉

---

## 🗂️ Project Structure

```
murf-ai-narrative/
├── index.html        # Frontend UI
├── style.css         # All styling & themes
├── script.js         # Frontend logic
├── server.py         # Python Flask backend (API routes)
├── check_voices.py   # Utility: list available Murf voices
├── models.json       # Gemini model info
└── SETUP.md          # Detailed setup guide
```

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| `quota exceeded` | You've hit today's free Gemini limit. Wait until tomorrow or use a different key |
| `model not found` | Change `MODEL_NAME` in `server.py` to `gemini-1.5-flash` |
| No voice plays | Check your Murf API key. Free tier has monthly character limits |
| Port 3000 in use | Change the port at the bottom of `server.py` and in `script.js` line 5 |

---

## 🛠️ Built With

- [Google Gemini API](https://aistudio.google.com) — AI text generation
- [Murf AI API](https://murf.ai) — Text-to-speech voice narration
- [Flask](https://flask.palletsprojects.com/) — Python backend
- Vanilla HTML, CSS & JavaScript — No frameworks needed
