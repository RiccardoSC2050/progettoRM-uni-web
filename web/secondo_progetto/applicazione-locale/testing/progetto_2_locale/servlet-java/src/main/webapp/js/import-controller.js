import { requestJson } from "./api-client.js";
import { endpoints, POLL_INTERVAL_MS } from "./config.js";
import {
    isValidDatabaseName,
    nextDefaultDatabase,
    normalizeDatabaseName,
    renderDatabases,
    updateDatabaseSelection
} from "./database-view.js";
import { DatabaseSyncView } from "./database-sync.js";
import { ProgressView, summarizeCompleted } from "./progress-view.js";

const elements = collectElements();
let currentDatabases = [];
let firstDatabaseLoad = true;

const progressView = new ProgressView({
    panel: elements.progressPanel,
    track: elements.progressTrack,
    bar: elements.progressBar,
    label: elements.progressLabel,
    percentageLabel: elements.progressPercentage,
    detail: elements.progressDetail
});
const databaseSyncView = new DatabaseSyncView({
    button: elements.refreshDatabasesButton,
    status: elements.databaseSyncStatus
});

async function execute(button, output, task) {
    button.disabled = true;
    try {
        output.textContent = "Operazione in corso...";
        const result = await task();
        output.textContent = JSON.stringify(result, null, 2);
        return result;
    } catch (error) {
        output.textContent = error.message;
        return null;
    } finally {
        button.disabled = false;
    }
}

async function loadDatabases() {
    const result = await requestJson(endpoints.databases);
    currentDatabases = [...new Set(result.databases || [])];
    renderDatabases(elements, currentDatabases, deleteDatabase);

    if (firstDatabaseLoad) {
        updateDatabaseSelection(elements, nextDefaultDatabase(currentDatabases));
        firstDatabaseLoad = false;
    }
    return result;
}

async function synchronizeDatabases(options = {}) {
    return databaseSyncView.synchronize(loadDatabases, options);
}

async function deleteDatabase(database, button) {
    const confirmed = window.confirm(
        `Eliminare definitivamente il database locale "${database}"?\n\n` +
        "L'operazione non può essere annullata."
    );
    if (!confirmed) {
        return;
    }

    const item = button.closest(".database-item");
    button.disabled = true;
    item?.setAttribute("aria-busy", "true");
    elements.statusOutput.textContent = `Eliminazione di ${database} in corso...`;

    try {
        const result = await requestJson(endpoints.deleteDatabase(database), { method: "DELETE" });
        const deletedKey = String(database).toUpperCase();
        currentDatabases = currentDatabases.filter(
            itemName => String(itemName).toUpperCase() !== deletedKey
        );
        renderDatabases(elements, currentDatabases, deleteDatabase);

        if (normalizeDatabaseName(elements.databaseName.value).toUpperCase() === deletedKey) {
            updateDatabaseSelection(elements, nextDefaultDatabase(currentDatabases));
        }

        await synchronizeDatabases({ announce: false });
        elements.statusOutput.textContent =
            `Database locale eliminato: ${result.database || database}. Elenco sincronizzato.`;
    } catch (error) {
        elements.statusOutput.textContent = error.message;
        button.disabled = false;
        item?.removeAttribute("aria-busy");
    }
}

async function waitForJob(jobId) {
    while (true) {
        const snapshot = await requestJson(endpoints.importProgress(jobId));
        progressView.update(snapshot);

        if (snapshot.status === "completed") {
            return snapshot;
        }
        if (snapshot.status === "failed") {
            throw new Error(snapshot.message || "Importazione interrotta.");
        }
        await delay(POLL_INTERVAL_MS);
    }
}

function setImportControlsDisabled(disabled) {
    elements.importButton.disabled = disabled;
    elements.recordLimit.disabled = disabled;
    elements.databaseName.disabled = disabled;
}

async function startImport() {
    const database = updateDatabaseSelection(elements, elements.databaseName.value);
    const limit = Number(elements.recordLimit.value);

    if (!isValidDatabaseName(database)) {
        elements.importOutput.textContent =
            "Nome non valido. Usare solo lettere, numeri o underscore e iniziare con una lettera.";
        elements.databaseName.focus();
        return;
    }

    setImportControlsDisabled(true);
    elements.importOutput.textContent = "Avvio dell'importazione relazionale...";
    progressView.update({
        status: "queued",
        percentage: 0,
        phase: "Preparazione",
        message: "Selezione dei contratti e creazione del processo di importazione."
    });

    try {
        const started = await requestJson(
            endpoints.importStart(database, limit),
            { method: "POST" }
        );
        const completed = await waitForJob(started.jobId);
        elements.importOutput.textContent = summarizeCompleted(completed);
        await synchronizeDatabases({ announce: false });
    } catch (error) {
        progressView.update({
            status: "failed",
            percentage: progressView.currentPercentage(),
            phase: "Importazione interrotta",
            message: error.message
        });
        elements.importOutput.textContent = error.message;
    } finally {
        setImportControlsDisabled(false);
    }
}

function registerEvents() {
    elements.databaseName.addEventListener("input", () => {
        const database = normalizeDatabaseName(elements.databaseName.value);
        elements.databaseBrowserLink.href = endpoints.databaseBrowser(database);
    });

    elements.databaseName.addEventListener("blur", () => {
        updateDatabaseSelection(elements, elements.databaseName.value);
    });

    elements.statusButton.addEventListener("click", () => execute(
        elements.statusButton,
        elements.statusOutput,
        () => requestJson(endpoints.status)
    ));

    elements.refreshDatabasesButton.addEventListener("click", async () => {
        try {
            await synchronizeDatabases();
        } catch (error) {
            elements.statusOutput.textContent = error.message;
        }
    });

    elements.importButton.addEventListener("click", startImport);
}

function collectElements() {
    return {
        statusButton: document.getElementById("statusButton"),
        importButton: document.getElementById("importButton"),
        refreshDatabasesButton: document.getElementById("refreshDatabasesButton"),
        databaseSyncStatus: document.getElementById("databaseSyncStatus"),
        databaseName: document.getElementById("databaseName"),
        recordLimit: document.getElementById("recordLimit"),
        databaseSuggestions: document.getElementById("databaseSuggestions"),
        existingDatabases: document.getElementById("existingDatabases"),
        statusOutput: document.getElementById("statusOutput"),
        importOutput: document.getElementById("importOutput"),
        databaseBrowserLink: document.getElementById("databaseBrowserLink"),
        progressPanel: document.getElementById("progressPanel"),
        progressTrack: document.getElementById("progressTrack"),
        progressBar: document.getElementById("progressBar"),
        progressLabel: document.getElementById("progressLabel"),
        progressPercentage: document.getElementById("progressPercentage"),
        progressDetail: document.getElementById("progressDetail")
    };
}

function delay(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

registerEvents();
updateDatabaseSelection(elements, elements.databaseName.value);
synchronizeDatabases({ announce: false });
