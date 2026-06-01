import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v1";
import { createSim, getSim } from "../../api/simApi.js?v=rmk-sim-db-v1";
import { formatNumber } from "./simFormatters.js?v=rmk-sim-db-v1";
import { getSimFormData, renderSimForm } from "./simForm.js?v=rmk-sim-db-v1";
import { bindSimGuide, renderSimGuideTrigger } from "./simGuide.js?v=rmk-sim-db-v1";
import { renderSimSummary } from "./simSummary.js?v=rmk-sim-db-v1";
import { showSimPostCreateActions } from "./simPostCreate.js?v=rmk-sim-db-v1";
import { getContractOptions } from "./simOptions.js?v=rmk-sim-db-v1";
import {
  bindSimFormAssistance,
  getUserFriendlySimError,
  showSimFormMessage,
  validateSimFormBeforeSubmit
} from "./simValidation.js?v=rmk-sim-db-v1";

export async function renderSimPreview(container) {
  container.innerHTML = `
    <h2>Gestione SIM</h2>
    <p>Caricamento dati SIM...</p>
  `;

  async function load() {
    const [result, contractOptions] = await Promise.all([
      getSim({ limit: 1, offset: 0 }),
      getContractOptions()
    ]);

    if (!result.success) {
      container.innerHTML = `
        <h2>Gestione SIM</h2>
        <p>Errore: ${escapeHtml(result.message)}</p>
      `;
      return;
    }

    const { summary } = result.data;

    container.innerHTML = `
      <section class="sim-page sim-preview-page">
        <header class="sim-page-header">
          <div>
            <h2>Gestione SIM</h2>
            <p>Riepilogo operativo di tutte le SIM e creazione rapida.</p>
          </div>

          <div class="sim-page-header-actions">
            ${renderSimGuideTrigger()}
            <strong>${formatNumber(summary.totale)} SIM totali</strong>
          </div>
        </header>

        ${renderSimSummary(summary)}
        ${renderSimForm(null, "create", { contractOptions })}

        <div class="sim-preview-actions page-preview-actions">
          <a class="sim-detail-link page-preview-link" href="#/sim-dettaglio">Approfondisci gestione SIM</a>
        </div>
      </section>
    `;

    bindSimGuide(container);
    bindCreateForm(contractOptions);
  }

  function bindCreateForm(contractOptions) {
    const form = container.querySelector(".sim-form");

    if (!form) {
      return;
    }

    bindSimFormAssistance(form, { contractOptions });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!validateSimFormBeforeSubmit(form)) {
        return;
      }

      const button = form.querySelector("[type='submit']");
      button.disabled = true;

      try {
        const result = await createSim(getSimFormData(form));

        if (result.success) {
          showSimPostCreateActions(form, getSimFormData(form), load);
          return;
        }

        showSimFormMessage(form, "error", result.message);
      } catch (error) {
        showSimFormMessage(
          form,
          "error",
          getUserFriendlySimError(error, "Errore nella creazione della SIM. Controlla codice, stato e dati richiesti.")
        );
      } finally {
        button.disabled = false;
      }
    });
  }

  try {
    await load();
  } catch (error) {
    container.innerHTML = `
      <h2>Gestione SIM</h2>
      <p>Errore nel caricamento della gestione SIM.</p>
    `;
  }
}
