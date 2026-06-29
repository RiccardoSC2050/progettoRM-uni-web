import { deleteSim, updateSim } from "../../api/simApi.js?v=rmk-sim-db-v1";
import { getSimFormData } from "./simForm.js?v=rmk-sim-db-v1";
import { showSimModalCompletion } from "./simModalCompletion.js?v=rmk-sim-db-v1";
import {
  bindSimFormAssistance,
  getUserFriendlySimError,
  showSimFormMessage,
  validateSimFormBeforeSubmit
} from "./simValidation.js?v=rmk-sim-db-v1";

function bindEditForm(modal, closeModal, reload, contractOptions) {
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

export function openSimModal(markup, { contractOptions, reload }) {
  const currentModal = document.querySelector(".sim-modal-backdrop");

  if (currentModal) {
    currentModal.remove();
  }

  document.body.insertAdjacentHTML("beforeend", markup);

  const modal = document.querySelector(".sim-modal-backdrop");

  if (!modal) {
    return;
  }

  const closeModal = () => {
    const shouldReload = modal.dataset.reloadOnClose === "true";
    modal.remove();

    if (shouldReload) {
      reload();
    }
  };

  modal.querySelector(".sim-modal-close")?.addEventListener("click", closeModal);
  modal.querySelector("[data-cancel-modal]")?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  bindEditForm(modal, closeModal, reload, contractOptions);
  bindDeleteConfirm(modal, closeModal, reload);
}
