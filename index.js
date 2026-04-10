/* =============================================
   ФИНАНСОВЫЙ ТРЕКЕР — Полностью переработанный JS
   ============================================= */

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentList = [...transactions];
let sortDirection = "desc"; // desc = новые сверху

// Элементы DOM
const elements = {
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

// ====================== INIT ======================
function init() {
    setDefaultDate();
    initTheme();
    renderTransactions(transactions);
    updateStatistics(transactions);
}

// ====================== ДАТА ======================
function setDefaultDate() {
    const dateInput = document.getElementById("date");
    dateInput.value = new Date().toISOString().slice(0, 10);
}

// ====================== ТЕМА ======================
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        elements.themeBtn.textContent = "☀️";
    } else {
        elements.themeBtn.textContent = "🌙";
    }

    elements.themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");

        localStorage.setItem("theme", isDark ? "dark" : "light");
        elements.themeBtn.textContent = isDark ? "☀️" : "🌙";

        // Перерисовываем график при смене темы
        const income = parseFloat(elements.incomeEl.textContent) || 0;
        const expense = parseFloat(elements.expenseEl.textContent) || 0;
        drawChart(income, expense);
    });
}

// ====================== ДОБАВЛЕНИЕ ТРАНЗАКЦИИ ======================
elements.form.addEventListener("submit", (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value.trim());
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const comment = document.getElementById("comment").value.trim();

    // Валидация
    if (!amount || !type || !category || !date) {
        alert("Пожалуйста, заполните все обязательные поля");
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert("Сумма должна быть больше нуля");
        return;
    }

    const transaction = {
        id: Date.now(),
        amount,
        type,
        category,
        date,
        comment: comment || "—"
    };

    transactions.push(transaction);
    saveToStorage();

    // Обновляем интерфейс
    renderTransactions(transactions);
    updateStatistics(transactions);

    // Сброс формы
    elements.form.reset();
    setDefaultDate();
});

// ====================== СОХРАНЕНИЕ ======================
function saveToStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ====================== ОТРИСОВКА ТАБЛИЦЫ ======================
function renderTransactions(list) {
    currentList = [...list];
    
    // Сортировка по дате
    currentList.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

    elements.tableBody.innerHTML = "";

    currentList.forEach(t => {
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td data-label="Дата">${t.date}</td>
            <td data-label="Тип">${t.type === "income" ? "Доход" : "Расход"}</td>
            <td data-label="Категория">${t.category}</td>
            <td data-label="Сумма" class="${t.type}">${t.amount.toLocaleString('ru-RU')}</td>
            <td data-label="Комментарий">${t.comment}</td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">✕</button>
            </td>
        `;

        elements.tableBody.appendChild(row);
    });
}

// ====================== СОРТИРОВКА ======================
elements.dateHeader.addEventListener("click", () => {
    sortDirection = sortDirection === "desc" ? "asc" : "desc";
    elements.dateHeader.textContent = sortDirection === "desc" ? "Дата ⬇" : "Дата ⬆";
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

// ====================== УДАЛЕНИЕ ======================
window.deleteTransaction = function(id) {
    if (!confirm("Удалить эту транзакцию?")) return;

    transactions = transactions.filter(t => t.id !== id);
    saveToStorage();
    renderTransactions(transactions);
    updateStatistics(transactions);
};

// ====================== СТАТИСТИКА ======================
function updateStatistics(list) {
    let income = 0;
    let expense = 0;

    list.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    elements.incomeEl.textContent = income.toLocaleString('ru-RU');
    elements.expenseEl.textContent = expense.toLocaleString('ru-RU');
    elements.balanceEl.textContent = (income - expense).toLocaleString('ru-RU');

    drawChart(income, expense);
    drawTextChart(income, expense);
}

// ====================== ГРАФИК (DOUGHNUT) ======================
function drawChart(income, expense) {
    if (financeChart) financeChart.destroy();

    const isDark = document.body.classList.contains("dark");

    financeChart = new Chart(elements.chartCanvas.getContext("2d"), {
        type: "doughnut",
        data: {
            labels: ["Доходы", "Расходы"],
            datasets: [{
                data: [income, expense],
                backgroundColor: ["#22c55e", "#ef4444"],
                borderColor: isDark ? "#1e293b" : "#ffffff",
                borderWidth: 4,
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: "65%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: isDark ? "#e2e8f0" : "#1e2937",
                        font: { size: 15 },
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// ====================== ТЕКСТОВЫЙ ГРАФИК ======================
function drawTextChart(income, expense) {
    const total = income + expense;
    if (total === 0) {
        elements.textChart.textContent = "Нет данных для отображения";
        return;
    }

    const incomePercent = Math.round((income / total) * 100);
    const expensePercent = Math.round((expense / total) * 100);

    const incomeBar = "█".repeat(Math.round(income / total * 25));
    const expenseBar = "█".repeat(Math.round(expense / total * 25));

    elements.textChart.innerHTML = `
Доходы:     ${incomeBar} ${income.toLocaleString('ru-RU')} ₽ (${incomePercent}%)
Расходы:    ${expenseBar} ${expense.toLocaleString('ru-RU')} ₽ (${expensePercent}%)
    `.trim();
}

// ====================== ЭКСПОРТ В CSV ======================
window.exportCSV = function() {
    if (currentList.length === 0) {
        alert("Нет данных для экспорта");
        return;
    }

    let csv = "Дата,Тип,Категория,Сумма,Комментарий\n";

    currentList.forEach(t => {
        const comment = `"${t.comment.replace(/"/g, '""')}"`; // экранирование кавычек
        csv += `${t.date},${t.type},${t.category},${t.amount},${comment}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

// ====================== ЗАПУСК ======================
init();