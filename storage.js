let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

export function getTransactions() {
    return [...transactions];
}

export function saveTransactions(newTransactions) {
    transactions = newTransactions;
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

export function addTransaction(transaction) {
    transactions.push(transaction);
    saveTransactions(transactions);
    return transactions;
}

export function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions(transactions);
    return transactions;
}