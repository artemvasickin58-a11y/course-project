export function initTheme() {
    const btn = document.getElementById("themeToggle");
    const isDark = localStorage.getItem("theme") === "dark";

    if (isDark) document.body.classList.add("dark");
    btn.textContent = isDark ? "☀️" : "🌙";

    btn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const nowDark = document.body.classList.contains("dark");

        localStorage.setItem("theme", nowDark ? "dark" : "light");
        btn.textContent = nowDark ? "☀️" : "🌙";

        // Перерисовываем график при смене темы
        const income = parseFloat(document.getElementById("income").textContent.replace(/\s/g, '')) || 0;
        const expense = parseFloat(document.getElementById("expense").textContent.replace(/\s/g, '')) || 0;
        
        // Импортируем динамически, чтобы избежать циклических зависимостей
        import('./graphic.js').then(({ drawChart }) => {
            drawChart(income, expense);
        });
    });
}