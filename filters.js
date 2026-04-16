export function filterTransactions(transactions, filters) {
    return transactions.filter(t => {
        if (filters.type !== "all" && t.type !== filters.type) return false;
        if (filters.category !== "all" && t.category !== filters.category) return false;
        if (filters.from && t.date < filters.from) return false;
        if (filters.to && t.date > filters.to) return false;
        return true;
    });
}