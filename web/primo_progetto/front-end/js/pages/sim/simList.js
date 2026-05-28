import {
  createSimDisattiva,
  deleteSimDisattiva,
  getSimDisattive,
  updateSimDisattiva
} from "../../api/simDisattiveApi.js?v=rmk-sim-responsive-v2";
import { formatNumber } from "./simFormatters.js?v=rmk-sim-responsive-v2";
import { getSimFiltersFromForm, renderSimFilter } from "./simFilter.js?v=rmk-sim-responsive-v2";
import { getSimFormData, renderSimForm } from "./simForm.js?v=rmk-sim-responsive-v2";
import { renderDeleteModal, renderEditModal } from "./simModal.js?v=rmk-sim-responsive-v2";
import { renderSimSummary } from "./simSummary.js?v=rmk-sim-responsive-v2";
import { renderSimTable } from "./simTable.js?v=rmk-sim-responsive-v2";

const PAGE_SIZE = 15;

function getRangeStart(page, total, count) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return (page - 1) * PAGE_SIZE + 1;
}

function getRangeEnd(page, total, count) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return Math.min(page * PAGE_SIZE, total);
}

function setSimPage(page, filters = {}) {
  const params = new URLSearchParams({ page });

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  window.location.hash = `#/sim-dettaglio?${params.toString()}`;
}

export async function renderSimList(container, params = new URLSearchParams()) {
  const currentPage = Math.max(1, Number(params.get("page")) || 1);
  const filters = {
    q: params.get("q") || "",
    tipoSIM: params.get("tipoSIM") || "",
    dataDisattivazione: params.get("dataDisattivazione") || ""
  };
  const offset = (currentPage - 1) * PAGE_SIZE;

  container.innerHTML = `
    <h2>Gestione SIM</h2>
    <p>Caricamento SIM disattive...</p>
  `;

  async function load() {
    const result = await getSimDisattive({
      ...filters,
      limit: PAGE_SIZE,
      offset
    });

    if (!result.success) {
      container.innerHTML = `
        <h2>Gestione SIM</h2>
        <p>Errore: ${result.message}</p>
      `;
      return;
    }

    const { totale, sim, hasNext, hasPrevious, summary } = result.data;
    const start = getRangeStart(currentPage, totale, sim.length);
    const end = getRangeEnd(currentPage, totale, sim.length);

    container.innerHTML = `
      <section class="sim-page sim-list-page">
        <header class="sim-page-header">
          <div>
            <h2>Gestione SIM disattive</h2>
            <p>Pagina dedicata al CRUD della tabella SIMDisattiva.</p>
          </div>

          <strong>${formatNumber(start)}-${formatNumber(end)} / ${formatNumber(totale)}</strong>
        </header>

        ${renderSimSummary(summary)}
        ${renderSimForm(null, "create")}
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

    bindEvents();
  }

  function bindEvents() {
    const createForm = container.querySelector(".sim-form[data-mode='create']");
    const filterForm = container.querySelector(".sim-filter-form");

    if (createForm) {
      createForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = createForm.querySelector("[type='submit']");
        button.disabled = true;

        try {
          const result = await createSimDisattiva(getSimFormData(createForm));
          alert(result.message);

          if (result.success) {
            setSimPage(1, filters);
          }
        } catch (error) {
          alert("Errore nella creazione della SIM.");
        } finally {
          button.disabled = false;
        }
      });
    }

    if (filterForm) {
      filterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        setSimPage(1, getSimFiltersFromForm(filterForm));
      });

      filterForm.addEventListener("reset", () => {
        window.setTimeout(() => setSimPage(1), 0);
      });
    }

    container.querySelectorAll(".sim-page-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const page = Number(button.dataset.page);

        if (Number.isFinite(page) && page > 0) {
          setSimPage(page, filters);
        }
      });
    });

    container.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        openModal(renderEditModal(JSON.parse(button.dataset.edit)));
      });
    });

    container.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", () => {
        openModal(renderDeleteModal(button.dataset.delete));
      });
    });
  }

  function openModal(markup) {
    const currentModal = document.querySelector(".sim-modal-backdrop");

    if (currentModal) {
      currentModal.remove();
    }

    document.body.insertAdjacentHTML("beforeend", markup);
    bindModalEvents();
  }

  function closeModal() {
    document.querySelector(".sim-modal-backdrop")?.remove();
  }

  function bindModalEvents() {
    const modal = document.querySelector(".sim-modal-backdrop");

    if (!modal) {
      return;
    }

    modal.querySelector(".sim-modal-close")?.addEventListener("click", closeModal);
    modal.querySelector("[data-cancel-modal]")?.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    const editForm = modal.querySelector(".sim-form[data-mode='edit']");

    if (editForm) {
      editForm.addEventListener("reset", (event) => {
        event.preventDefault();
        closeModal();
      });

      editForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
          const result = await updateSimDisattiva(getSimFormData(editForm));
          alert(result.message);

          if (result.success) {
            closeModal();
            await load();
          }
        } catch (error) {
          alert("Errore nella modifica della SIM.");
        }
      });
    }

    modal.querySelector("[data-confirm-delete]")?.addEventListener("click", async (event) => {
      try {
        const result = await deleteSimDisattiva(event.currentTarget.dataset.confirmDelete);
        alert(result.message);

        if (result.success) {
          closeModal();
          await load();
        }
      } catch (error) {
        alert("Errore nell'eliminazione della SIM.");
      }
    });
  }

  try {
    await load();
  } catch (error) {
    container.innerHTML = `
      <h2>Gestione SIM</h2>
      <p>Errore nel caricamento della pagina SIM.</p>
    `;
  }
}
