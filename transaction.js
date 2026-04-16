import { saveTransactions, getTransactions } from "./storage.js";

export function addTransaction(t) {
    const transactions = getTransactions();
    transactions.push(t);
    saveTransactions(transactions);
    return transactions;
}

export function deleteTransactionById(id) {
    let transactions = getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions(transactions);
    return transactions;
}