import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v1";
import { getCalls } from "../../api/callsApi.js?v=rmk-sim-db-v1";
import { formatCurrency, formatNumber } from "./callsFormatters.js?v=rmk-sim-db-v1";
import { getCallsFiltersFromForm, renderCallsFilter } from "./callsFilter.js?v=rmk-sim-db-v1";
import { renderCallsTable } from "./callsTable.js?v=rmk-sim-db-v1";
import { getResponsivePageSize } from "../../utils/responsivePageSize.js?v=rmk-sim-db-v1";

const DESKTOP_PAGE_SIZE = 15;
const MOBILE_PAGE_SIZE = 3;

function getRangeStart(page, total, count, pageSize) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return (page - 1) * pageSize + 1;
}

function getRangeEnd(page, total, count, pageSize) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return Math.min(page * pageSize, total);
}

function setCallsPage(page, filters = {}) {
  const params = new URLSearchParams({ page });

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  window.location.hash = `#/telefonate-dettaglio?${params.toString()}`;
}

export async function renderCallsList(container, params = new URLSearchParams()) {
  const currentPage = Math.max(1, Number(params.get("page")) || 1);
  const filters = {
    q: params.get("q") || "",
    data: params.get("data") || "",
    durataMin: params.get("durataMin") || "",
    costoMin: params.get("costoMin") || "",
    costoMax: params.get("costoMax") || ""
  };
  const pageSize = getResponsivePageSize(DESKTOP_PAGE_SIZE, MOBILE_PAGE_SIZE);
  const offset = (currentPage - 1) * pageSize;

  container.innerHTML = `
    <h2>Telefonate</h2>
    <p>Caricamento elenco telefonate...</p>
  `;

  try {
    const result = await getCalls({
      ...filters,
      limit: pageSize,
      offset
    });

    if (!result.success) {
      container.innerHTML = `
        <h2>Telefonate</h2>
        <p>Errore: ${escapeHtml(result.message)}</p>
      `;
      return;
    }

    const { totale, telefonate, hasNext, hasPrevious, summary } = result.data;
    const start = getRangeStart(currentPage, totale, telefonate.length, pageSize);
    const end = getRangeEnd(currentPage, totale, telefonate.length, pageSize);

    container.innerHTML = `
      <section class="calls-page calls-list-page">
        <header class="calls-page-header">
          <div>
            <h2>Telefonate registrate</h2>
            <p>Pagina dedicata alla consultazione completa delle telefonate.</p>
          </div>

          <strong>${formatNumber(start)}-${formatNumber(end)} / ${formatNumber(totale)}</strong>
        </header>

        <section class="calls-detail-total-card">
          <span>Entrate totali</span>
          <strong>${formatCurrency(summary?.entrateTotali || 0)}</strong>
        </section>

        ${renderCallsFilter(filters)}

        <section class="calls-table-card">
          <div class="calls-section-heading">
            <h3>Elenco telefonate</h3>
            <p>Visualizzazione di ${formatNumber(pageSize)} telefonate alla volta.</p>
          </div>

          ${telefonate.length > 0 ? renderCallsTable(telefonate) : `<p class="calls-empty">Nessuna telefonata trovata.</p>`}

          <nav class="calls-pagination" aria-label="Paginazione telefonate">
            <button class="calls-page-btn" type="button" data-page="${currentPage - 1}" ${!hasPrevious ? "disabled" : ""}>‹</button>
            <span>Pagina ${formatNumber(currentPage)}</span>
            <button class="calls-page-btn" type="button" data-page="${currentPage + 1}" ${!hasNext ? "disabled" : ""}>›</button>
          </nav>
        </section>
      </section>
    `;

    bindEvents(container, filters);
  } catch (error) {
    container.innerHTML = `
      <h2>Telefonate</h2>
      <p>Errore nel caricamento della pagina telefonate.</p>
    `;
  }
}

function bindEvents(container, filters) {
  const filterForm = container.querySelector(".calls-filter-form");

  if (filterForm) {
    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      setCallsPage(1, getCallsFiltersFromForm(filterForm));
    });

    filterForm.addEventListener("reset", () => {
      window.setTimeout(() => setCallsPage(1), 0);
    });
  }

  container.querySelectorAll(".calls-page-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const page = Number(button.dataset.page);

      if (Number.isFinite(page) && page > 0) {
        setCallsPage(page, filters);
      }
    });
  });
}
