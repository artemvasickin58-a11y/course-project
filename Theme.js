export function initTheme() {
    const btn = document.getElementById("themeToggle");

    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) document.body.classList.add("dark");

    btn.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        const nowDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", nowDark ? "dark" : "light");
    });
}