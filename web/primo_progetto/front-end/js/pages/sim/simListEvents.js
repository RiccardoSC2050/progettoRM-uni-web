import { createSim } from "../../api/simApi.js?v=rmk-sim-db-v1";
import { getSimFiltersFromForm } from "./simFilter.js?v=rmk-sim-db-v1";
import { getSimFormData } from "./simForm.js?v=rmk-sim-db-v1";
import { bindSimGuide } from "./simGuide.js?v=rmk-sim-db-v1";
import { renderDeleteModal, renderEditModal } from "./simModal.js?v=rmk-sim-db-v1";
import { openSimModal } from "./simModalController.js?v=rmk-sim-db-v1";
import { showSimPostCreateActions } from "./simPostCreate.js?v=rmk-sim-db-v1";
import { setSimPage } from "./simListState.js?v=rmk-sim-db-v1";
import {
  bindSimFormAssistance,
  getUserFriendlySimError,
  showSimFormMessage,
  validateSimFormBeforeSubmit
} from "./simValidation.js?v=rmk-sim-db-v1";

function bindCreateForm(container, filters, contractOptions) {
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
      const formData = getSimFormData(createForm);
      const result = await createSim(formData);

      if (result.success) {
        showSimPostCreateActions(
          createForm,
          formData,
          () => setSimPage(1, filters),
          (createdSim) => openSimModal(renderEditModal(createdSim, {
            contractOptions,
            intent: "activate"
          }), {
            contractOptions,
            reload: () => setSimPage(1, filters)
          })
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

function bindFilterForm(container) {
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

function bindPagination(container, filters) {
  container.querySelectorAll(".sim-page-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const page = Number(button.dataset.page);

      if (Number.isFinite(page) && page > 0) {
        setSimPage(page, filters);
      }
    });
  });
}

function bindRowActions(container, contractOptions, reload) {
  container.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      openSimModal(renderEditModal(JSON.parse(button.dataset.edit), {
        contractOptions,
        intent: button.dataset.simIntent || ""
      }), {
        contractOptions,
        reload
      });
    });
  });

  container.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      openSimModal(renderDeleteModal(button.dataset.delete), {
        contractOptions,
        reload
      });
    });
  });
}

export function bindSimListEvents(container, { filters, contractOptions, reload }) {
  bindSimGuide(container);
  bindCreateForm(container, filters, contractOptions);
  bindFilterForm(container);
  bindPagination(container, filters);
  bindRowActions(container, contractOptions, reload);
}
