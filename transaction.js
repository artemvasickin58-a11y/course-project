import { addTransaction as storageAdd, deleteTransaction as storageDelete, getTransactions } from './storage.js';

export function createTransaction(formData) {
    return {
        id: Date.now(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        comment: formData.comment || "—"
    };
}

export function addNewTransaction(formData) {
    const transaction = createTransaction(formData);
    return storageAdd(transaction);
}

export function deleteTransactionById(id) {
    return storageDelete(id);
}

export function getAllTransactions() {
    return getTransactions();
}