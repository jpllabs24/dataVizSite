// theme.js
(function () {
  const GLOBAL_THEME_KEY = "etago_theme"; // optional global fallback

  function resolveEffectiveTheme(themeValue) {
    if (themeValue === "dark") return "dark";
    if (themeValue === "light") return "light";

    // "system" or anything else → look at OS preference
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    return prefersDark ? "dark" : "light";
  }

  // Apply theme for the CURRENT user
  // themeValueOverride is used by profile page when user changes the select
  function applyUserTheme(themeValueOverride) {
    const root = document.documentElement;
    let themeValue = themeValueOverride || null;

    // 1. If no override, try user-specific prefs
    if (!themeValue && typeof getCurrentUser === "function") {
      const user = getCurrentUser();
      if (user && user.username) {
        const prefsKey = `prefs_${user.username}`;
        const saved = localStorage.getItem(prefsKey);
        if (saved) {
          try {
            const prefs = JSON.parse(saved);
            if (prefs.theme) {
              themeValue = prefs.theme; // "light", "dark", "system"
            }
          } catch (e) {
            // ignore JSON errors
          }
        }
      }
    }

    // 2. If still nothing, fall back to last global theme or system
    if (!themeValue) {
      const storedGlobal = localStorage.getItem(GLOBAL_THEME_KEY);
      if (storedGlobal === "light" || storedGlobal === "dark") {
        themeValue = storedGlobal;
      } else {
        themeValue = "system";
      }
    }

    const effective = resolveEffectiveTheme(themeValue);
    root.setAttribute("data-theme", effective);

    // optional: store the effective theme globally so next page load
    // can at least look okay even before user is resolved
    localStorage.setItem(GLOBAL_THEME_KEY, effective);
  }

  // Expose so profile page can call after saving preferences
  window.applyUserTheme = applyUserTheme;

  // Run on every page that includes theme.js
  document.addEventListener("DOMContentLoaded", () => {
    applyUserTheme();
  });
})();
