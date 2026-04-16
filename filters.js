export function filterTransactions(transactions, filterOptions) {
    return transactions.filter(t => {
        if (filterOptions.type !== "all" && t.type !== filterOptions.type) return false;
        if (filterOptions.category !== "all" && t.category !== filterOptions.category) return false;
        if (filterOptions.from && t.date < filterOptions.from) return false;
        if (filterOptions.to && t.date > filterOptions.to) return false;
        return true;
    });
}