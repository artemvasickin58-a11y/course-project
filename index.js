let transactions = JSON.parse(localStorage.getItem("transactions")) || []

const form = document.getElementById("transactionForm")
const table = document.getElementById("transactionTable")

const incomeElement = document.getElementById("income")
const expenseElement = document.getElementById("expense")
const balanceElement = document.getElementById("balance")

const chartElement = document.getElementById("chart")

init()

function init(){
    setDefaultDate()
    renderTransactions(transactions)
    updateStatistics(transactions)
}

function setDefaultDate(){
    document.getElementById("date").value =
    new Date().toISOString().slice(0,10)
}

function saveTransactions(){
    localStorage.setItem("transactions", JSON.stringify(transactions))
}

function validateAmount(amount){

    if(isNaN(amount)){
        alert("Ошибка: сумма должна быть числом")
        return false
    }

    if(amount <= 0){
        alert("Ошибка: сумма должна быть больше 0")
        return false
    }

    return true
}

function formatCurrency(amount,type){

    const formatted = amount.toLocaleString("ru-RU",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    })

    return type === "income"
        ? `+${formatted} ₽`
        : `- ${formatted} ₽`
}

form.addEventListener("submit",function(e){

    e.preventDefault()

    const amount = parseFloat(document.getElementById("amount").value)
    const type = document.getElementById("type").value
    const category = document.getElementById("category").value
    const date = document.getElementById("date").value
    const comment = document.getElementById("comment").value

    if(!validateAmount(amount)) return

    const transaction = {
        id: Date.now(),
        amount: Math.abs(amount),
        type,
        category,
        date,
        comment
    }

    transactions.push(transaction)

    saveTransactions()

    renderTransactions(transactions)

    updateStatistics(transactions)

    form.reset()

    setDefaultDate()

})

function renderTransactions(list){

    table.innerHTML = ""

    list.sort((a,b)=> new Date(b.date)-new Date(a.date))

    list.forEach(t=>{

        const row = document.createElement("tr")

        row.innerHTML = `
        <td>${t.date}</td>
        <td>${t.type === "income" ? "Доход" : "Расход"}</td>
        <td>${t.category}</td>
        <td class="${t.type}">
        ${formatCurrency(t.amount,t.type)}
        </td>
        <td>${t.comment}</td>
        <td>
        <button class="delete" onclick="deleteTransaction(${t.id})">
        ✖
        </button>
        </td>
        `

        table.appendChild(row)

    })

}

function deleteTransaction(id){

    transactions = transactions.filter(t => t.id !== id)

    saveTransactions()

    renderTransactions(transactions)

    updateStatistics(transactions)

}

function applyFilters(){

    const category = document.getElementById("filterCategory").value
    const from = document.getElementById("filterFrom").value
    const to = document.getElementById("filterTo").value

    const filtered = transactions.filter(t=>{

        if(category !== "all" && t.category !== category)
        return false

        if(from && new Date(t.date) < new Date(from))
        return false

        if(to && new Date(t.date) > new Date(to))
        return false

        return true

    })

    renderTransactions(filtered)

    updateStatistics(filtered)

}

function searchComment(){

    const text = document
    .getElementById("search")
    .value
    .toLowerCase()

    const filtered = transactions.filter(t =>
        t.comment.toLowerCase().includes(text)
    )

    renderTransactions(filtered)

    updateStatistics(filtered)

}

function updateStatistics(list){

    let income = 0
    let expense = 0

    list.forEach(t=>{

        if(t.type === "income"){
            income += t.amount
        }else{
            expense += t.amount
        }

    })

    incomeElement.textContent =
    income.toLocaleString("ru-RU",{minimumFractionDigits:2})

    expenseElement.textContent =
    expense.toLocaleString("ru-RU",{minimumFractionDigits:2})

    const balance = income - expense

    balanceElement.textContent =
    balance.toLocaleString("ru-RU",{minimumFractionDigits:2})

    if(balance < 0){
        balanceElement.style.color = "#e74c3c"
    }else{
        balanceElement.style.color = "#2ecc71"
    }

    drawChart(list)

}

function drawChart(list){

    let categories = {}

    list.forEach(t=>{

        if(t.type === "expense"){

            if(!categories[t.category])
            categories[t.category] = 0

            categories[t.category] += t.amount

        }

    })

    const total =
    Object.values(categories)
    .reduce((a,b)=>a+b,0)

    let text = ""

    for(let cat in categories){

        const percent =
        ((categories[cat]/total)*100).toFixed(1)

        const bar =
        "#".repeat(Math.round(percent/2))

        text += `${cat} ${percent}% ${bar}\n`

    }

    chartElement.textContent = text

}

function exportCSV(){

    let csv = "Дата,Тип,Категория,Сумма,Комментарий\n"

    transactions.forEach(t=>{

        csv +=
        `${t.date},${t.type},${t.category},${t.amount},${t.comment}\n`

    })

    const blob = new Blob([csv],{type:"text/csv"})

    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")

    link.href = url
    link.download = "finance.csv"

    link.click()

}