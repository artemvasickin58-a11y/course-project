let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentSort = { column: 'date', direction: 'desc' }; // по умолчанию — новейшие сверху

const form = document.getElementById("transactionForm");
const tableBody = document.getElementById("transactionTable");

const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const balanceElement = document.getElementById("balance");
const chartElement = document.getElementById("chart");

init();

function init() {
    setDefaultDate();
    renderTransactions(transactions);
    updateStatistics(transactions);
}

function setDefaultDate() {
    document.getElementById("date").value = new Date().toISOString().slice(0, 10);
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ===================== Добавление транзакции =====================
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const comment = document.getElementById("comment").value.trim() || "—";

    if (isNaN(amount) || amount <= 0) {
        alert("Введите корректную сумму");
        return;
    }

    const transaction = {
        id: Date.now(),
        amount: Math.abs(amount),
        type,
        category,
        date,
        comment
    };

    transactions.push(transaction);
    saveTransactions();
    renderTransactions(transactions);
    updateStatistics(transactions);

    form.reset();
    setDefaultDate();
});

// ===================== СОРТИРОВКА =====================
function sortTransactions(list) {
    return [...list].sort((a, b) => {
        if (currentSort.column === 'date') {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return currentSort.direction === 'desc' ? dateB - dateA : dateA - dateB;
        }
        return 0;
    });
}

function toggleSort(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'desc' ? 'asc' : 'desc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'desc';
    }
    renderTransactions(transactions);
}

// ===================== РЕНДЕР ТАБЛИЦЫ =====================
function renderTransactions(list) {
    tableBody.innerHTML = "";

    const sortedList = sortTransactions(list);

    sortedList.forEach(t => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td data-label="Дата">${t.date}</td>
            <td data-label="Тип">${t.type === "income" ? "Доход" : "Расход"}</td>
            <td data-label="Категория">${t.category}</td>
            <td data-label="Сумма" class="${t.type === "income" ? "income-text" : "expense-text"}">
                ${formatMoney(t.amount, t.type)}
            </td>
            <td data-label="Комментарий">${t.comment}</td>
            <td>
                <button class="delete" onclick="deleteTransaction(${t.id})">✕</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function formatMoney(amount, type) {
    const formatted = amount.toLocaleString("ru-RU");
    return type === "income" ? `+${formatted} ₽` : `-${formatted} ₽`;
}

function deleteTransaction(id) {
    if (confirm("Удалить эту транзакцию?")) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        renderTransactions(transactions);
        updateStatistics(transactions);
    }
}

// ===================== ФИЛЬТРЫ =====================

// Применить фильтры (тип, категория, период)
function applyFilters() {
    const type = document.getElementById("filterType").value;
    const category = document.getElementById("filterCategory").value;
    const from = document.getElementById("filterFrom").value;
    const to = document.getElementById("filterTo").value;

    let filtered = transactions.filter(t => {
        if (type !== "all" && t.type !== type) return false;
        if (category !== "all" && t.category !== category) return false;
        if (from && t.date < from) return false;
        if (to && t.date > to) return false;
        return true;
    });

    renderTransactions(filtered);
    updateStatistics(filtered);
}

// ========== ИСПРАВЛЕННЫЕ ФУНКЦИИ НЕДЕЛЯ И МЕСЯЦ ==========
function filterWeek() {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= weekAgo && d <= now;
    });

    renderTransactions(filtered);
    updateStatistics(filtered);
}

function filterMonth() {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);   // последние 30 дней
    monthAgo.setHours(0, 0, 0, 0);

    const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= monthAgo && d <= now;
    });

    renderTransactions(filtered);
    updateStatistics(filtered);
}

// Сброс всех фильтров
function resetFilters() {
    document.getElementById("filterType").value = "all";
    document.getElementById("filterCategory").value = "all";
    document.getElementById("filterFrom").value = "";
    document.getElementById("filterTo").value = "";
    document.getElementById("search").value = "";

    renderTransactions(transactions);
    updateStatistics(transactions);
}

// Поиск по комментарию
function searchComment() {
    const text = document.getElementById("search").value.toLowerCase().trim();

    const filtered = transactions.filter(t =>
        t.comment.toLowerCase().includes(text)
    );

    renderTransactions(filtered);
    updateStatistics(filtered);
}

// ===================== СТАТИСТИКА И ГРАФИК =====================
function updateStatistics(list) {
    let income = 0;
    let expense = 0;

    list.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    incomeElement.textContent = income.toLocaleString("ru-RU");
    expenseElement.textContent = expense.toLocaleString("ru-RU");
    balanceElement.textContent = (income - expense).toLocaleString("ru-RU");

    drawChart(list);
}

function drawChart(list) {
    let categories = {};

    list.forEach(t => {
        if (t.type === "expense") {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        }
    });

    const total = Object.values(categories).reduce((a, b) => a + b, 0);
    let text = total ? "" : "Нет расходов для отображения\n";

    for (let cat in categories) {
        const value = categories[cat];
        const percent = total ? ((value / total) * 100).toFixed(1) : 0;
        const bar = "█".repeat(Math.round(percent / 4)); // более красивые блоки
        text += `${cat}: ${value.toLocaleString("ru-RU")} ₽ (${percent}%)\n${bar}\n\n`;
    }

    chartElement.textContent = text;
}

// ===================== ЭКСПОРТ =====================
function exportCSV() {
    let csv = "Дата,Тип,Категория,Сумма,Комментарий\n";

    transactions.forEach(t => {
        csv += `${t.date},${t.type},${t.category},${t.amount},"${t.comment.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `финансы_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}