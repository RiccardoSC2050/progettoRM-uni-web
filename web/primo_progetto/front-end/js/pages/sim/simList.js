import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-architecture-v1";
import {
  createSimDisattiva,
  deleteSimDisattiva,
  getSimDisattive,
  updateSimDisattiva
} from "../../api/simDisattiveApi.js?v=rmk-architecture-v1";
import { getSimFiltersFromForm } from "./simFilter.js?v=rmk-architecture-v1";
import { getSimFormData } from "./simForm.js?v=rmk-architecture-v1";
import { renderDeleteModal, renderEditModal } from "./simModal.js?v=rmk-architecture-v1";
import { getContractOptions } from "./simOptions.js?v=rmk-architecture-v1";
import { getSimPageSize, getSimRouteState, setSimPage } from "./simListState.js?v=rmk-architecture-v1";
import { renderSimListError, renderSimListLoading, renderSimListPage } from "./simListView.js?v=rmk-architecture-v1";
import {
  bindSimFormAssistance,
  getUserFriendlySimError,
  showSimFormMessage,
  validateSimFormBeforeSubmit
} from "./simValidation.js?v=rmk-architecture-v1";

export async function renderSimList(container, params = new URLSearchParams()) {
  const { currentPage, filters } = getSimRouteState(params);
  const pageSize = getSimPageSize();
  const offset = (currentPage - 1) * pageSize;
  let contractOptions = [];

  container.innerHTML = renderSimListLoading();

  async function load() {
    const [result, loadedContracts] = await Promise.all([
      getSimDisattive({
        ...filters,
        limit: pageSize,
        offset
      }),
      getContractOptions()
    ]);

    contractOptions = loadedContracts;

    if (!result.success) {
      container.innerHTML = renderSimListError(`Errore: ${escapeHtml(result.message)}`);
      return;
    }

    container.innerHTML = renderSimListPage({
      currentPage,
      filters,
      pageSize,
      contractOptions,
      result
    });

    bindEvents();
  }

  function bindEvents() {
    bindCreateForm();
    bindFilterForm();
    bindPagination();
    bindRowActions();
  }

  function bindCreateForm() {
    const createForm = container.querySelector(".sim-form[data-mode='create']");

    if (!createForm) {
      return;
    }

    bindSimFormAssistance(createForm, { contractOptions });

    createForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!validateSimFormBeforeSubmit(createForm)) {
        return;
      }

      const button = createForm.querySelector("[type='submit']");
      button.disabled = true;

      try {
        const result = await createSimDisattiva(getSimFormData(createForm));

        if (result.success) {
          showSimFormMessage(createForm, "info", result.message);
          window.setTimeout(() => setSimPage(1, filters), 500);
          return;
        }

        showSimFormMessage(createForm, "error", result.message);
      } catch (error) {
        showSimFormMessage(
          createForm,
          "error",
          getUserFriendlySimError(error, "Errore nella creazione della SIM. Controlla codice, contratto e date.")
        );
      } finally {
        button.disabled = false;
      }
    });
  }

  function bindFilterForm() {
    const filterForm = container.querySelector(".sim-filter-form");

    if (!filterForm) {
      return;
    }

    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      setSimPage(1, getSimFiltersFromForm(filterForm));
    });

    filterForm.addEventListener("reset", () => {
      window.setTimeout(() => setSimPage(1), 0);
    });
  }

  function bindPagination() {
    container.querySelectorAll(".sim-page-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const page = Number(button.dataset.page);

        if (Number.isFinite(page) && page > 0) {
          setSimPage(page, filters);
        }
      });
    });
  }

  function bindRowActions() {
    container.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        openModal(renderEditModal(JSON.parse(button.dataset.edit), { contractOptions }));
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

    bindEditForm(modal, closeModal, load);
    bindDeleteConfirm(modal, closeModal, load);
  }

  function bindEditForm(modal, closeModal, reload) {
    const editForm = modal.querySelector(".sim-form[data-mode='edit']");

    if (!editForm) {
      return;
    }

    bindSimFormAssistance(editForm, { contractOptions });

    editForm.addEventListener("reset", (event) => {
      event.preventDefault();
      closeModal();
    });

    editForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!validateSimFormBeforeSubmit(editForm)) {
        return;
      }

      const button = editForm.querySelector("[type='submit']");
      button.disabled = true;

      try {
        const result = await updateSimDisattiva(getSimFormData(editForm));

        if (result.success) {
          showSimFormMessage(editForm, "info", result.message);
          window.setTimeout(async () => {
            closeModal();
            await reload();
          }, 600);
          return;
        }

        showSimFormMessage(editForm, "error", result.message);
      } catch (error) {
        showSimFormMessage(
          editForm,
          "error",
          getUserFriendlySimError(error, "Errore nella modifica della SIM. Controlla codice, contratto e date.")
        );
      } finally {
        button.disabled = false;
      }
    });
  }

  function bindDeleteConfirm(modal, closeModal, reload) {
    modal.querySelector("[data-confirm-delete]")?.addEventListener("click", async (event) => {
      try {
        const result = await deleteSimDisattiva(event.currentTarget.dataset.confirmDelete);
        alert(result.message);

        if (result.success) {
          closeModal();
          await reload();
        }
      } catch (error) {
        alert("Errore nell'eliminazione della SIM.");
      }
    });
  }

  try {
    await load();
  } catch (error) {
    container.innerHTML = renderSimListError();
  }
}
