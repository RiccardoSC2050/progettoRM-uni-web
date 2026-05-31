import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-architecture-v1";
import { createSimDisattiva, getSimDisattive } from "../../api/simDisattiveApi.js?v=rmk-architecture-v1";
import { getContracts } from "../../api/contractsApi.js?v=rmk-architecture-v1";
import { formatNumber } from "./simFormatters.js?v=rmk-architecture-v1";
import { getSimFormData, renderSimForm } from "./simForm.js?v=rmk-architecture-v1";
import { renderSimSummary } from "./simSummary.js?v=rmk-architecture-v1";
import {
  bindSimFormAssistance,
  getUserFriendlySimError,
  showSimFormMessage,
  validateSimFormBeforeSubmit
} from "./simValidation.js?v=rmk-architecture-v1";

async function getContractOptions() {
  try {
    const result = await getContracts({ limit: 5, offset: 0, sort: "dataAttivazione", direction: "desc" });

    if (!result.success) {
      return [];
    }

    return result.data.contratti.map((contract) => contract.numero).filter(Boolean);
  } catch (_) {
    return [];
  }
}

export async function renderSimPreview(container) {
  container.innerHTML = `
    <h2>Gestione SIM</h2>
    <p>Caricamento dati SIM...</p>
  `;

  async function load() {
    const [result, contractOptions] = await Promise.all([
      getSimDisattive({ limit: 1, offset: 0 }),
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
            <p>Riepilogo operativo delle SIM disattive e creazione rapida.</p>
          </div>

          <strong>${formatNumber(summary.totale)} SIM disattive</strong>
        </header>

        ${renderSimSummary(summary)}
        ${renderSimForm(null, "create", { contractOptions })}

        <div class="sim-preview-actions page-preview-actions">
          <a class="sim-detail-link page-preview-link" href="#/sim-dettaglio">Approfondisci gestione SIM</a>
        </div>
      </section>
    `;

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
        const result = await createSimDisattiva(getSimFormData(form));

        if (result.success) {
          showSimFormMessage(form, "info", result.message);
          window.setTimeout(load, 500);
          return;
        }

        showSimFormMessage(form, "error", result.message);
      } catch (error) {
        showSimFormMessage(
          form,
          "error",
          getUserFriendlySimError(error, "Errore nella creazione della SIM. Controlla codice, contratto e date.")
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
