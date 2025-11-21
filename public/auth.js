// =====================
// auth.js  (GitHub Pages mock auth)
// =====================

// Mock users (demo only – NOT secure)
const MOCK_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    dashboards: ["dashboard1.html", "dashboard2.html", "dashboard3.html", "dashboard4.html"]
  },
  {
    username: "jjparkerlee",
    password: "123456",
    role: "user",
    dashboards: ["dashboard2.html", "dashboard3.html"]
  }
];


// ===== LocalStorage helpers =====

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Bad currentUser JSON, clearing", e);
    localStorage.removeItem("currentUser");
    return null;
  }
}

function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}


// ===== Core auth functions =====

// Called from login.html
// Returns: { success: boolean, message?: string, redirectTo?: string }
function login(username, password) {
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return { success: false, message: "Invalid username or password." };
  }

  // Store full user (without password)
  const storedUser = {
    username: user.username,
    role: user.role,
    dashboards: Array.isArray(user.dashboards) ? user.dashboards : []
  };

  setCurrentUser(storedUser);

  // Decide first dashboard they should see
  const firstDashboard =
    storedUser.dashboards.length > 0
      ? storedUser.dashboards[0]
      : "dashboard1.html";

  return {
    success: true,
    redirectTo: firstDashboard
  };
}

function logout() {
  clearCurrentUser();
  window.location.href = "login.html";
}


// ===== Guards =====

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

  let allowed = false;
  for (let i = 0; i < dashboards.length; i++) {
    if (dashboards[i] === pageName) {
      allowed = true;
      break;
    }
  }

  if (!allowed) {
    alert("You do not have permission to access this dashboard.");
    const fallback = dashboards.length > 0 ? dashboards[0] : "login.html";
    window.location.href = fallback;
  }
}


// ===== Nav / UI wiring =====

function updateNavAuthState() {
  const user = getCurrentUser();

  const loggedOutLinks = document.querySelectorAll(".nav-logged-out");
  const loggedInLinks = document.querySelectorAll(".nav-logged-in");
  const usernameSpans = document.querySelectorAll(".nav-username");
  const adminLinks = document.querySelectorAll('a[href="admin.html"]');

  if (user) {
    loggedOutLinks.forEach((el) => (el.style.display = "inline-block"));
    loggedInLinks.forEach((el) => (el.style.display = "inline-block"));
    usernameSpans.forEach((el) => (el.textContent = user.username));

    adminLinks.forEach((el) => {
      el.style.display = user.role === "admin" ? "inline-block" : "none";
    });
  } else {
    loggedOutLinks.forEach((el) => (el.style.display = "inline-block"));
    loggedInLinks.forEach((el) => (el.style.display = "none"));
    usernameSpans.forEach((el) => (el.textContent = ""));
    adminLinks.forEach((el) => (el.style.display = "none"));
  }

  // Hide dashboard links user doesn't have access to
  const dashboardLinks = document.querySelectorAll("[data-dashboard]");
  const dashboards =
    user && Array.isArray(user.dashboards) ? user.dashboards : [];

  dashboardLinks.forEach((link) => {
    const page = link.getAttribute("data-dashboard");

    let allowed = false;
    for (let i = 0; i < dashboards.length; i++) {
      if (dashboards[i] === page) {
        allowed = true;
        break;
      }
    }

    if (!user || !allowed) {
      link.style.display = "none";
    } else {
      link.style.display = "inline-block";
    }
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
