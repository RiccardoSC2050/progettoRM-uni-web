import {
  formatContractType,
  formatContractValue,
  formatDate,
  formatNumber,
} from "./contractsFormatters.js?v=rmk-contracts-mobile-fix-v1";

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
        <td class="contracts-cell-number" data-label="Numero"><strong>${contract.numero}</strong></td>
        <td class="contracts-cell-type" data-label="Tipo"><span class="contracts-type-badge contracts-type-${contract.tipo}">${formatContractType(contract.tipo)}</span></td>
        <td class="contracts-cell-date" data-label="Data attivazione">${formatDate(contract.dataAttivazione)}</td>
        <td class="contracts-cell-value" data-label="Credito / minuti">${formatContractValue(contract)}</td>
        <td class="contracts-cell-sim" data-label="SIM attiva">${renderSimCell(contract)}</td>
        <td class="contracts-cell-calls" data-label="Telefonate">${formatNumber(contract.numeroTelefonate)}</td>
        <td class="contracts-cell-action" data-label="Azione">
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
