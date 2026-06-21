// ============================================
//  Typo Disk — app.js
//  Core game logic, keyboard, custom lessons
// ============================================

// ── STATE ──
let currentLevel  = 0;
let targetText    = "";
let startTime     = null;
let timerInterval = null;
let errors        = 0;
let totalTyped    = 0;
let isRunning     = false;
let lastWPM       = 0;
let lastAcc       = 100;
let lastLevelName = "Level 1";

// ── KEY ID MAP (special keys) ──
const KEY_MAP = {
  " "        : "key-space",
  "Backspace": "key-backspace",
  "Tab"      : "key-tab",
  "CapsLock" : "key-caps",
  "Enter"    : "key-enter",
  "Shift"    : "key-shift",
  "`"        : "key-backtick",
  "-"        : "key-minus",
  "="        : "key-equal",
  "["        : "key-bracketleft",
  "]"        : "key-bracketright",
  "\\"       : "key-backslash",
  ";"        : "key-semicolon",
  "'"        : "key-quote",
  ","        : "key-comma",
  "."        : "key-period",
  "/"        : "key-slash"
};

// ── RENDER COLOURED TEXT ──
function renderText(typed) {
  const display = document.getElementById("text-display");
  let html = "";
  for (let i = 0; i < targetText.length; i++) {
    let cls = "char";
    if (i < typed.length) {
      cls += typed[i] === targetText[i] ? " correct" : " wrong";
    } else if (i === typed.length) {
      cls += " cursor";
    }
    const ch = targetText[i] === " " ? "&nbsp;" : targetText[i];
    html += `<span class="${cls}">${ch}</span>`;
  }
  display.innerHTML = html;
}

// ── HIGHLIGHT KEYBOARD KEY ──
function highlightKey(char, correct) {
  const id = KEY_MAP[char] || ("key-" + char.toLowerCase());
  const el = document.getElementById(id);
  if (!el) return;
  const cls = correct ? "active-ok" : "active-err";
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 180);
}

// ── TIMER ──
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const s = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("time-display").textContent = s + "s";
    updateStats(document.getElementById("typing-input").value);
  }, 500);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ── WPM + ACCURACY ──
function updateStats(typed) {
  if (!startTime) return;
  const mins  = (Date.now() - startTime) / 60000;
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm   = mins > 0 ? Math.round(words / mins) : 0;
  const acc   = totalTyped > 0
    ? Math.round(((totalTyped - errors) / totalTyped) * 100)
    : 100;
  document.getElementById("wpm-display").textContent = wpm;
  document.getElementById("acc-display").textContent = acc + "%";
  return { wpm, acc };
}

// ── RESET UI ──
function resetUI() {
  document.getElementById("result").style.display    = "none";
  document.getElementById("wpm-display").textContent  = "0";
  document.getElementById("acc-display").textContent  = "100%";
  document.getElementById("time-display").textContent = "0s";
  const inp = document.getElementById("typing-input");
  inp.value    = "";
  inp.disabled = false;
  inp.focus();
  renderText("");
  stopTimer();
}

// ── START BUILT-IN LEVEL ──
function startGame() {
  const lvl  = levels[currentLevel];
  targetText    = lvl.text;
  lastLevelName = lvl.name;
  errors     = 0;
  totalTyped = 0;
  isRunning  = true;

  document.getElementById("level-badge").textContent =
    `LEVEL ${lvl.number} \u2014 ${lvl.name.toUpperCase()}`;
  document.getElementById("start-btn").textContent = "Restart";
  document.getElementById("start-btn").onclick = startGame;

  resetUI();
  startTimer();
}

// ── FINISH ──
function finishGame(typed) {
  isRunning = false;
  stopTimer();

  const mins  = (Date.now() - startTime) / 60000;
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm   = Math.round(words / mins);
  const acc   = totalTyped > 0
    ? Math.round(((totalTyped - errors) / totalTyped) * 100)
    : 100;

  // Save for share button
  lastWPM = wpm;
  lastAcc = acc;

  document.getElementById("typing-input").disabled = true;
  document.getElementById("result-wpm").textContent = wpm + " WPM";
  document.getElementById("result-details").textContent =
    `Accuracy: ${acc}%  \u2022  Time: ${Math.round(mins * 60)}s  \u2022  Errors: ${errors}`;
  document.getElementById("result").style.display = "block";

  // Show share button in result box if logged in
  const resultShareBtn = document.getElementById("result-share-btn");
  if (currentUser()) {
    resultShareBtn.style.display = "inline-block";
  } else {
    resultShareBtn.style.display = "none";
  }

  // Also update the floating share button
  const shareBtn = document.getElementById("share-score-btn");
  if (shareBtn && currentUser()) shareBtn.style.display = "inline-block";
}

// ── SHARE SCORE (called from buttons) ──
function triggerShareScore() {
  if (!currentUser()) {
    openAuthModal("login");
    return;
  }
  shareScore(lastWPM, lastAcc, lastLevelName);
}

// ── INPUT HANDLER ──
document.getElementById("typing-input").addEventListener("input", function () {
  if (!isRunning) return;
  const typed = this.value;
  totalTyped  = typed.length;

  const idx = typed.length - 1;
  if (idx >= 0 && idx < targetText.length) {
    const ok = typed[idx] === targetText[idx];
    if (!ok) errors++;
    highlightKey(typed[idx], ok);
  }

  renderText(typed);
  updateStats(typed);

  if (typed.length >= targetText.length) finishGame(typed);
});

// Prevent paste
document.getElementById("typing-input").addEventListener("paste", e => e.preventDefault());

// ── PHYSICAL KEY → KEYBOARD HIGHLIGHT ──
document.addEventListener("keydown", function (e) {
  if (!isRunning) return;
  const id = KEY_MAP[e.key] || ("key-" + e.key.toLowerCase());
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("active-ok");
    setTimeout(() => el.classList.remove("active-ok"), 140);
  }
});

// ==============================================
//  CUSTOM LESSONS
// ==============================================
let customLessons = [];
let pendingText   = "";

function toggleCustomPanel() {
  const panel  = document.getElementById("custom-panel");
  const toggle = document.getElementById("custom-toggle");
  const open   = panel.style.display === "block";
  panel.style.display = open ? "none" : "block";
  toggle.textContent  = (open ? "\u25B8" : "\u25BE") +
    " Custom Lessons \u2014 Upload your own .txt file";
}

function onDragOver(e) {
  e.preventDefault();
  document.getElementById("drop-zone").classList.add("drag-over");
}
function onDragLeave() {
  document.getElementById("drop-zone").classList.remove("drag-over");
}
function onDrop(e) {
  e.preventDefault();
  document.getElementById("drop-zone").classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) readFile(file);
}
function onFileSelected(e) {
  const file = e.target.files[0];
  if (file) readFile(file);
}

function readFile(file) {
  if (!file.name.endsWith(".txt")) { alert("Please upload a .txt file."); return; }
  const reader = new FileReader();
  reader.onload = function (e) {
    pendingText = e.target.result.replace(/\s+/g, " ").trim();
    const nameInput = document.getElementById("lesson-name-input");
    if (!nameInput.value) nameInput.value = file.name.replace(".txt", "");
    const preview = document.getElementById("file-preview");
    preview.style.display = "block";
    preview.textContent = pendingText.slice(0, 200) +
      (pendingText.length > 200 ? "\u2026" : "");
  };
  reader.readAsText(file);
}

function addCustomLesson() {
  if (!pendingText) { alert("Please upload a .txt file first."); return; }
  let name = document.getElementById("lesson-name-input").value.trim();
  if (!name) name = "Custom Lesson " + (customLessons.length + 1);
  customLessons.push({ name, text: pendingText });
  pendingText = "";
  document.getElementById("lesson-name-input").value    = "";
  document.getElementById("file-preview").style.display = "none";
  document.getElementById("file-preview").textContent   = "";
  document.getElementById("file-input").value           = "";
  renderLessonsList();
}

function useCustomLesson(idx) {
  const lesson  = customLessons[idx];
  targetText    = lesson.text;
  lastLevelName = lesson.name;
  errors     = 0;
  totalTyped = 0;
  isRunning  = false;

  document.getElementById("level-badge").textContent =
    "CUSTOM \u2014 " + lesson.name.toUpperCase();
  document.getElementById("start-btn").textContent = "Start";

  const inp = document.getElementById("typing-input");
  inp.value    = "";
  inp.disabled = true;

  document.getElementById("result").style.display    = "none";
  document.getElementById("wpm-display").textContent  = "0";
  document.getElementById("acc-display").textContent  = "100%";
  document.getElementById("time-display").textContent = "0s";

  renderText("");
  stopTimer();

  document.getElementById("start-btn").onclick = function () {
    errors     = 0;
    totalTyped = 0;
    isRunning  = true;
    document.getElementById("start-btn").textContent = "Restart";
    resetUI();
    startTimer();
  };

  document.getElementById("custom-panel").style.display = "none";
  document.getElementById("custom-toggle").textContent  =
    "\u25B8 Custom Lessons \u2014 Upload your own .txt file";

  alert('"' + lesson.name + '" loaded! Click Start to begin.');
}

function deleteCustomLesson(idx) {
  customLessons.splice(idx, 1);
  renderLessonsList();
}

function renderLessonsList() {
  const container = document.getElementById("lessons-items");
  if (customLessons.length === 0) {
    container.innerHTML = '<p class="no-lessons">No custom lessons yet.</p>';
    return;
  }
  container.innerHTML = customLessons.map((l, i) => `
    <div class="lesson-item">
      <span class="lesson-name">${l.name}</span>
      <span class="lesson-tag">${l.text.split(" ").length} words</span>
      <button class="use-btn" onclick="useCustomLesson(${i})">Use</button>
      <button class="del-btn" onclick="deleteCustomLesson(${i})" title="Remove">&#10005;</button>
    </div>
  `).join("");
}

// ── INIT ──
renderText("");
