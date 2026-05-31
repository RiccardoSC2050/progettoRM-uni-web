import { renderSimForm } from "./simForm.js?v=rmk-contracts-mobile-fix-v1";
import { escapeHtml } from "./simFormatters.js?v=rmk-contracts-mobile-fix-v1";

export function renderEditModal(sim) {
  return `
    <div class="sim-modal-backdrop" role="dialog" aria-modal="true">
      <div class="sim-modal">
        <button class="sim-modal-close" type="button" aria-label="Chiudi">×</button>
        ${renderSimForm(sim, "edit")}
      </div>
    </div>
  `;
}

export function renderDeleteModal(codice) {
  return `
    <div class="sim-modal-backdrop" role="dialog" aria-modal="true">
      <div class="sim-modal sim-modal-confirm">
        <h3>Eliminare la SIM?</h3>
        <p>Stai per eliminare la SIM <strong>${escapeHtml(codice)}</strong>. L’operazione aggiorna il database.</p>

        <div class="sim-form-actions">
          <button class="sim-btn sim-btn-danger" type="button" data-confirm-delete="${escapeHtml(codice)}">Elimina</button>
          <button class="sim-btn sim-btn-secondary" type="button" data-cancel-modal>Annulla</button>
        </div>
      </div>
    </div>
  `;
}
