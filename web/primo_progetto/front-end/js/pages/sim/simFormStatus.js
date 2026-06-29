import { escapeHtml } from "./simFormatters.js?v=rmk-sim-db-v1";

function getFinalStatus(sim, mode, intent) {
  if (mode === "create") {
    return "non_attiva";
  }

  if (intent === "activate") {
    return "attiva";
  }

  if (intent === "deactivate") {
    return "disattiva";
  }

  return sim?.stato || "non_attiva";
}

function getStatusLabel(status) {
  return {
    attiva: "Attiva",
    disattiva: "Disattivata",
    non_attiva: "Non attiva"
  }[status] || "Non attiva";
}

function getStatusHelp(mode, intent, status) {
  if (mode === "create") {
    return "La SIM nasce senza contratto e senza date.";
  }

  if (intent === "activate") {
    return "La SIM verrà collegata a un contratto libero.";
  }

  if (intent === "deactivate") {
    return "La SIM verrà archiviata nello storico disattivate.";
  }

  return `Stato attuale: ${status.replace("_", " ")}.`;
}

export function renderStatusField(sim, mode, intent) {
  const status = getFinalStatus(sim, mode, intent);

  return `
    <input type="hidden" name="statoFinale" value="${escapeHtml(status)}" />
    <div class="sim-field sim-state-info">
      <span>${mode === "create" ? "Stato iniziale" : "Risultato"}</span>
      <strong>${getStatusLabel(status)}</strong>
      <small class="sim-field-help">${getStatusHelp(mode, intent, status)}</small>
    </div>
  `;
}
