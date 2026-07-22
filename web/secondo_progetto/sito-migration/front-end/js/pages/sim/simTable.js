import { escapeHtml, formatDate, formatSimStatus } from "./simFormatters.js?v=rmk-sim-db-v5";

function simPayload(sim) {
  return escapeHtml(JSON.stringify(sim));
}

function renderEditButton(sim, label, intent, variant = "edit") {
  return `
    <button class="sim-table-btn sim-table-btn-${variant}" type="button" data-edit="${simPayload(sim)}" data-sim-intent="${intent}">
      ${label}
    </button>
  `;
}

function renderActions(sim) {
  if (sim.stato === "disattiva") {
    return `
      <div class="sim-row-actions">
        ${renderEditButton(sim, "Riattiva", "activate", "primary")}
        <button class="sim-table-btn sim-table-btn-delete" type="button" data-delete="${escapeHtml(sim.codice)}">Elimina</button>
      </div>
    `;
  }

  if (sim.stato === "attiva") {
    return `
      <div class="sim-row-actions">
        ${renderEditButton(sim, "Disattiva", "deactivate", "danger")}
        ${renderEditButton(sim, "Modifica", "edit")}
      </div>
    `;
  }

  return `
    <div class="sim-row-actions">
      ${renderEditButton(sim, "Attiva", "activate", "primary")}
      ${renderEditButton(sim, "Modifica", "edit")}
    </div>
  `;
}

function renderRows(items) {
  return items
    .map((sim) => `
      <tr>
        <td class="sim-cell-code" data-label="Codice"><strong>${escapeHtml(sim.codice)}</strong></td>
        <td class="sim-cell-type" data-label="Tipo">${escapeHtml(sim.tipoSIM)}</td>
        <td class="sim-cell-status" data-label="Stato"><span class="sim-status-badge sim-status-${escapeHtml(sim.stato)}">${formatSimStatus(sim.stato)}</span></td>
        <td class="sim-cell-contract" data-label="Contratto">${escapeHtml(sim.contratto || "-")}</td>
        <td class="sim-cell-date" data-label="Attivazione">${formatDate(sim.dataAttivazione)}</td>
        <td class="sim-cell-date" data-label="Disattivazione">${formatDate(sim.dataDisattivazione)}</td>
        <td class="sim-cell-actions" data-label="Azioni">
          ${renderActions(sim)}
        </td>
      </tr>
    `)
    .join("");
}

export function renderSimTable(items) {
  return `
    <div class="sim-table-wrapper">
      <table class="sim-table">
        <thead>
          <tr>
            <th class="sim-cell-code">Codice</th>
            <th class="sim-cell-type">Tipo</th>
            <th class="sim-cell-status">Stato</th>
            <th class="sim-cell-contract">Contratto</th>
            <th class="sim-cell-date">Attivazione</th>
            <th class="sim-cell-date">Disattivazione</th>
            <th class="sim-cell-actions">Azioni</th>
          </tr>
        </thead>
        <tbody>
          ${renderRows(items)}
        </tbody>
      </table>
    </div>
  `;
}
