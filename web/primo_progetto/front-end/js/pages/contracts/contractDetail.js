import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-architecture-v1";
import { getContractCalls, getContractDetail } from "../../api/contractsApi.js?v=rmk-architecture-v1";
import {
  getCallsFilters,
  getCallsPageSize,
  getRangeEnd,
  getRangeStart
} from "./detail/contractDetailState.js?v=rmk-architecture-v1";
import {
  renderCallsList,
  renderContractDetailError,
  renderContractDetailLoading,
  renderContractDetailPage,
  renderMissingContractNumber
} from "./detail/contractDetailRender.js?v=rmk-architecture-v1";

async function renderCalls(container, numero, page = 1, filters = {}) {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = getCallsPageSize();
  const offset = (currentPage - 1) * pageSize;
  const callsContainer = container.querySelector(".contract-calls-content");

  if (!callsContainer) {
    return;
  }

  callsContainer.innerHTML = `<p class="contracts-empty">Caricamento telefonate...</p>`;

  try {
    const result = await getContractCalls({
      numero,
      ...filters,
      limit: pageSize,
      offset
    });

    if (!result.success) {
      callsContainer.innerHTML = `<p class="contracts-empty">Errore: ${escapeHtml(result.message)}</p>`;
      return;
    }

    const { totale, telefonate, hasNext, hasPrevious } = result.data;
    const start = getRangeStart(currentPage, totale, telefonate.length);
    const end = getRangeEnd(currentPage, totale, telefonate.length);

    callsContainer.innerHTML = renderCallsList({
      start,
      end,
      totale,
      telefonate,
      currentPage,
      hasNext,
      hasPrevious
    });

    callsContainer.querySelectorAll(".contract-calls-page-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const nextPage = Number(button.dataset.page);

        if (Number.isFinite(nextPage) && nextPage > 0) {
          renderCalls(container, numero, nextPage, getCallsFilters(container));
        }
      });
    });
  } catch (error) {
    callsContainer.innerHTML = `<p class="contracts-empty">Errore nel caricamento delle telefonate.</p>`;
  }
}

function bindContractCallsFilter(container, contract) {
  const filterForm = container.querySelector(".contract-calls-filter-form");

  if (!filterForm) {
    return;
  }

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderCalls(container, contract.numero, 1, getCallsFilters(container));
  });

  filterForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      renderCalls(container, contract.numero, 1, {});
    }, 0);
  });
}

export async function renderContractDetail(container, numero) {
  if (!numero) {
    container.innerHTML = renderMissingContractNumber();
    return;
  }

  container.innerHTML = renderContractDetailLoading();

  try {
    const result = await getContractDetail(numero);

    if (!result.success) {
      container.innerHTML = renderContractDetailError(`Errore: ${result.message}`);
      return;
    }

    const contract = result.data;

    container.innerHTML = renderContractDetailPage(contract);
    bindContractCallsFilter(container, contract);
    renderCalls(container, contract.numero, 1, {});
  } catch (error) {
    container.innerHTML = renderContractDetailError();
  }
}
