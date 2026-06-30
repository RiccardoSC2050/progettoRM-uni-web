import { formatNumber } from "./simFormatters.js?v=rmk-sim-db-v5";
import { renderSimFilter } from "./simFilter.js?v=rmk-sim-db-v5";
import { renderSimGuideTrigger } from "./simGuide.js?v=rmk-sim-db-v5";
import { renderSimForm } from "./simForm.js?v=rmk-sim-db-v5";
import { renderSimSummary } from "./simSummary.js?v=rmk-sim-db-v5";
import { renderSimTable } from "./simTable.js?v=rmk-sim-db-v5";

export function renderSimListLoading() {
  return `
    <h2>Gestione SIM</h2>
    <p>Caricamento SIM...</p>
  `;
}

export function renderSimListError(message = "Errore nel caricamento della pagina SIM.") {
  return `
    <h2>Gestione SIM</h2>
    <p>${message}</p>
  `;
}

export function renderSimListPage({ currentPage, filters, pageSize, contractOptions, result }) {
  const { totale, sim, hasNext, hasPrevious, summary } = result.data;
  const start = totale === 0 || sim.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = totale === 0 || sim.length === 0 ? 0 : Math.min(currentPage * pageSize, totale);

  return `
    <section class="sim-page sim-list-page">
      <header class="sim-page-header">
        <div>
          <h2>Gestione SIM</h2>
          <p>Pagina dedicata alla gestione completa delle SIM: attive, disattivate e non attive.</p>
        </div>

        <div class="sim-page-header-actions">
          ${renderSimGuideTrigger()}
          <strong>${formatNumber(start)}-${formatNumber(end)} / ${formatNumber(totale)}</strong>
        </div>
      </header>

      ${renderSimSummary(summary)}
      ${renderSimForm(null, "create", { contractOptions })}
      ${renderSimFilter(filters)}

      <section class="sim-table-card">
        <div class="sim-section-heading">
          <h3>SIM registrate</h3>
          <p>Usa Attiva, Disattiva o Modifica per cambiare stato. Le SIM disattivate possono essere riattivate o eliminate.</p>
        </div>

        ${sim.length > 0 ? renderSimTable(sim) : `<p class="sim-empty">Nessuna SIM trovata.</p>`}

        <nav class="sim-pagination" aria-label="Paginazione SIM">
          <button class="sim-page-btn" type="button" data-page="${currentPage - 1}" ${!hasPrevious ? "disabled" : ""}>‹</button>
          <span>Pagina ${formatNumber(currentPage)}</span>
          <button class="sim-page-btn" type="button" data-page="${currentPage + 1}" ${!hasNext ? "disabled" : ""}>›</button>
        </nav>
      </section>
    </section>
  `;
}
