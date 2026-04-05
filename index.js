// ==============================
// ХРАНЕНИЕ ДАННЫХ
// ==============================

let transactions = JSON.parse(localStorage.getItem("transactions")) || []


// ==============================
// ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
// ==============================

const form = document.getElementById("transactionForm")
const table = document.getElementById("transactionTable")

const incomeElement = document.getElementById("income")
const expenseElement = document.getElementById("expense")
const balanceElement = document.getElementById("balance")

const chartElement = document.getElementById("chart")


// ==============================
// ИНИЦИАЛИЗАЦИЯ
// ==============================

init()

function init(){

loadTransactions()

setDefaultDate()

renderTransactions(transactions)

updateStatistics(transactions)

}


// ==============================
// LOCAL STORAGE
// ==============================

function saveTransactions(){

localStorage.setItem("transactions", JSON.stringify(transactions))

}

function loadTransactions(){

const saved = localStorage.getItem("transactions")

if(saved){

transactions = JSON.parse(saved)

}

}


// ==============================
// УСТАНОВКА ТЕКУЩЕЙ ДАТЫ
// ==============================

function setDefaultDate(){

const dateInput = document.getElementById("date")

if(dateInput){

dateInput.value = new Date().toISOString().slice(0,10)

}

}


// ==============================
// ДОБАВЛЕНИЕ ТРАНЗАКЦИИ
// ==============================

form.addEventListener("submit", handleAddTransaction)

function handleAddTransaction(event){

event.preventDefault()

const amount = parseFloat(document.getElementById("amount").value)
const type = document.getElementById("type").value
const category = document.getElementById("category").value
const date = document.getElementById("date").value
const comment = document.getElementById("comment").value


if(!validateInput(amount)) return


const transaction = {

id: Date.now(),
amount,
type,
category,
date,
comment

}

transactions.push(transaction)

saveTransactions()

renderTransactions(transactions)

updateStatistics(transactions)

showMessage("Транзакция добавлена")

form.reset()

setDefaultDate()

}


// ==============================
// ВАЛИДАЦИЯ ДАННЫХ
// ==============================

function validateInput(amount){

if(isNaN(amount)){

showMessage("Ошибка: сумма должна быть числом")
return false

}

if(amount <= 0){

showMessage("Ошибка: сумма должна быть больше нуля")
return false

}

return true

}


// ==============================
// ВЫВОД ТРАНЗАКЦИЙ
// ==============================

function renderTransactions(list){

table.innerHTML = ""

list.sort((a,b)=> new Date(b.date) - new Date(a.date))

list.forEach(transaction => {

const row = document.createElement("tr")

row.innerHTML = `
<td>${transaction.date}</td>
<td>${transaction.type}</td>
<td>${transaction.category}</td>
<td class="${transaction.type}">${transaction.amount}</td>
<td>${transaction.comment}</td>
<td>
<button onclick="deleteTransaction(${transaction.id})">
Удалить
</button>
</td>
`

table.appendChild(row)

})

}


// ==============================
// УДАЛЕНИЕ ТРАНЗАКЦИИ
// ==============================

function deleteTransaction(id){

transactions = transactions.filter(t => t.id !== id)

saveTransactions()

renderTransactions(transactions)

updateStatistics(transactions)

showMessage("Транзакция удалена")

}


// ==============================
// ФИЛЬТРАЦИЯ
// ==============================

function applyFilters(){

const category = document.getElementById("filterCategory").value
const dateFrom = document.getElementById("filterFrom").value
const dateTo = document.getElementById("filterTo").value

const filtered = transactions.filter(transaction => {

if(category !== "all" && transaction.category !== category)
return false

if(dateFrom && new Date(transaction.date) < new Date(dateFrom))
return false

if(dateTo && new Date(transaction.date) > new Date(dateTo))
return false

return true

})

renderTransactions(filtered)

updateStatistics(filtered)

}


// ==============================
// ПОИСК ПО КОММЕНТАРИЮ
// ==============================

function searchComment(){

const text = document.getElementById("search").value.toLowerCase()

const filtered = transactions.filter(transaction =>
transaction.comment.toLowerCase().includes(text)
)

renderTransactions(filtered)

updateStatistics(filtered)

}


// ==============================
// СТАТИСТИКА
// ==============================

function updateStatistics(list){

let income = 0
let expense = 0

list.forEach(transaction => {

if(transaction.type === "income"){
income += transaction.amount
}
else{
expense += transaction.amount
}

})

incomeElement.textContent = income
expenseElement.textContent = expense
balanceElement.textContent = income - expense

drawTextChart(list)

}


// ==============================
// ТЕКСТОВЫЙ ГРАФИК
// ==============================

function drawTextChart(list){

let categories = {}

list.forEach(transaction => {

if(transaction.type === "expense"){

if(!categories[transaction.category]){
categories[transaction.category] = 0
}

categories[transaction.category] += transaction.amount

}

})

const total = Object.values(categories).reduce((a,b)=>a+b,0)

let chartText = ""

for(let category in categories){

const percent = ((categories[category]/total)*100).toFixed(1)

const bar = "#".repeat(Math.round(percent/2))

chartText += `${category} ${percent}% ${bar}\n`

}

chartElement.textContent = chartText

}


// ==============================
// ЭКСПОРТ В CSV
// ==============================

function exportCSV(){

let csv = "Дата,Тип,Категория,Сумма,Комментарий\n"

transactions.forEach(transaction => {

csv += `${transaction.date},${transaction.type},${transaction.category},${transaction.amount},${transaction.comment}\n`

})

const blob = new Blob([csv], {type:"text/csv"})

const url = URL.createObjectURL(blob)

const link = document.createElement("a")

link.href = url
link.download = "finance.csv"

link.click()

}


// ==============================
// СООБЩЕНИЯ ПОЛЬЗОВАТЕЛЮ
// ==============================

function showMessage(text){

alert(text)

}