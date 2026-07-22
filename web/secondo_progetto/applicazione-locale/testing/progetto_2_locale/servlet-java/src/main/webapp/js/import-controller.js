import { requestJson } from "./api-client.js";
import { endpoints, POLL_INTERVAL_MS } from "./config.js";
import {
    isValidDatabaseName,
    nextDefaultDatabase,
    normalizeDatabaseName,
    renderDatabases,
    updateDatabaseSelection
} from "./database-view.js";
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

async function deleteDatabase(database, button) {
    const confirmed = window.confirm(
        `Eliminare definitivamente il database locale "${database}"?\n\n` +
        "L'operazione non può essere annullata."
    );
    if (!confirmed) {
        return;
    }

    button.disabled = true;
    elements.statusOutput.textContent = `Eliminazione di ${database} in corso...`;

    try {
        const result = await requestJson(endpoints.deleteDatabase(database), {
            method: "DELETE"
        });

        // Aggiornamento immediato della pagina: non dipende da un refresh manuale.
        currentDatabases = currentDatabases.filter(item => item !== database);
        renderDatabases(elements, currentDatabases, deleteDatabase);

        if (normalizeDatabaseName(elements.databaseName.value) === database) {
            updateDatabaseSelection(elements, nextDefaultDatabase(currentDatabases));
        }

        elements.statusOutput.textContent =
            `Database locale eliminato: ${result.database || database}`;

        // Verifica in differita lo stato reale di PostgreSQL. Se l'API impiega
        // qualche istante ad aggiornarsi, la riga eliminata non viene reinserita.
        window.setTimeout(() => {
            verifyDatabaseDeletion(database).catch(error => {
                elements.statusOutput.textContent +=
                    `\nAvviso: elenco non verificato automaticamente (${error.message}).`;
            });
        }, 300);
    } catch (error) {
        elements.statusOutput.textContent = error.message;
        button.disabled = false;
    }
}

async function verifyDatabaseDeletion(database, attempts = 6) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        const result = await requestJson(endpoints.databases);
        const databases = [...new Set(result.databases || [])];

        if (!databases.includes(database)) {
            currentDatabases = databases;
            renderDatabases(elements, currentDatabases, deleteDatabase);
            return;
        }

        await delay(250);
    }

    throw new Error("PostgreSQL non ha ancora aggiornato l'elenco dei database.");
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
    elements.importOutput.textContent = "Avvio dell'importazione...";
    progressView.update({
        status: "queued",
        percentage: 0,
        phase: "Preparazione",
        message: "Creazione del processo di importazione."
    });

    try {
        const started = await requestJson(
            endpoints.importStart(database, limit),
            { method: "POST" }
        );
        const completed = await waitForJob(started.jobId);
        elements.importOutput.textContent = summarizeCompleted(completed);
        await loadDatabases().catch(() => {});
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

    elements.refreshDatabasesButton.addEventListener("click", () => execute(
        elements.refreshDatabasesButton,
        elements.statusOutput,
        loadDatabases
    ));

    elements.importButton.addEventListener("click", startImport);
}

function collectElements() {
    return {
        statusButton: document.getElementById("statusButton"),
        importButton: document.getElementById("importButton"),
        refreshDatabasesButton: document.getElementById("refreshDatabasesButton"),
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
loadDatabases().catch(() => {});
