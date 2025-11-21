// theme.js
(function () {
  const GLOBAL_THEME_KEY = "etago_theme";

  function resolveEffectiveTheme(themeValue) {
    if (themeValue === "dark") return "dark";
    if (themeValue === "light") return "light";

    // "system" or anything else → OS preference
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    return prefersDark ? "dark" : "light";
  }

  function applyUserTheme(themeValueOverride) {
    const root = document.documentElement;
    let themeValue = themeValueOverride || null;

    // 1. Try user prefs if logged in
    if (!themeValue && typeof getCurrentUser === "function") {
      const user = getCurrentUser();
      if (user && user.username) {
        const prefsKey = `prefs_${user.username}`;
        const saved = localStorage.getItem(prefsKey);
        if (saved) {
          try {
            const prefs = JSON.parse(saved);
            if (prefs.theme) {
              themeValue = prefs.theme; // "light" | "dark" | "system"
            }
          } catch (e) {
            console.warn("Bad prefs JSON for", prefsKey, e);
          }
        }
      }
    }

    // 2. Fallback to global or system
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
    localStorage.setItem(GLOBAL_THEME_KEY, effective);

    // Optional nav toggle button text
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      if (themeValue === "system") {
        btn.textContent = `🌓 System (${effective})`;
      } else if (effective === "dark") {
        btn.textContent = "🌙 Dark";
      } else {
        btn.textContent = "🌞 Light";
      }
    }
  }

  // Expose globally for profile page + nav button
  window.applyUserTheme = applyUserTheme;

  document.addEventListener("DOMContentLoaded", () => {
    applyUserTheme();

    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        // Cycle between light → dark → system for the current user
        const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
        let prefsKey = null;
        if (user && user.username) {
          prefsKey = `prefs_${user.username}`;
        }

        let currentValue = "system";
        if (prefsKey) {
          const saved = localStorage.getItem(prefsKey);
          if (saved) {
            try {
              const prefs = JSON.parse(saved);
              if (prefs.theme) currentValue = prefs.theme;
            } catch (e) {}
          }
        }

        const cycle = ["light", "dark", "system"];
        const idx = cycle.indexOf(currentValue);
        const nextValue = cycle[(idx + 1 + cycle.length) % cycle.length];

        if (prefsKey) {
          let prefs = {};
          const saved = localStorage.getItem(prefsKey);
          if (saved) {
            try {
              prefs = JSON.parse(saved) || {};
            } catch (e) {}
          }
          prefs.theme = nextValue;
          localStorage.setItem(prefsKey, JSON.stringify(prefs));
        }

        applyUserTheme(nextValue);
      });
    }
  });
})();
