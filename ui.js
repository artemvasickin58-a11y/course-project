export const els = {
    form: document.getElementById("transactionForm"),
    tableBody: document.getElementById("transactionTable"),
    dateHeader: document.getElementById("dateHeader"),
};

let sortDirection = "desc";

export function setDefaultDate() {
    document.getElementById("date").value =
        new Date().toISOString().slice(0, 10);
}

export function renderTransactions(list) {
    els.tableBody.innerHTML = "";

    const sorted = [...list].sort((a, b) =>
        sortDirection === "desc"
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date)
    );

    sorted.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.type}</td>
            <td>${t.category}</td>
            <td>${t.amount}</td>
            <td>${t.comment}</td>
        `;
        els.tableBody.appendChild(row);
    });
}