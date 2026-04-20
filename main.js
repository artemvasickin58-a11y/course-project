import { getAllTransactions, addNewTransaction, deleteTransactionById } from "./transaction.js";
import { renderTransactions, setDefaultDate, sortDirection } from "./ui.js";
import { updateStatistics } from "./Calculation.js";
import { filterTransactions } from "./filters.js";
import { initTheme } from "./Theme.js";

let currentFilters = {
    type: "all",
    category: "all",
    from: null,
    to: null
};

function applyFilters() {
    const type = document.getElementById("filterType").value;
    const category = document.getElementById("filterCategory").value;
    const from = document.getElementById("filterFrom").value || null;
    const to = document.getElementById("filterTo").value || null;

    currentFilters = { type, category, from, to };

    const all = getAllTransactions();
    const filtered = filterTransactions(all, currentFilters);

    renderTransactions(filtered);
    updateStatistics(filtered);
}

function resetFilters() {
    currentFilters = { type: "all", category: "all", from: null, to: null };

    document.getElementById("filterType").value = "all";
    document.getElementById("filterCategory").value = "all";
    document.getElementById("filterFrom").value = "";
    document.getElementById("filterTo").value = "";

    const all = getAllTransactions();
    renderTransactions(all);
    updateStatistics(all);
}

function exportCSV() {
    const list = getAllTransactions(); // или текущий отфильтрованный список, если хочешь
    if (list.length === 0) return alert("Нет данных для экспорта");

    let csv = "Дата,Тип,Категория,Сумма,Комментарий\n";
    list.forEach(t => {
        csv += `${t.date},${t.type},${t.category},${t.amount},"${(t.comment || "").replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `финансы_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

// Инициализация всех событий
function setupEventListeners() {
    // Форма добавления
    document.getElementById("transactionForm").addEventListener("submit", e => {
        e.preventDefault();

        const formData = {
            amount: document.getElementById("amount").value,
            type: document.getElementById("type").value,
            category: document.getElementById("category").value,
            date: document.getElementById("date").value,
            comment: document.getElementById("comment").value.trim()
        };

        if (!formData.amount || !formData.type || !formData.category || !formData.date) {
            alert("Заполните все обязательные поля");
            return;
        }

        const updatedList = addNewTransaction(formData);

        renderTransactions(updatedList);
        updateStatistics(updatedList);

        e.target.reset();
        setDefaultDate();
    });

    // Фильтры
    window.applyFilters = applyFilters;
    window.resetFilters = resetFilters;
    window.exportCSV = exportCSV;

    // Удаление (делегирование)
    document.getElementById("transactionTable").addEventListener("click", e => {
        if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
            if (!confirm("Удалить эту транзакцию?")) return;

            const id = Number(e.target.dataset.id);
            const updated = deleteTransactionById(id);

            const filtered = filterTransactions(updated, currentFilters);
            renderTransactions(filtered);
            updateStatistics(filtered);
        }
    });

    // Сортировка по дате
    document.getElementById("dateHeader").addEventListener("click", () => {
        window.location.reload(); 
    });
}

// Главная инициализация
function init() {
    setDefaultDate();
    initTheme();

    const data = getAllTransactions();
    renderTransactions(data);
    updateStatistics(data);

    setupEventListeners();
}

init();