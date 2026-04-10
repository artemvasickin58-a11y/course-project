let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentList = [...transactions];
let sortDirection = "desc";

const tableBody = document.getElementById("transactionTable");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const balanceElement = document.getElementById("balance");

const ctx = document.getElementById("financeChart").getContext("2d");

let financeChart;

init();

function init() {
    setDefaultDate();
    loadTheme();
    renderTransactions(transactions);
    updateStatistics(transactions);
}

/* DATE */
function setDefaultDate() {
    document.getElementById("date").value = new Date().toISOString().slice(0,10);
}

/* THEME */
document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark"));
};

function loadTheme(){
    if(localStorage.getItem("theme") === "true"){
        document.body.classList.add("dark");
    }
}

/* ADD */
document.getElementById("transactionForm").addEventListener("submit", e => {

    e.preventDefault();

    const t = {
        id: Date.now(),
        amount: +amount.value,
        type: type.value,
        category: category.value,
        date: date.value,
        comment: comment.value || "—"
    };

    transactions.push(t);
    save();

    renderTransactions(transactions);
    updateStatistics(transactions);

    e.target.reset();
    setDefaultDate();
});

/* SAVE */
function save(){
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

/* RENDER */
function renderTransactions(list){

    currentList = list;

    tableBody.innerHTML = "";

    list.sort((a,b)=>
        sortDirection === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );

    list.forEach(t => {

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

/* SORT */
document.getElementById("dateHeader").onclick = () => {

    sortDirection = sortDirection === "asc" ? "desc" : "asc";

    document.getElementById("dateHeader").textContent =
        sortDirection === "asc" ? "Дата ⬆" : "Дата ⬇";

    renderTransactions(currentList);
};

/* FILTER */
function applyFilters(){

    const type = filterType.value;
    const category = filterCategory.value;
    const from = filterFrom.value;
    const to = filterTo.value;

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

/* RESET */
function resetFilters(){

    filterType.value = "all";
    filterCategory.value = "all";
    filterFrom.value = "";
    filterTo.value = "";

    renderTransactions(transactions);
    updateStatistics(transactions);
}

/* DELETE */
function deleteTransaction(id){
    transactions = transactions.filter(t => t.id !== id);
    save();
    renderTransactions(transactions);
    updateStatistics(transactions);
}

/* STATS */
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

/* CHART */
function drawChart(income, expense){

    if(financeChart) financeChart.destroy();

    financeChart = new Chart(ctx,{
        type:"doughnut",
        data:{
            labels:["Доход","Расход"],
            datasets:[{ data:[income, expense] }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });
}

/* TEXT */
function drawTextChart(income, expense){

    const total = income + expense;

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

/* CSV */
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