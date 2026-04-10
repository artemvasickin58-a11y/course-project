// ==================== Финансовый трекер ====================

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentList = [...transactions];
let sortDirection = "desc";

const els = {
    form: document.getElementById("transactionForm"),
    tableBody: document.getElementById("transactionTable"),
    incomeEl: document.getElementById("income"),
    expenseEl: document.getElementById("expense"),
    balanceEl: document.getElementById("balance"),
    themeBtn: document.getElementById("themeToggle"),
    dateHeader: document.getElementById("dateHeader"),
    chartCanvas: document.getElementById("financeChart"),
    textChart: document.getElementById("chart")
};

let financeChart = null;

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function init() {
    setDefaultDate();
    initTheme();
    renderTransactions(transactions);
    updateStatistics(transactions);
}

// ====================== ДАТА ======================
function setDefaultDate() {
    document.getElementById("date").value = new Date().toISOString().slice(0, 10);
}

// ====================== ТЕМА ======================
function initTheme() {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) document.body.classList.add("dark");
    els.themeBtn.textContent = isDark ? "☀️" : "🌙";

    els.themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const nowDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", nowDark ? "dark" : "light");
        els.themeBtn.textContent = nowDark ? "☀️" : "🌙";
        
        const income = parseFloat(els.incomeEl.textContent.replace(/\s/g, '')) || 0;
        const expense = parseFloat(els.expenseEl.textContent.replace(/\s/g, '')) || 0;
        drawChart(income, expense);
    });
}

// ====================== ДОБАВЛЕНИЕ ======================
els.form.addEventListener("submit", e => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const comment = document.getElementById("comment").value.trim();

    if (!amount || !type || !category || !date) {
        alert("Заполните все обязательные поля");
        return;
    }
    if (amount <= 0) {
        alert("Сумма должна быть больше 0");
        return;
    }

    transactions.push({
        id: Date.now(),
        amount,
        type,
        category,
        date,
        comment: comment || "—"
    });

    saveToStorage();
    renderTransactions(transactions);
    updateStatistics(transactions);

    els.form.reset();
    setDefaultDate();
});

function saveToStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ====================== ТАБЛИЦА ======================
function renderTransactions(list) {
    currentList = [...list];
    currentList.sort((a, b) => sortDirection === "desc" 
        ? new Date(b.date) - new Date(a.date) 
        : new Date(a.date) - new Date(b.date));

    els.tableBody.innerHTML = "";

    currentList.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="Дата">${t.date}</td>
            <td data-label="Тип">${t.type === "income" ? "Доход" : "Расход"}</td>
            <td data-label="Категория">${t.category}</td>
            <td data-label="Сумма" class="${t.type}">${t.amount.toLocaleString('ru-RU')}</td>
            <td data-label="Комментарий">${t.comment}</td>
            <td><button class="delete-btn" onclick="deleteTransaction(${t.id})">✕</button></td>
        `;
        els.tableBody.appendChild(row);
    });
}

els.dateHeader.addEventListener("click", () => {
    sortDirection = sortDirection === "desc" ? "asc" : "desc";
    els.dateHeader.textContent = sortDirection === "desc" ? "Дата ⬇" : "Дата ⬆";
    renderTransactions(currentList);
});

// ====================== ФИЛЬТРЫ ======================
window.applyFilters = function() {
    const type = document.getElementById("filterType").value;
    const category = document.getElementById("filterCategory").value;
    const from = document.getElementById("filterFrom").value;
    const to = document.getElementById("filterTo").value;

    const filtered = transactions.filter(t => {
        if (type !== "all" && t.type !== type) return false;
        if (category !== "all" && t.category !== category) return false;
        if (from && t.date < from) return false;
        if (to && t.date > to) return false;
        return true;
    });

    renderTransactions(filtered);
    updateStatistics(filtered);
};

window.resetFilters = function() {
    document.getElementById("filterType").value = "all";
    document.getElementById("filterCategory").value = "all";
    document.getElementById("filterFrom").value = "";
    document.getElementById("filterTo").value = "";
    renderTransactions(transactions);
    updateStatistics(transactions);
};

window.deleteTransaction = function(id) {
    if (!confirm("Удалить эту транзакцию?")) return;
    transactions = transactions.filter(t => t.id !== id);
    saveToStorage();
    renderTransactions(transactions);
    updateStatistics(transactions);
};

// ====================== СТАТИСТИКА ======================
function updateStatistics(list) {
    let income = 0, expense = 0;
    list.forEach(t => t.type === "income" ? income += t.amount : expense += t.amount);
    const balance = income - expense;

    // Доходы
    els.incomeEl.textContent = income.toLocaleString('ru-RU');

    // Расходы
    els.expenseEl.textContent = expense.toLocaleString('ru-RU');

    // Баланс
    els.balanceEl.textContent = balance.toLocaleString('ru-RU');
    const balanceCard = els.balanceEl.parentElement;
    balanceCard.classList.toggle('positive', balance >= 0);
    balanceCard.classList.toggle('negative', balance < 0);

    drawChart(income, expense);
    drawTextChart(income, expense);
}

// ====================== ГРАФИК ======================
function drawChart(income, expense) {
    if (financeChart) financeChart.destroy();

    const isDark = document.body.classList.contains("dark");

    financeChart = new Chart(els.chartCanvas, {
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
                    labels: { color: isDark ? "#e2e8f0" : "#1e2937", font: { size: 15 }, padding: 25 }
                }
            }
        }
    });
}

function drawTextChart(income, expense) {
    const total = income + expense;
    if (total === 0) {
        els.textChart.textContent = "Нет данных";
        return;
    }
    const iBar = "█".repeat(Math.round(income / total * 28));
    const eBar = "█".repeat(Math.round(expense / total * 28));

    els.textChart.innerHTML = `
Доходы:  ${iBar} ${income.toLocaleString('ru-RU')} ₽
Расходы: ${eBar} ${expense.toLocaleString('ru-RU')} ₽
    `.trim();
}

// ====================== CSV ======================
window.exportCSV = function() {
    if (currentList.length === 0) return alert("Нет данных для экспорта");

    let csv = "Дата,Тип,Категория,Сумма,Комментарий\n";
    currentList.forEach(t => {
        csv += `${t.date},${t.type},${t.category},${t.amount},"${t.comment.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `финансы_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
};

// Запуск
init();