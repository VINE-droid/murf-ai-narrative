/* ============================================================
   Voice Narrative Engine — script.js
   ============================================================ */

const API = "http://localhost:3000";

/* ── TAB SWITCHING ─────────────────────────────────────────── */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // UI tabs logic
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");

    // Dynamic Theme logic
    document.body.className = document.body.className.replace(/\b(bg-|theme-)\S+/g, '');
    if (btn.dataset.tab === "summarize") {
      document.body.classList.add("theme-formal");
    } else if (btn.dataset.tab === "story") {
      updateGenreBackground();
    }

    if (localStorage.getItem("murf-theme") === "light") {
      document.body.classList.add("light-mode");
    }
  });
});

/* ── HELPERS & DYNAMIC THEMES ──────────────────────────────── */
function updateGenreBackground() {
  const genreSelect = document.getElementById("story-genre");
  if (!genreSelect) return;
  document.body.className = document.body.className.replace(/\bbg-\S+/g, '');
  document.body.classList.add(`bg-${genreSelect.value}`);
  
  if (localStorage.getItem("murf-theme") === "light") {
    document.body.classList.add("light-mode");
  }
}

// Ensure theme formal is loaded by default as Summarize is the default tab
document.body.classList.add("theme-formal");

/* ── THEME TOGGLE ──────────────────────────────────────────── */
const themeToggleBtn = document.getElementById("theme-toggle");

// Check for saved theme
if (localStorage.getItem("murf-theme") === "light") {
  document.body.classList.add("light-mode");
  themeToggleBtn.textContent = "☾";
}

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    themeToggleBtn.textContent = "☾";
    localStorage.setItem("murf-theme", "light");
  } else {
    themeToggleBtn.textContent = "☀";
    localStorage.setItem("murf-theme", "dark");
  }
});

/* ── HELPERS ───────────────────────────────────────────────── */
function setLoading(btn, loading) {
  const text   = btn.querySelector(".btn-text");
  const loader = btn.querySelector(".btn-loader");
  btn.disabled = loading;
  if (text)   text.classList.toggle("hidden", loading);
  if (loader) loader.classList.toggle("hidden", !loading);
}

function showError(elId, msg) {
  const el = document.getElementById(elId);
  el.textContent = "⚠ " + msg;
  el.classList.remove("hidden");
}

function clearError(elId) {
  const el = document.getElementById(elId);
  el.textContent = "";
  el.classList.add("hidden");
}

async function postJSON(path, body) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* ── CUSTOM PLAYER HELPERS ─────────────────────────────────── */
function setupCustomPlayer(prefix) {
  const audio = document.getElementById(`${prefix}-audio`);
  const ui = document.getElementById(`${prefix}-player-ui`);
  const playBtn = document.getElementById(`${prefix}-play-btn`);
  const timeline = document.getElementById(`${prefix}-timeline`);
  const timeDisplay = document.getElementById(`${prefix}-time`);
  const durationDisplay = document.getElementById(`${prefix}-duration`);

  function formatTime(s) {
    if (isNaN(s)) return "0:00";
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  // Toggle play/pause
  playBtn.addEventListener("click", () => {
    if (audio.paused) audio.play();
    else audio.pause();
  });

  // Sync icon with audio state
  audio.addEventListener("play", () => playBtn.textContent = "⏸");
  audio.addEventListener("pause", () => playBtn.textContent = "▶");

  // Sync timeline with audio
  audio.addEventListener("timeupdate", () => {
    timeline.value = audio.currentTime;
    timeDisplay.textContent = formatTime(audio.currentTime);
  });

  // Set duration when loaded
  audio.addEventListener("loadedmetadata", () => {
    timeline.max = audio.duration;
    durationDisplay.textContent = formatTime(audio.duration);
  });

  // Seek when user drags timeline
  timeline.addEventListener("input", () => {
    audio.currentTime = timeline.value;
  });

  return { audio, ui };
}

async function speakText(text, voice, customPlayer, speakBtn) {
  speakBtn.disabled = true;
  speakBtn.textContent = "⟳ Generating…";
  try {
    const data = await postJSON("/speak", { text, voice });
    if (data.audio_url) {
      customPlayer.audio.src = data.audio_url;
      customPlayer.ui.classList.remove("hidden");
      customPlayer.audio.play();
    } else {
      throw new Error("No audio URL returned");
    }
  } catch (err) {
    alert("Voice error: " + err.message);
  } finally {
    speakBtn.disabled = false;
    speakBtn.textContent = "▶ Listen";
  }
}

/* ============================================================
   SUMMARY MODE
   ============================================================ */
const summarizeBtn     = document.getElementById("summarize-btn");
const speakSummaryBtn  = document.getElementById("speak-summary-btn");
const summaryPlayerUI  = setupCustomPlayer("summary");
const summaryOutput    = document.getElementById("summary-output");
const summaryTextEl    = document.getElementById("summary-text");

let lastSummaryText = "";
let lastSummaryVoice = "male";

const summaryFileInput = document.getElementById("summary-file");
const fileNameDisplay  = document.getElementById("file-name-display");

summaryFileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    fileNameDisplay.textContent = e.target.files[0].name;
    fileNameDisplay.style.color = "var(--accent)";
    removePdfBtn.classList.remove("hidden");
  } else {
    fileNameDisplay.textContent = "Upload PDF Document";
    fileNameDisplay.style.color = "inherit";
    removePdfBtn.classList.add("hidden");
  }
});

const removePdfBtn = document.getElementById("remove-pdf-btn");
removePdfBtn.addEventListener("click", () => {
  summaryFileInput.value = "";
  fileNameDisplay.textContent = "Upload PDF Document";
  fileNameDisplay.style.color = "inherit";
  removePdfBtn.classList.add("hidden");
});

const clearSummaryBtn = document.getElementById("clear-summary-btn");
clearSummaryBtn.addEventListener("click", () => {
  // Clear all inputs and outputs
  document.getElementById("summary-input").value = "";
  summaryFileInput.value = "";
  fileNameDisplay.textContent = "Upload PDF Document";
  fileNameDisplay.style.color = "inherit";
  removePdfBtn.classList.add("hidden");
  document.getElementById("summary-tone").selectedIndex = 0;
  summaryOutput.classList.add("hidden");
  summaryTextEl.textContent = "";
  clearError("summary-error");
  lastSummaryText = "";
  lastSummaryVoice = "";
  summaryPlayerUI.ui.classList.add("hidden");
  summaryPlayerUI.audio.src = "";
});

summarizeBtn.addEventListener("click", async () => {
  clearError("summary-error");
  summaryOutput.classList.add("hidden");

  const text = document.getElementById("summary-input").value.trim();
  const tone = document.getElementById("summary-tone").value;
  const voice = document.getElementById("summary-voice").value;
  const file = summaryFileInput.files[0];

  if (!text && !file) {
    showError("summary-error", "Please enter some text or upload a PDF to summarize.");
    return;
  }

  setLoading(summarizeBtn, true);

  try {
    let data;
    
    // If a file is attached, we must send as multipart/form-data
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tone", tone);
      if (text) formData.append("text", text);
      
      const res = await fetch(`${API}/summarize`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }
      data = await res.json();
    } else {
      // Otherwise, use standard JSON payload
      data = await postJSON("/summarize", { text, tone });
    }
    
    // Fallback if voice wasn't asked for earlier
    data.voice = voice;
    lastSummaryText  = data.summary;
    lastSummaryVoice = voice;

    summaryTextEl.textContent = data.summary;
    summaryOutput.classList.remove("hidden");
    summaryPlayerUI.ui.classList.add("hidden");
    speakSummaryBtn.textContent = "▶ Listen";
  } catch (err) {
    showError("summary-error", err.message);
  } finally {
    setLoading(summarizeBtn, false);
  }
});

speakSummaryBtn.addEventListener("click", () => {
  if (!lastSummaryText) return;
  speakText(lastSummaryText, lastSummaryVoice, summaryPlayerUI, speakSummaryBtn);
});

// Regenerate button: re-runs the summarize flow with the same inputs
const regenerateSummaryBtn = document.getElementById("regenerate-summary-btn");
regenerateSummaryBtn.addEventListener("click", () => {
  summarizeBtn.click();
});

/* ============================================================
   STORY MODE
   ============================================================ */
const startStoryBtn    = document.getElementById("start-story-btn");
const choiceButtonsDiv = document.getElementById("choice-buttons");
const speakStoryBtn    = document.getElementById("speak-story-btn");
const storyPlayerUI    = setupCustomPlayer("story");
const storyOutput      = document.getElementById("story-output");
const storySegmentsEl  = document.getElementById("story-segments");
const resetStoryBtn    = document.getElementById("reset-story-btn");
const storyControls    = document.getElementById("story-controls");
const storyPremise     = document.getElementById("story-premise");
const storyGenre       = document.getElementById("story-genre");
const storyTone        = document.getElementById("story-tone");

let storyContext   = "";
let lastSegment    = "";
let storyVoice     = "male";
let storyActive    = false;

/* --- BGM LOGIC --- */
const bgmPlayer = document.getElementById("bgm-player");
const toggleBgmBtn = document.getElementById("toggle-bgm-btn");
const genreSelect = document.getElementById("story-genre");

const genreMusicMap = {
  "cyberpunk": "https://pixabay.com/music/download/track-110059.mp3",
  "fantasy": "https://pixabay.com/music/download/track-112191.mp3",
  "scifi": "https://pixabay.com/music/download/track-145634.mp3",
  "post-apocalyptic": "https://pixabay.com/music/download/track-142816.mp3",
  "cozy-mystery": "https://pixabay.com/music/download/track-114510.mp3",
  "steampunk": "https://pixabay.com/music/download/track-119131.mp3",
  "high-fantasy": "https://pixabay.com/music/download/track-152722.mp3",
  "noir": "https://pixabay.com/music/download/track-112196.mp3",
  "historical": "https://pixabay.com/music/download/track-114631.mp3",
  "superhero": "https://pixabay.com/music/download/track-124014.mp3",
  "lovecraftian": "https://pixabay.com/music/download/track-114227.mp3",
  "zombie": "https://pixabay.com/music/download/track-21849.mp3"
};

let isBgmPlaying = false;

function updateBgmTrack() {
  const currentGenre = genreSelect.value;
  const trackUrl = genreMusicMap[currentGenre];
  
  if (trackUrl && bgmPlayer.src !== trackUrl) {
    bgmPlayer.src = trackUrl;
    bgmPlayer.volume = 0.15; // Keep BGM soft
    if (isBgmPlaying) {
      bgmPlayer.play().catch(e => console.warn("Audio play blocked:", e));
    }
  }
}

toggleBgmBtn.addEventListener("click", () => {
  if (isBgmPlaying) {
    bgmPlayer.pause();
    isBgmPlaying = false;
    toggleBgmBtn.classList.remove("playing");
    toggleBgmBtn.querySelector(".btn-text").textContent = "♫ Toggle Vibes";
  } else {
    updateBgmTrack();
    bgmPlayer.play().then(() => {
      isBgmPlaying = true;
      toggleBgmBtn.classList.add("playing");
      toggleBgmBtn.querySelector(".btn-text").textContent = "ılı Pause Vibes";
    }).catch(e => {
      console.error("Playback failed", e);
      alert("Could not play audio. Please ensure media can play.");
    });
  }
});

genreSelect.addEventListener("change", () => {
  updateBgmTrack();
  if (document.getElementById("tab-story").classList.contains("active")) {
    updateGenreBackground();
  }
});

/* --- INITIALIZE --- */
updateBgmTrack();

function appendSegment(text, playerChoiceText) {
  const div = document.createElement("div");
  div.className = "story-segment fade-in";
  
  if (playerChoiceText) {
    const choiceLabel = document.createElement("div");
    choiceLabel.className = "segment-type";
    choiceLabel.textContent = `→ ${playerChoiceText}`;
    div.appendChild(choiceLabel);
  }

  const p = document.createElement("p");
  p.textContent = text;
  div.appendChild(p);

  storySegmentsEl.appendChild(div);
  storySegmentsEl.scrollTop = storySegmentsEl.scrollHeight;
}

function renderDynamicOptions(options) {
  choiceButtonsDiv.innerHTML = "";
  
  if (!options || options.length === 0) {
     return; // No options, maybe end of story snippet
  }

  options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = `choice-btn ${index === 0 ? 'explore-btn' : 'escape-btn'} fade-in`;
    btn.innerHTML = `
        <span>${opt.text}</span>
        <small>${opt.description || ''}</small>
    `;
    btn.addEventListener("click", () => {
      generateStory(opt.text);
    });
    choiceButtonsDiv.appendChild(btn);
  });
}

async function generateStory(action = null) {
  const isStart = (action === null);
  const btn = isStart ? startStoryBtn : null;
  const genre = storyGenre.value;
  const tone = storyTone.value;

  clearError("story-error");
  if (btn) setLoading(btn, true);
  if (!isStart) {
    choiceButtonsDiv.classList.add("hidden");
  }

  try {
    const data = await postJSON("/story", {
      genre,
      tone,
      action: action || null,
      context: storyContext,
      premise: storyPremise.value
    });

    const seg = data.segment;
    lastSegment = seg;
    storyContext += `\n${action ? 'User chose to: ' + action : 'Opening'}: ${seg}`;
    
    appendSegment(seg, action);

    storyOutput.classList.remove("hidden");
    storyPlayerUI.ui.classList.add("hidden");
    speakStoryBtn.textContent = "▶ Narrate Latest";

    renderDynamicOptions(data.options);
    
    setTimeout(() => {
      choiceButtonsDiv.classList.remove("hidden");
    }, 500);

  } catch (err) {
    showError("story-error", err.message);
  } finally {
    if (btn) setLoading(btn, false);
  }
}

startStoryBtn.addEventListener("click", () => {
  storyContext = "";
  lastSegment  = "";
  storySegmentsEl.innerHTML = "";
  storyOutput.classList.add("hidden");
  choiceButtonsDiv.classList.add("hidden");
  choiceButtonsDiv.innerHTML = ""; // Clear old dynamic buttons

  storyVoice    = document.getElementById("story-voice").value;
  storyActive   = true;
  storyControls.style.opacity = "0.5";
  storyControls.style.pointerEvents = "none";
  generateStory(null);
});

speakStoryBtn.addEventListener("click", () => {
  if (!lastSegment) return;
  speakText(lastSegment, storyVoice, storyPlayerUI, speakStoryBtn);
});

resetStoryBtn.addEventListener("click", () => {
  storyContext  = "";
  lastSegment   = "";
  storyActive   = false;

  storySegmentsEl.innerHTML = "";
  storyOutput.classList.add("hidden");
  storyPlayerUI.ui.classList.add("hidden");

  storyControls.style.opacity      = "1";
  storyControls.style.pointerEvents = "auto";
  startStoryBtn.classList.remove("hidden");
  clearError("story-error");
});