import * as storage from "./storage.js";
import * as transactions from "./transaction.js";
import * as ui from "./ui.js";
import * as filters from "./filters.js";
import * as calculation from "./Calculation.js";
import * as graphic from "./graphic.js";
import * as theme from "./Theme.js";

// ================= ИНИЦИАЛИЗАЦИЯ =================

export function init() {
    const data = storage.getTransactions();

    ui.setDefaultDate();
    theme.initTheme();

    ui.renderTransactions(data);
    calculation.updateStatistics(data);
}

// запуск
init();