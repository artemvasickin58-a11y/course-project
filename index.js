let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const table = document.getElementById("transactionTable");

const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");

document.getElementById("transactionForm").addEventListener("submit", e => {

e.preventDefault();

let amount = parseFloat(document.getElementById("amount").value);
let type = document.getElementById("type").value;
let category = document.getElementById("category").value;
let date = document.getElementById("date").value || new Date().toISOString().slice(0,10);
let comment = document.getElementById("comment").value;

if(isNaN(amount)){
alert("Введите корректную сумму");
return;
}

let transaction = {
id: Date.now(),
amount,
type,
category,
date,
comment
};

transactions.push(transaction);

saveData();
render();

e.target.reset();

});

function saveData(){
localStorage.setItem("transactions", JSON.stringify(transactions));
}

function deleteTransaction(id){

transactions = transactions.filter(t => t.id !== id);

saveData();
render();

}

function render(list = transactions){

table.innerHTML = "";

list.sort((a,b)=> new Date(b.date)-new Date(a.date));

list.forEach(t=>{

let row = document.createElement("tr");

row.innerHTML = `
<td>${t.date}</td>
<td>${t.type}</td>
<td>${t.category}</td>
<td>${t.amount}</td>
<td>${t.comment}</td>
<td><button class="delete" onclick="deleteTransaction(${t.id})">X</button></td>
`;

table.appendChild(row);

});

updateStats(list);

}

function updateStats(list){

let income = 0;
let expense = 0;

list.forEach(t=>{
if(t.type==="income") income += t.amount;
else expense += t.amount;
});

incomeEl.textContent = income;
expenseEl.textContent = expense;
balanceEl.textContent = income-expense;

}

function applyFilters(){

let category = document.getElementById("filterCategory").value;
let from = document.getElementById("filterFrom").value;
let to = document.getElementById("filterTo").value;

let filtered = transactions.filter(t=>{

if(category !== "all" && t.category !== category)
return false;

if(from && new Date(t.date) < new Date(from))
return false;

if(to && new Date(t.date) > new Date(to))
return false;

return true;

});

render(filtered);

}

render();