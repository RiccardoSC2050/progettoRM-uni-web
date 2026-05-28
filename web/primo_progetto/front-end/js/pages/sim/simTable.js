import { escapeHtml, formatDate } from "./simFormatters.js?v=rmk-sim-responsive-v2";

function simPayload(sim) {
  return escapeHtml(JSON.stringify(sim));
}

function renderRows(items) {
  return items
    .map((sim) => `
      <tr>
        <td class="sim-cell-code" data-label="Codice"><strong>${escapeHtml(sim.codice)}</strong></td>
        <td class="sim-cell-type" data-label="Tipo">${escapeHtml(sim.tipoSIM)}</td>
        <td class="sim-cell-contract" data-label="Contratto">${escapeHtml(sim.eraAssociataA)}</td>
        <td class="sim-cell-date" data-label="Attivazione">${formatDate(sim.dataAttivazione)}</td>
        <td class="sim-cell-date" data-label="Disattivazione">${formatDate(sim.dataDisattivazione)}</td>
        <td class="sim-cell-actions" data-label="Azioni">
          <button class="sim-table-btn sim-table-btn-edit" type="button" data-edit="${simPayload(sim)}">Modifica</button>
          <button class="sim-table-btn sim-table-btn-delete" type="button" data-delete="${escapeHtml(sim.codice)}">Elimina</button>
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
