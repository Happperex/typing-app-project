// ============================================
//  Typo Disk — auth.js
//  Simple localStorage-based user auth.
//  Users are stored as: users:{ username: { password, joined } }
//  Current session stored in: session:{ username }
// ============================================

const AUTH_KEY    = "typodisk_users";
const SESSION_KEY = "typodisk_session";

// ── Helpers ──
function getUsers() {
  return JSON.parse(localStorage.getItem(AUTH_KEY) || "{}");
}
function saveUsers(users) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}
function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}
function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Current user ──
function currentUser() {
  return getSession();
}

// ── Register ──
function authRegister(username, password) {
  username = username.trim();
  if (!username || !password) return { ok: false, msg: "Fill in all fields." };
  if (username.length < 2)    return { ok: false, msg: "Username must be at least 2 characters." };
  if (password.length < 4)    return { ok: false, msg: "Password must be at least 4 characters." };

  const users = getUsers();
  if (users[username]) return { ok: false, msg: "Username already taken." };

  users[username] = { password, joined: Date.now() };
  saveUsers(users);
  saveSession({ username });
  return { ok: true };
}

// ── Login ──
function authLogin(username, password) {
  username = username.trim();
  const users = getUsers();
  if (!users[username])                      return { ok: false, msg: "User not found." };
  if (users[username].password !== password) return { ok: false, msg: "Wrong password." };
  saveSession({ username });
  return { ok: true };
}

// ── Logout ──
function authLogout() {
  clearSession();
  updateAuthUI();
}

// ── UI ──
function updateAuthUI() {
  const user      = currentUser();
  const authArea  = document.getElementById("auth-area");
  const userArea  = document.getElementById("user-area");
  const username  = document.getElementById("user-greeting");
  const shareBtn  = document.getElementById("share-score-btn");

  if (user) {
    authArea.style.display  = "none";
    userArea.style.display  = "flex";
    username.textContent    = user.username;
    if (shareBtn) shareBtn.style.display = "inline-block";
  } else {
    authArea.style.display  = "flex";
    userArea.style.display  = "none";
    if (shareBtn) shareBtn.style.display = "none";
  }
}

// ── Modal logic ──
function openAuthModal(tab) {
  document.getElementById("auth-modal").style.display = "flex";
  switchTab(tab || "login");
  clearAuthErrors();
}

function closeAuthModal() {
  document.getElementById("auth-modal").style.display = "none";
  clearAuthErrors();
}

function switchTab(tab) {
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-register").classList.toggle("active", tab === "register");
  document.getElementById("login-form").style.display    = tab === "login"    ? "block" : "none";
  document.getElementById("register-form").style.display = tab === "register" ? "block" : "none";
}

function clearAuthErrors() {
  document.getElementById("login-error").textContent    = "";
  document.getElementById("register-error").textContent = "";
}

function submitLogin() {
  const u = document.getElementById("login-username").value;
  const p = document.getElementById("login-password").value;
  const r = authLogin(u, p);
  if (r.ok) {
    closeAuthModal();
    updateAuthUI();
  } else {
    document.getElementById("login-error").textContent = r.msg;
  }
}

function submitRegister() {
  const u  = document.getElementById("reg-username").value;
  const p  = document.getElementById("reg-password").value;
  const p2 = document.getElementById("reg-password2").value;
  if (p !== p2) {
    document.getElementById("register-error").textContent = "Passwords do not match.";
    return;
  }
  const r = authRegister(u, p);
  if (r.ok) {
    closeAuthModal();
    updateAuthUI();
  } else {
    document.getElementById("register-error").textContent = r.msg;
  }
}

// Allow Enter key in form fields
function authKeydown(e, fn) {
  if (e.key === "Enter") fn();
}

// Close modal on backdrop click
document.getElementById("auth-modal").addEventListener("click", function (e) {
  if (e.target === this) closeAuthModal();
});

// Init
updateAuthUI();
