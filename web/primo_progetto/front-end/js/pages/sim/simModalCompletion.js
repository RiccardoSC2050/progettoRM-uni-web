import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v1";

export function showSimModalCompletion(form, message) {
  const modal = form.closest(".sim-modal-backdrop");
  const actions = form.querySelector(".sim-form-actions");

  if (modal) {
    modal.dataset.reloadOnClose = "true";
  }

  form.querySelectorAll("input, select, button").forEach((element) => {
    element.disabled = true;
  });

  const box = form.querySelector("[data-sim-form-message]");

  if (box) {
    box.dataset.visible = "true";
    box.className = "sim-form-message sim-form-message-info";
    box.innerHTML = `
      <strong>${escapeHtml(message)}</strong>
      <p>La configurazione è stata salvata. Puoi tornare alla gestione SIM quando hai concluso.</p>
    `;
  }

  if (actions) {
    actions.innerHTML = `
      <button class="sim-btn sim-btn-primary" type="button" data-close-completed-sim>Concludi e torna alla lista</button>
    `;

    actions.querySelector("[data-close-completed-sim]")?.addEventListener("click", () => {
      form.closest(".sim-modal-backdrop")?.querySelector(".sim-modal-close")?.click();
    });
  }
}
