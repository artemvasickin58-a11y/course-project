let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

export function getTransactions() {
    return transactions;
}

export function saveTransactions(data) {
    transactions = data;
    localStorage.setItem("transactions", JSON.stringify(transactions));
}