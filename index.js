let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const form = document.getElementById("transactionForm");
const tableBody = document.getElementById("transactionTable");

const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const balanceElement = document.getElementById("balance");

const ctx = document.getElementById("financeChart").getContext("2d");

let financeChart;

init();

function init() {
    setDefaultDate();
    renderTransactions(transactions);
    updateStatistics(transactions);
}

function setDefaultDate() {
    document.getElementById("date").value = new Date().toISOString().slice(0,10);
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

/* ================= ДОБАВЛЕНИЕ ТРАНЗАКЦИИ ================= */

form.addEventListener("submit", function(e){

    e.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const comment = document.getElementById("comment").value || "—";

    if(!amount || amount <= 0){
        alert("Введите корректную сумму");
        return;
    }

    const transaction = {
        id: Date.now(),
        amount,
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

/* ================= ТАБЛИЦА ================= */

function renderTransactions(list){

    tableBody.innerHTML = "";

    list.sort((a,b)=> new Date(b.date) - new Date(a.date));

    list.forEach(t => {

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${t.date}</td>
        <td>${t.type === "income" ? "Доход" : "Расход"}</td>
        <td>${t.category}</td>
        <td class="${t.type === "income" ? "income-text" : "expense-text"}">
        ${t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()} ₽
        </td>
        <td>${t.comment}</td>
        <td>
        <button class="delete" onclick="deleteTransaction(${t.id})">✕</button>
        </td>
        `;

        tableBody.appendChild(row);

    });

}

/* ================= УДАЛЕНИЕ ================= */

function deleteTransaction(id){

    if(confirm("Удалить транзакцию?")){

        transactions = transactions.filter(t => t.id !== id);

        saveTransactions();

        renderTransactions(transactions);
        updateStatistics(transactions);

    }

}

/* ================= ФИЛЬТРЫ ================= */

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

/* ================= БЫСТРЫЕ ФИЛЬТРЫ ДАТ ================= */

function filterToday(){

    const today = new Date().toISOString().slice(0,10);

    const filtered = transactions.filter(t => t.date === today);

    renderTransactions(filtered);
    updateStatistics(filtered);

}

function filterWeek(){

    const now = new Date();
    const weekAgo = new Date();

    weekAgo.setDate(now.getDate() - 7);

    const filtered = transactions.filter(t => {

        const d = new Date(t.date);

        return d >= weekAgo && d <= now;

    });

    renderTransactions(filtered);
    updateStatistics(filtered);

}

function filterMonth(){

    const now = new Date();
    const monthAgo = new Date();

    monthAgo.setDate(now.getDate() - 30);

    const filtered = transactions.filter(t => {

        const d = new Date(t.date);

        return d >= monthAgo && d <= now;

    });

    renderTransactions(filtered);
    updateStatistics(filtered);

}

function resetFilters(){

    document.getElementById("filterType").value = "all";
    document.getElementById("filterCategory").value = "all";
    document.getElementById("filterFrom").value = "";
    document.getElementById("filterTo").value = "";

    renderTransactions(transactions);
    updateStatistics(transactions);

}

/* ================= СТАТИСТИКА ================= */

function updateStatistics(list){

    let income = 0;
    let expense = 0;

    list.forEach(t => {

        if(t.type === "income") income += t.amount;
        else expense += t.amount;

    });

    incomeElement.textContent = income.toLocaleString();
    expenseElement.textContent = expense.toLocaleString();
    balanceElement.textContent = (income - expense).toLocaleString();

    drawChart(income, expense);

}

/* ================= ДИАГРАММА ================= */

function drawChart(income, expense){

    if(financeChart) financeChart.destroy();

    financeChart = new Chart(ctx,{
        type:"doughnut",
        data:{
            labels:["Доходы","Расходы"],
            datasets:[{
                data:[income,expense],
                backgroundColor:["#10b981","#ef4444"]
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{ position:"bottom" }
            }
        }
    });

}

/* ================= CSV ================= */

function exportCSV(){

    let csv = "Дата,Тип,Категория,Сумма,Комментарий\n";

    transactions.forEach(t => {

        csv += `${t.date},${t.type},${t.category},${t.amount},"${t.comment}"\n`;

    });

    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "transactions.csv";

    link.click();

}