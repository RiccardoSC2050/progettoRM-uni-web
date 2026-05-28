import {
  formatContractType,
  formatContractValue,
  formatDate,
  formatNumber,
} from "./contractsFormatters.js?v=rmk-calls-pagination-v1";

function renderSimCell(contract) {
  if (!contract.tipoSIM) {
    return `
      <div class="contracts-sim-cell">
        <span>Nessuna SIM</span>
      </div>
    `;
  }

  return `
    <div class="contracts-sim-cell">
      <span>${contract.tipoSIM}</span>
    </div>
  `;
}

function renderRows(contracts) {
  return contracts
    .map(
      (contract) => `
      <tr>
        <td class="contracts-cell-number"><strong>${contract.numero}</strong></td>
        <td class="contracts-cell-type"><span class="contracts-type-badge contracts-type-${contract.tipo}">${formatContractType(contract.tipo)}</span></td>
        <td class="contracts-cell-date">${formatDate(contract.dataAttivazione)}</td>
        <td class="contracts-cell-value">${formatContractValue(contract)}</td>
        <td class="contracts-cell-sim">${renderSimCell(contract)}</td>
        <td class="contracts-cell-calls">${formatNumber(contract.numeroTelefonate)}</td>
        <td class="contracts-cell-action">
          <a class="contracts-row-link" href="#/contratto?numero=${encodeURIComponent(contract.numero)}">Dettaglio →</a>
        </td>
      </tr>
    `,
    )
    .join("");
}

export function renderContractsTable(contracts) {
  return `
    <div class="contracts-table-wrapper">
      <table class="contracts-table">
        <thead>
          <tr>
            <th class="contracts-cell-number">Numero</th>
            <th class="contracts-cell-type">Tipo</th>
            <th class="contracts-cell-date">Data attivazione</th>
            <th class="contracts-cell-value">Credito / minuti</th>
            <th class="contracts-cell-sim">SIM attiva</th>
            <th class="contracts-cell-calls">Telefonate</th>
            <th class="contracts-cell-action">Azione</th>
          </tr>
        </thead>
        <tbody>
          ${renderRows(contracts)}
        </tbody>
      </table>
    </div>
  `;
}
