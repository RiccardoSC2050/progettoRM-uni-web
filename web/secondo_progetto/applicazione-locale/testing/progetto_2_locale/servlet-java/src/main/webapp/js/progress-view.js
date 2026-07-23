const RESOURCE_LABELS = Object.freeze({
    contratti: "Contratti telefonici",
    simAttive: "SIM attive collegate",
    simDisattive: "SIM disattivate collegate",
    telefonate: "Telefonate collegate"
});

export class ProgressView {
    constructor(elements) {
        this.elements = elements;
    }

    update(snapshot) {
        const percentage = Math.max(0, Math.min(100, Number(snapshot.percentage) || 0));
        const { panel, track, bar, label, percentageLabel, detail } = this.elements;

        panel.hidden = false;
        panel.classList.toggle("failed", snapshot.status === "failed");
        panel.classList.toggle("completed", snapshot.status === "completed");
        bar.style.width = `${percentage}%`;
        percentageLabel.textContent = `${percentage}%`;
        label.textContent = snapshot.phase || "Importazione in corso";
        track.setAttribute("aria-valuenow", String(percentage));
        detail.textContent = buildProgressDetail(snapshot);
    }

    currentPercentage() {
        return Number(this.elements.track.getAttribute("aria-valuenow")) || 0;
    }
}

export function summarizeCompleted(snapshot) {
    const imported = snapshot.imported || {};
    const rows = Object.entries(imported).map(([resource, saved]) =>
        `${RESOURCE_LABELS[resource] || resource}: ${Number(saved || 0)} righe importate`
    );

    return [
        "Importazione relazionale completata.",
        `Database: ${snapshot.database}`,
        `Contratti richiesti: massimo ${snapshot.limitPerResource}`,
        "",
        ...(rows.length ? rows : ["Nessuna riga importata."]),
        "",
        "Le SIM attive, le SIM disattivate e le telefonate appartengono ai contratti selezionati.",
        "Aprire 'Visualizza PostgreSQL locale' per navigare tutte le righe e i collegamenti."
    ].join("\n");
}

function buildProgressDetail(snapshot) {
    const details = [];

    if (snapshot.resource) {
        details.push(`Risorsa: ${RESOURCE_LABELS[snapshot.resource] || snapshot.resource}`);
    }
    if (Number(snapshot.targetCurrent) > 0) {
        details.push(
            `analizzate ${snapshot.downloadedCurrent}/${snapshot.targetCurrent}`,
            `importate ${snapshot.importedCurrent}`
        );
    }
    if (Number(snapshot.targetTotal) > 0) {
        details.push(`avanzamento dati ${snapshot.downloadedTotal}/${snapshot.targetTotal}`);
    }
    if (snapshot.message && snapshot.message !== snapshot.phase) {
        details.push(snapshot.message);
    }

    return details.join(" — ") || "Operazione in corso.";
}
