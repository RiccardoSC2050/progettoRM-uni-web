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
    const downloaded = snapshot.downloaded || {};
    const imported = snapshot.imported || {};
    const skipped = snapshot.skipped || {};
    const resources = [...new Set([
        ...Object.keys(downloaded),
        ...Object.keys(imported)
    ])];

    const rows = resources.map(resource => {
        const received = Number(downloaded[resource] || 0);
        const saved = Number(imported[resource] || 0);
        const ignored = Number(skipped[resource] || 0);
        return `${resource}: ${saved} salvate su ${received} scaricate${
            ignored > 0 ? ` (${ignored} ignorate)` : ""
        }`;
    });

    return [
        "Importazione completata.",
        `Database: ${snapshot.database}`,
        `Limite: ${snapshot.limitPerResource} righe per tabella`,
        "",
        ...(rows.length ? rows : ["Nessuna riga importata."]),
        "",
        "Usare 'Visualizza PostgreSQL locale' per controllare tabelle e dati."
    ].join("\n");
}

function buildProgressDetail(snapshot) {
    const details = [];

    if (snapshot.resource) {
        details.push(`Tabella: ${snapshot.resource}`);
    }
    if (Number(snapshot.targetCurrent) > 0) {
        const ignored = Math.max(
            0,
            Number(snapshot.downloadedCurrent || 0) - Number(snapshot.importedCurrent || 0)
        );
        details.push(
            `scaricate ${snapshot.downloadedCurrent}/${snapshot.targetCurrent}`,
            `salvate ${snapshot.importedCurrent}`
        );
        if (ignored > 0) {
            details.push(`ignorate ${ignored} senza relazione valida`);
        }
    }
    if (Number(snapshot.targetTotal) > 0) {
        details.push(`totale ${snapshot.downloadedTotal}/${snapshot.targetTotal}`);
    }
    if (snapshot.message && snapshot.message !== snapshot.phase) {
        details.push(snapshot.message);
    }

    return details.join(" — ") || "Operazione in corso.";
}
