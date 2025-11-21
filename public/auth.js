// =====================
// auth.js  (GitHub Pages mock auth)
// =====================

const MOCK_USERS = [
  {
    username: "jparkerlee",
    password: "1234",
    role: "admin",
    dashboards: ["dashboard1.html", "dashboard2.html", "dashboard3.html", "dashboard4.html"]
  },
  {
    username: "jserraty",
    password: "1234",
    role: "user",
    dashboards: ["dashboard2.html", "dashboard3.html"]
  }
];

// Helpers
function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}
function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}
function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

// Login
function login(username, password) {
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return { success: false, message: "Invalid username or password." };
  }
  const storedUser = {
    username: user.username,
    role: user.role,
    dashboards: Array.isArray(user.dashboards) ? user.dashboards : []
  };
  setCurrentUser(storedUser);
  const firstDashboard =
    storedUser.dashboards.length > 0
      ? storedUser.dashboards[0]
      : "dashboard1.html";
  return {
    success: true,
    redirectTo: firstDashboard
  };
}

// Logout
function logout() {
  clearCurrentUser();
  window.location.href = "login.html";
}

// Guards
function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  }
}
function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
  }
}
function requireDashboardAccess(pageName) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const dashboards = Array.isArray(user.dashboards) ? user.dashboards : [];
  if (!dashboards.includes(pageName)) {
    alert("You do not have permission to access this dashboard.");
    const fallback = dashboards.length > 0 ? dashboards[0] : "login.html";
    window.location.href = fallback;
  }
}

// Update UI based on auth state
function updateNavAuthState() {
  const user = getCurrentUser();
  const loggedOutLinks = document.querySelectorAll(".nav-logged-out");
  const loggedInLinks = document.querySelectorAll(".nav-logged-in");
  const usernameSpans = document.querySelectorAll(".nav-username");
  const adminLinks = document.querySelectorAll('a[href="admin.html"]');

  if (user) {
    loggedOutLinks.forEach((el) => (el.style.display = "none"));
    loggedInLinks.forEach((el) => (el.style.display = "inline-block"));
    usernameSpans.forEach((el) => (el.textContent = user.username));
    adminLinks.forEach((el) =>
      (el.style.display = user.role === "admin" ? "inline-block" : "none")
    );
  } else {
    loggedOutLinks.forEach((el) => (el.style.display = "inline-block"));
    loggedInLinks.forEach((el) => (el.style.display = "none"));
    usernameSpans.forEach((el) => (el.textContent = ""));
    adminLinks.forEach((el) => (el.style.display = "none"));
  }

  const dashboardLinks = document.querySelectorAll("[data-dashboard]");
  const dashboards = user && Array.isArray(user.dashboards) ? user.dashboards : [];
  dashboardLinks.forEach((link) => {
    const page = link.getAttribute("data-dashboard");
    link.style.display =
      user && dashboards.includes(page) ? "inline-block" : "none";
  });
}

function highlightActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("header nav a[href]").forEach((link) => {
    if (link.getAttribute("href") === path) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavAuthState();
  highlightActiveNav();
});
