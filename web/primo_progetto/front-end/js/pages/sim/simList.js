import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v1";
import { createSim, deleteSim, getSim, updateSim } from "../../api/simApi.js?v=rmk-sim-db-v1";
import { getSimFiltersFromForm } from "./simFilter.js?v=rmk-sim-db-v1";
import { getSimFormData } from "./simForm.js?v=rmk-sim-db-v1";
import { bindSimGuide } from "./simGuide.js?v=rmk-sim-db-v1";
import { renderDeleteModal, renderEditModal } from "./simModal.js?v=rmk-sim-db-v1";
import { showSimModalCompletion } from "./simModalCompletion.js?v=rmk-sim-db-v1";
import { getContractOptions } from "./simOptions.js?v=rmk-sim-db-v1";
import { showSimPostCreateActions } from "./simPostCreate.js?v=rmk-sim-db-v1";
import { getSimPageSize, getSimRouteState, setSimPage } from "./simListState.js?v=rmk-sim-db-v1";
import { renderSimListError, renderSimListLoading, renderSimListPage } from "./simListView.js?v=rmk-sim-db-v1";
import {
  bindSimFormAssistance,
  getUserFriendlySimError,
  showSimFormMessage,
  validateSimFormBeforeSubmit
} from "./simValidation.js?v=rmk-sim-db-v1";

export async function renderSimList(container, params = new URLSearchParams()) {
  const { currentPage, filters } = getSimRouteState(params);
  const pageSize = getSimPageSize();
  const offset = (currentPage - 1) * pageSize;
  let contractOptions = [];

  container.innerHTML = renderSimListLoading();

  async function load() {
    const [result, loadedContracts] = await Promise.all([
      getSim({
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
    bindSimGuide(container);
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
        const result = await createSim(getSimFormData(createForm));

        if (result.success) {
          showSimPostCreateActions(
            createForm,
            getSimFormData(createForm),
            () => setSimPage(1, filters),
            (createdSim) => openModal(renderEditModal(createdSim, {
              contractOptions,
              intent: "activate"
            }))
          );
          return;
        }

        showSimFormMessage(createForm, "error", result.message);
      } catch (error) {
        showSimFormMessage(
          createForm,
          "error",
          getUserFriendlySimError(error, "Errore nella creazione della SIM. Controlla codice, stato e dati richiesti.")
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
        openModal(renderEditModal(JSON.parse(button.dataset.edit), {
          contractOptions,
          intent: button.dataset.simIntent || ""
        }));
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
    const modal = document.querySelector(".sim-modal-backdrop");
    const shouldReload = modal?.dataset.reloadOnClose === "true";

    modal?.remove();

    if (shouldReload) {
      load();
    }
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
        const result = await updateSim(getSimFormData(editForm));

        if (result.success) {
          if (editForm.dataset.intent === "activate") {
            showSimModalCompletion(editForm, result.message);
            return;
          }

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
          getUserFriendlySimError(error, "Errore nella modifica della SIM. Controlla stato e contratto.")
        );
      } finally {
        button.disabled = false;
      }
    });
  }

  function bindDeleteConfirm(modal, closeModal, reload) {
    modal.querySelector("[data-confirm-delete]")?.addEventListener("click", async (event) => {
      try {
        const result = await deleteSim(event.currentTarget.dataset.confirmDelete);
        alert(result.message);

        if (result.success) {
          closeModal();
          await reload();
        }
      } catch (error) {
        alert(error?.message || "Errore nell'eliminazione della SIM.");
      }
    });
  }

  try {
    await load();
  } catch (error) {
    container.innerHTML = renderSimListError();
  }
}
