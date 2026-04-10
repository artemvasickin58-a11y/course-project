/* ===== ДАННЫЕ ===== */
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentList = [...transactions];
let sortDirection = "desc";

/* ===== ЭЛЕМЕНТЫ ===== */
const tableBody = document.getElementById("transactionTable");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const balanceElement = document.getElementById("balance");
const themeBtn = document.getElementById("themeToggle");

const ctx = document.getElementById("financeChart").getContext("2d");

let financeChart;

/* ===== INIT ===== */
init();

function init() {
    setDefaultDate();
    initTheme();
    renderTransactions(transactions);
    updateStatistics(transactions);
}

/* ===== ДАТА ===== */
function setDefaultDate() {
    const dateInput = document.getElementById("date");
    dateInput.value = new Date().toISOString().slice(0,10);
}

/* ===== ТЕМА (🔥 исправленная) ===== */
function initTheme(){

    const saved = localStorage.getItem("theme");

    if(saved === "dark"){
        document.body.classList.add("dark");
        themeBtn.textContent = "☀️";
    } else {
        themeBtn.textContent = "🌙";
    }

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const isDark = document.body.classList.contains("dark");

        localStorage.setItem("theme", isDark ? "dark" : "light");

        themeBtn.textContent = isDark ? "☀️" : "🌙";
    });
}

/* ===== ДОБАВЛЕНИЕ ===== */
document.getElementById("transactionForm").addEventListener("submit", e => {

    e.preventDefault();

    const amount = document.getElementById("amount").value.trim();
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const comment = document.getElementById("comment").value.trim();

    if (!amount || !type || !category || !date) {
        alert("Заполните все поля");
        return;
    }

    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
        alert("Введите корректную сумму");
        return;
    }

    const t = {
        id: Date.now(),
        amount: amountNum,
        type,
        category,
        date,
        comment: comment || "—"
    };

    transactions.push(t);
    save();

    renderTransactions(transactions);
    updateStatistics(transactions);

    e.target.reset();
    setDefaultDate();
});

/* ===== СОХРАНЕНИЕ ===== */
function save(){
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

/* ===== ОТРИСОВКА ===== */
function renderTransactions(list){

    currentList = [...list];

    tableBody.innerHTML = "";

    currentList.sort((a,b)=>
        sortDirection === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );

    currentList.forEach(t => {

        const row = document.createElement("tr");

        row.innerHTML = `
        <td data-label="Дата">${t.date}</td>
        <td data-label="Тип">${t.type === "income" ? "Доход" : "Расход"}</td>
        <td data-label="Категория">${t.category}</td>
        <td data-label="Сумма">${t.amount}</td>
        <td data-label="Комментарий">${t.comment}</td>
        <td><button onclick="deleteTransaction(${t.id})">✕</button></td>
        `;

        tableBody.appendChild(row);
    });
}

/* ===== СОРТИРОВКА ===== */
document.getElementById("dateHeader").addEventListener("click", () => {

    sortDirection = sortDirection === "asc" ? "desc" : "asc";

    document.getElementById("dateHeader").textContent =
        sortDirection === "asc" ? "Дата ⬆" : "Дата ⬇";

    renderTransactions(currentList);
});

/* ===== ФИЛЬТРЫ ===== */
function applyFilters(){

    const type = document.getElementById("filterType").value;
    const category = document.getElementById("filterCategory").value;
    const from = document.getElementById("filterFrom").value;
    const to = document.getElementById("filterTo").value;

    let filtered = transactions.filter(t => {

        if(type !== "all" && t.type !== type) return false;
        if(category !== "all" && t.category !== category) return false;
        if(from && t.date < from) return false;
        if(to && t.date > to) return false;

        return true;
    });

    renderTransactions(filtered);
    updateStatistics(filtered);
}

/* ===== СБРОС ===== */
function resetFilters(){

    document.getElementById("filterType").value = "all";
    document.getElementById("filterCategory").value = "all";
    document.getElementById("filterFrom").value = "";
    document.getElementById("filterTo").value = "";

    renderTransactions(transactions);
    updateStatistics(transactions);
}

/* ===== УДАЛЕНИЕ ===== */
function deleteTransaction(id){
    transactions = transactions.filter(t => t.id !== id);
    save();
    renderTransactions(transactions);
    updateStatistics(transactions);
}

/* ===== СТАТИСТИКА ===== */
function updateStatistics(list){

    let income = 0, expense = 0;

    list.forEach(t=>{
        t.type === "income" ? income += t.amount : expense += t.amount;
    });

    incomeElement.textContent = income;
    expenseElement.textContent = expense;
    balanceElement.textContent = income - expense;

    drawChart(income, expense);
    drawTextChart(income, expense);
}

/* ===== ГРАФИК ===== */
function drawChart(income, expense){

    if(financeChart) financeChart.destroy();

    financeChart = new Chart(ctx,{
        type:"doughnut",
        data:{
            labels:["Доход","Расход"],
            datasets:[{
                data:[income, expense]
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });
}

/* ===== ТЕКСТ ГРАФИК ===== */
function drawTextChart(income, expense){

    const total = income + expense;

    const chart = document.getElementById("chart");

    if(total === 0){
        chart.textContent = "Нет данных";
        return;
    }

    const i = "".repeat(Math.round(income/total*20));
    const e = "".repeat(Math.round(expense/total*20));

    chart.textContent = `
Доходы:  ${i} ${income}
Расходы: ${e} ${expense}
`;
}

/* ===== CSV ===== */
function exportCSV(){

    let csv = "Дата,Тип,Категория,Сумма,Комментарий\n";

    currentList.forEach(t => {
        csv += `${t.date},${t.type},${t.category},${t.amount},"${t.comment}"\n`;
    });

    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "transactions.csv";
    link.click();
}