export let sortDirection = "desc";

export function setDefaultDate() {
    document.getElementById("date").value = new Date().toISOString().slice(0, 10);
}

export function renderTransactions(list) {
    const tbody = document.getElementById("transactionTable");
    tbody.innerHTML = "";

    const sorted = [...list].sort((a, b) =>
        sortDirection === "desc"
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(a.date)
    );

    sorted.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="Дата">${t.date}</td>
            <td data-label="Тип">${t.type === "income" ? "Доход" : "Расход"}</td>
            <td data-label="Категория">${t.category}</td>
            <td data-label="Сумма" class="${t.type}">${t.amount.toLocaleString('ru-RU')}</td>
            <td data-label="Комментарий">${t.comment}</td>
            <td><button class="delete-btn" data-id="${t.id}">✕</button></td>
        `;
        tbody.appendChild(row);
    });
}