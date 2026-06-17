const STORAGE_KEY = "theme";
const root = document.documentElement;
const toggleBtn = document.getElementById("theme-toggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(isDark) {
    root.dataset.theme = isDark ? "dark" : "light";
    toggleBtn.textContent = isDark ? "☀️" : "🌙";
    toggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

// Determine initial theme: localStorage > OS preference
const stored = localStorage.getItem(STORAGE_KEY);
applyTheme(stored !== null ? stored === "dark" : prefersDark.matches);

// Toggle on button click and persist choice
toggleBtn.addEventListener("click", () => {
    const isDark = root.dataset.theme !== "dark";
    applyTheme(isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
});

// React to OS theme changes only when no manual preference is stored
prefersDark.addEventListener("change", (e) => {
    if (localStorage.getItem(STORAGE_KEY) === null) {
        applyTheme(e.matches);
    }
});
