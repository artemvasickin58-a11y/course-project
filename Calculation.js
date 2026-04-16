import { drawChart, drawTextChart } from "./chart.js";

export function updateStatistics(list) {
    let income = 0;
    let expense = 0;

    list.forEach(t =>
        t.type === "income"
            ? (income += t.amount)
            : (expense += t.amount)
    );

    const balance = income - expense;

    document.getElementById("income").textContent = income;
    document.getElementById("expense").textContent = expense;
    document.getElementById("balance").textContent = balance;

    drawChart(income, expense);
    drawTextChart(income, expense);
}