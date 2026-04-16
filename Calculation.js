import { drawChart, drawTextChart } from './graphic.js';

export function updateStatistics(list) {
    let income = 0;
    let expense = 0;

    list.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    const balance = income - expense;

    // Обновляем DOM
    document.getElementById("income").textContent = income.toLocaleString('ru-RU');
    document.getElementById("expense").textContent = expense.toLocaleString('ru-RU');
    document.getElementById("balance").textContent = balance.toLocaleString('ru-RU');

    const balanceCard = document.querySelector('.card.balance');
    balanceCard.classList.toggle('positive', balance >= 0);
    balanceCard.classList.toggle('negative', balance < 0);

    drawChart(income, expense);
    drawTextChart(income, expense);
}