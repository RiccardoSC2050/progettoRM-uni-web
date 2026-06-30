import { escapeHtml } from "../../../utils/escapeHtml.js?v=rmk-sim-db-v5";
import { renderContractCards } from "./render/contractDetailCards.js?v=rmk-sim-db-v5";
import { renderCallsFilter, renderCallsList, renderCallsTable } from "./render/contractDetailCallsRender.js?v=rmk-sim-db-v5";

export { renderCallsFilter, renderCallsList, renderCallsTable, renderContractCards };

export function renderMissingContractNumber() {
  return `
    <section class="contracts-page contract-detail-page">
      <p class="contracts-empty">Numero contratto non specificato.</p>
    </section>
  `;
}

export function renderContractDetailLoading() {
  return `
    <h2>Dettaglio contratto</h2>
    <p>Caricamento contratto...</p>
  `;
}

export function renderContractDetailError(message = "Errore nel caricamento del dettaglio contratto.") {
  return `
    <h2>Dettaglio contratto</h2>
    <p>${escapeHtml(message)}</p>
  `;
}

export function renderContractDetailPage(contract) {
  return `
    <section class="contracts-page contract-detail-page">
      <header class="contracts-header">
        <div class="contracts-header-text">
          <h2>Contratto ${escapeHtml(contract.numero)}</h2>
          <p>Dettaglio del contratto telefonico selezionato.</p>
        </div>

        <a class="contracts-detail-link" href="#/contratti-dettaglio">Torna ai contratti</a>
      </header>

      ${renderContractCards(contract)}

      <section class="contract-calls-section">
        ${renderCallsFilter()}
        <div class="contract-calls-content"></div>
      </section>
    </section>
  `;
}
