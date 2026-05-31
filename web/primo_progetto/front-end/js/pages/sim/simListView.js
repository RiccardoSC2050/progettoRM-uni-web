import { formatNumber } from "./simFormatters.js?v=rmk-architecture-v1";
import { renderSimFilter } from "./simFilter.js?v=rmk-architecture-v1";
import { renderSimForm } from "./simForm.js?v=rmk-architecture-v1";
import { renderSimSummary } from "./simSummary.js?v=rmk-architecture-v1";
import { renderSimTable } from "./simTable.js?v=rmk-architecture-v1";

export function renderSimListLoading() {
  return `
    <h2>Gestione SIM</h2>
    <p>Caricamento SIM disattive...</p>
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
          <h2>Gestione SIM disattive</h2>
          <p>Pagina dedicata al CRUD della tabella SIMDisattiva.</p>
        </div>

        <strong>${formatNumber(start)}-${formatNumber(end)} / ${formatNumber(totale)}</strong>
      </header>

      ${renderSimSummary(summary)}
      ${renderSimForm(null, "create", { contractOptions })}
      ${renderSimFilter(filters)}

      <section class="sim-table-card">
        <div class="sim-section-heading">
          <h3>SIM disattive registrate</h3>
          <p>Modifica o elimina la riga interessata.</p>
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
