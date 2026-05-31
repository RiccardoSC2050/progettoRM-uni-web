import {
  formatCurrency,
  formatDate,
  formatDuration,
  formatNumber,
  formatTime
} from "./callsFormatters.js?v=rmk-contracts-mobile-fix-v1";

function renderRows(calls) {
  return calls
    .map((call) => `
      <tr>
        <td class="calls-cell-id" data-label="ID"><strong>${formatNumber(call.id)}</strong></td>
        <td class="calls-cell-contract" data-label="Contratto">
          <a href="#/contratto?numero=${encodeURIComponent(call.effettuataDa)}">${call.effettuataDa}</a>
        </td>
        <td class="calls-cell-date" data-label="Data">${formatDate(call.data)}</td>
        <td class="calls-cell-time" data-label="Ora">${formatTime(call.ora)}</td>
        <td class="calls-cell-duration" data-label="Durata">${formatDuration(call.durata)}</td>
        <td class="calls-cell-cost" data-label="Costo">${formatCurrency(call.costo)}</td>
      </tr>
    `)
    .join("");
}

export function renderCallsTable(calls) {
  return `
    <div class="calls-table-wrapper">
      <table class="calls-table">
        <thead>
          <tr>
            <th class="calls-cell-id">ID</th>
            <th class="calls-cell-contract">Contratto</th>
            <th class="calls-cell-date">Data</th>
            <th class="calls-cell-time">Ora</th>
            <th class="calls-cell-duration">Durata</th>
            <th class="calls-cell-cost">Costo</th>
          </tr>
        </thead>
        <tbody>
          ${renderRows(calls)}
        </tbody>
      </table>
    </div>
  `;
}
