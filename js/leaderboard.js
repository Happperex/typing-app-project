// ============================================
//  Typo Disk — leaderboard.js
//  Scores stored in localStorage per user.
//  Key: typodisk_scores  → array of entries:
//  { username, wpm, accuracy, level, date }
// ============================================

const SCORES_KEY = "typodisk_scores";

function getScores() {
  return JSON.parse(localStorage.getItem(SCORES_KEY) || "[]");
}

function saveScores(scores) {
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

// ── Share a score to the leaderboard ──
function shareScore(wpm, accuracy, levelName) {
  const user = currentUser();
  if (!user) {
    alert("Please log in to share your score.");
    return;
  }

  const scores = getScores();
  scores.push({
    username : user.username,
    wpm      : wpm,
    accuracy : accuracy,
    level    : levelName,
    date     : Date.now()
  });
  saveScores(scores);

  openLeaderboard();
}

// ── Open / close leaderboard modal ──
function openLeaderboard() {
  document.getElementById("lb-modal").style.display = "flex";
  renderLeaderboard();
}

function closeLeaderboard() {
  document.getElementById("lb-modal").style.display = "none";
}

document.getElementById("lb-modal").addEventListener("click", function (e) {
  if (e.target === this) closeLeaderboard();
});

// ── Render leaderboard table ──
function renderLeaderboard() {
  const scores = getScores();
  const tbody  = document.getElementById("lb-tbody");

  if (scores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#555;padding:20px;">No scores yet — be the first!</td></tr>';
    return;
  }

  // Sort by WPM descending
  const sorted = [...scores].sort((a, b) => b.wpm - a.wpm);

  const me = currentUser();

  tbody.innerHTML = sorted.slice(0, 50).map((s, i) => {
    const isMe   = me && s.username === me.username;
    const medal  = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
    const date   = new Date(s.date).toLocaleDateString();
    const rowCls = isMe ? ' class="my-row"' : "";
    return `
      <tr${rowCls}>
        <td style="text-align:center">${medal}</td>
        <td>${s.username}${isMe ? ' <span class="you-tag">you</span>' : ""}</td>
        <td style="color:#e94560;font-weight:bold">${s.wpm}</td>
        <td style="color:#4ecca3">${s.accuracy}%</td>
        <td style="color:#666;font-size:0.78rem">${date}</td>
      </tr>
    `;
  }).join("");
}

// ── Filter by tab (all / mine) ──
function lbFilter(tab) {
  document.getElementById("lb-tab-all").classList.toggle("active", tab === "all");
  document.getElementById("lb-tab-me").classList.toggle("active",  tab === "me");

  const me     = currentUser();
  const scores = getScores();
  const tbody  = document.getElementById("lb-tbody");

  let list = [...scores].sort((a, b) => b.wpm - a.wpm);
  if (tab === "me") {
    if (!me) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#555;padding:20px;">Log in to see your scores.</td></tr>';
      return;
    }
    list = list.filter(s => s.username === me.username);
  }

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#555;padding:20px;">No scores here yet.</td></tr>';
    return;
  }

  const globalList = [...scores].sort((a, b) => b.wpm - a.wpm);

  tbody.innerHTML = list.slice(0, 50).map((s) => {
    const globalRank = globalList.findIndex(x => x === s) + 1;
    const date = new Date(s.date).toLocaleDateString();
    return `
      <tr class="my-row">
        <td style="text-align:center">#${globalRank}</td>
        <td>${s.username}</td>
        <td style="color:#e94560;font-weight:bold">${s.wpm}</td>
        <td style="color:#4ecca3">${s.accuracy}%</td>
        <td style="color:#666;font-size:0.78rem">${date}</td>
      </tr>
    `;
  }).join("");
}
