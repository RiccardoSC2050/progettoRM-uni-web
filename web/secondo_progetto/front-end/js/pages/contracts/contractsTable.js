import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v5";
import {
  formatContractType,
  formatContractValue,
  formatDate,
  formatNumber
} from "./contractsFormatters.js?v=rmk-sim-db-v5";

function getContractTypeClass(type) {
  return type === "ricarica" ? "ricarica" : "consumo";
}

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
      <span>${escapeHtml(contract.tipoSIM)}</span>
    </div>
  `;
}

function renderRows(contracts) {
  return contracts
    .map((contract) => {
      const numero = escapeHtml(contract.numero);
      const numeroParam = encodeURIComponent(contract.numero);
      const typeClass = getContractTypeClass(contract.tipo);

      return `
        <tr>
          <td class="contracts-cell-number" data-label="Numero"><strong>${numero}</strong></td>
          <td class="contracts-cell-type" data-label="Tipo"><span class="contracts-type-badge contracts-type-${typeClass}">${formatContractType(contract.tipo)}</span></td>
          <td class="contracts-cell-date" data-label="Data attivazione">${formatDate(contract.dataAttivazione)}</td>
          <td class="contracts-cell-value" data-label="Valore contratto">${formatContractValue(contract)}</td>
          <td class="contracts-cell-sim" data-label="SIM attiva">${renderSimCell(contract)}</td>
          <td class="contracts-cell-calls" data-label="Telefonate">${formatNumber(contract.numeroTelefonate)}</td>
          <td class="contracts-cell-action" data-label="Azione">
            <a class="contracts-row-link" href="#/contratto?numero=${numeroParam}">Dettaglio →</a>
          </td>
        </tr>
      `;
    })
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
            <th class="contracts-cell-value">Valore contratto</th>
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
