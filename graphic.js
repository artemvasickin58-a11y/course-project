let financeChart = null;

export function drawChart(income, expense) {
    const canvas = document.getElementById("financeChart");
    if (!canvas) return;

    if (financeChart) financeChart.destroy();

    const isDark = document.body.classList.contains("dark");

    financeChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Доходы", "Расходы"],
            datasets: [{
                data: [income, expense],
                backgroundColor: ["#22c55e", "#ef4444"],
                borderColor: isDark ? "#1e293b" : "#ffffff",
                borderWidth: 5
            }]
        },
        options: {
            responsive: true,
            cutout: "68%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: isDark ? "#e2e8f0" : "#1e2937",
                        font: { size: 15 },
                        padding: 25
                    }
                }
            }
        }
    });
}

export function drawTextChart(income, expense) {
    const el = document.getElementById("chart");
    const total = income + expense;

    if (total === 0) {
        el.textContent = "Нет данных";
        return;
    }

    const iBar = "█".repeat(Math.round(income / total * 28));
    const eBar = "█".repeat(Math.round(expense / total * 28));

    el.innerHTML = `
Доходы:  ${iBar} ${income.toLocaleString('ru-RU')} ₽
Расходы: ${eBar} ${expense.toLocaleString('ru-RU')} ₽
    `.trim();
}