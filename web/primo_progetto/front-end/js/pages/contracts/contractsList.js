import { getContracts } from "../../api/contractsApi.js?v=rmk-contracts-mobile-fix-v1";
import { formatNumber } from "./contractsFormatters.js?v=rmk-contracts-mobile-fix-v1";
import { renderContractsTable } from "./contractsTable.js?v=rmk-contracts-mobile-fix-v1";
import { renderContractsSummary } from "./contractsSummary.js?v=rmk-contracts-mobile-fix-v1";
import { renderContractsSort } from "./contractsSort.js?v=rmk-contracts-mobile-fix-v1";
import { getResponsivePageSize } from "../../utils/responsivePageSize.js?v=rmk-contracts-mobile-fix-v1";

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

function setContractsPage(page, sort, direction) {
  const params = new URLSearchParams({ page, sort, direction });
  window.location.hash = `#/contratti-dettaglio?${params.toString()}`;
}

export async function renderContractsList(container, filters = {}, page = 1, sort = "dataAttivazione", direction = "desc") {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = getResponsivePageSize(DESKTOP_PAGE_SIZE, MOBILE_PAGE_SIZE);
  const offset = (currentPage - 1) * pageSize;

  container.innerHTML = `
    <h2>Contratti</h2>
    <p>Caricamento contratti...</p>
  `;

  try {
    const result = await getContracts({
      ...filters,
      sort,
      direction,
      limit: pageSize,
      offset
    });

    if (!result.success) {
      container.innerHTML = `
        <h2>Contratti</h2>
        <p>Errore: ${result.message}</p>
      `;
      return;
    }

    const { totale, contratti, hasNext, hasPrevious, summary } = result.data;
    const hasContracts = contratti.length > 0;
    const start = getRangeStart(currentPage, totale, contratti.length, pageSize);
    const end = getRangeEnd(currentPage, totale, contratti.length, pageSize);

    container.innerHTML = `
      <section class="contracts-page contracts-list-page">
        <header class="contracts-header">
          <div class="contracts-header-text">
            <h2>Contratti</h2>
            <p>Consultazione completa dei contratti telefonici.</p>
          </div>

          <strong>${formatNumber(start)}-${formatNumber(end)} / ${formatNumber(totale)}</strong>
        </header>

        ${renderContractsSummary(summary)}
        ${renderContractsSort(sort, direction)}

        ${
          hasContracts
            ? `
              ${renderContractsTable(contratti)}

              <nav class="contracts-pagination" aria-label="Paginazione contratti">
                <button class="contracts-page-btn" type="button" data-page="${currentPage - 1}" ${!hasPrevious ? "disabled" : ""}>‹</button>
                <span>Pagina ${formatNumber(currentPage)}</span>
                <button class="contracts-page-btn" type="button" data-page="${currentPage + 1}" ${!hasNext ? "disabled" : ""}>›</button>
              </nav>
            `
            : `<p class="contracts-empty">Nessun contratto trovato con i filtri selezionati.</p>`
        }
      </section>
    `;

    container.querySelectorAll(".contracts-page-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const nextPage = Number(button.dataset.page);

        if (Number.isFinite(nextPage) && nextPage > 0) {
          setContractsPage(nextPage, sort, direction);
        }
      });
    });

    const sortForm = container.querySelector(".contracts-sort-form");

    if (sortForm) {
      sortForm.addEventListener("change", () => {
        const formData = new FormData(sortForm);
        setContractsPage(1, formData.get("sort"), formData.get("direction"));
      });
    }
  } catch (error) {
    container.innerHTML = `
      <h2>Contratti</h2>
      <p>Errore nel caricamento dei contratti.</p>
    `;
  }
}
