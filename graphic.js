let financeChart = null;

export function drawChart(income, expense) {
    if (financeChart) financeChart.destroy();

    financeChart = new Chart(
        document.getElementById("financeChart"),
        {
            type: "doughnut",
            data: {
                labels: ["Доходы", "Расходы"],
                datasets: [{
                    data: [income, expense],
                }]
            }
        }
    );
}

export function drawTextChart(income, expense) {
    const el = document.getElementById("chart");

    const total = income + expense;
    if (!total) {
        el.textContent = "Нет данных";
        return;
    }

    el.textContent = `Доходы: ${income}\nРасходы: ${expense}`;
}