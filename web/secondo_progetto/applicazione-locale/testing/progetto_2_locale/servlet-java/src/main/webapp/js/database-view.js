import {
    DATABASE_NAME_PATTERN,
    DEFAULT_DATABASE,
    DEFAULT_DATABASES,
    endpoints
} from "./config.js";

export function normalizeDatabaseName(value) {
    const normalized = String(value || "")
        .normalize("NFKC")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .trim();
    return normalized || DEFAULT_DATABASE;
}

export function isValidDatabaseName(value) {
    return DATABASE_NAME_PATTERN.test(value);
}

export function nextDefaultDatabase(databases = []) {
    const existing = new Set(databases.map(database => String(database).toUpperCase()));

    for (const database of DEFAULT_DATABASES) {
        if (!existing.has(database.toUpperCase())) {
            return database;
        }
    }

    let sequence = DEFAULT_DATABASES.length + 1;
    while (existing.has(`DATABASE${sequence}`)) {
        sequence += 1;
    }
    return `DATABASE${sequence}`;
}

export function updateDatabaseSelection(elements, value) {
    const database = normalizeDatabaseName(value);
    elements.databaseName.value = database;
    elements.databaseBrowserLink.href = endpoints.databaseBrowser(database);
    return database;
}

export function renderDatabases(elements, databases, onDelete) {
    elements.existingDatabases.replaceChildren();
    renderDatabaseSuggestions(elements, databases);

    if (!databases.length) {
        const empty = document.createElement("p");
        empty.className = "database-empty";
        empty.textContent = "Nessun database locale creato.";
        elements.existingDatabases.appendChild(empty);
        return;
    }

    for (const database of databases) {
        const item = document.createElement("div");
        item.className = "database-item";
        item.dataset.database = database;

        const selectButton = document.createElement("button");
        selectButton.type = "button";
        selectButton.className = "database-chip";
        selectButton.textContent = database;
        selectButton.title = `Seleziona ${database}`;
        selectButton.addEventListener("click", () => updateDatabaseSelection(elements, database));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "database-delete-button";
        deleteButton.textContent = "Elimina";
        deleteButton.setAttribute("aria-label", `Elimina il database ${database}`);
        deleteButton.addEventListener("click", () => onDelete(database, deleteButton));

        item.append(selectButton, deleteButton);
        elements.existingDatabases.appendChild(item);
    }
}

function renderDatabaseSuggestions(elements, databases) {
    elements.databaseSuggestions.replaceChildren();
    const suggestions = [...new Set([...DEFAULT_DATABASES, ...databases])];

    for (const database of suggestions) {
        const option = document.createElement("option");
        option.value = database;
        elements.databaseSuggestions.appendChild(option);
    }
}
