import { createSimDisattiva, getSimDisattive } from "../../api/simDisattiveApi.js?v=rmk-contracts-mobile-fix-v1";
import { formatNumber } from "./simFormatters.js?v=rmk-contracts-mobile-fix-v1";
import { getSimFormData, renderSimForm } from "./simForm.js?v=rmk-contracts-mobile-fix-v1";
import { renderSimSummary } from "./simSummary.js?v=rmk-contracts-mobile-fix-v1";

export async function renderSimPreview(container) {
  container.innerHTML = `
    <h2>Gestione SIM</h2>
    <p>Caricamento dati SIM...</p>
  `;

  async function load() {
    const result = await getSimDisattive({ limit: 1, offset: 0 });

    if (!result.success) {
      container.innerHTML = `
        <h2>Gestione SIM</h2>
        <p>Errore: ${result.message}</p>
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
        ${renderSimForm(null, "create")}

        <div class="sim-preview-actions page-preview-actions">
          <a class="sim-detail-link page-preview-link" href="#/sim-dettaglio">Approfondisci gestione SIM</a>
        </div>
      </section>
    `;

    bindCreateForm();
  }

  function bindCreateForm() {
    const form = container.querySelector(".sim-form");

    if (!form) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector("[type='submit']");
      button.disabled = true;

      try {
        const result = await createSimDisattiva(getSimFormData(form));
        alert(result.message);

        if (result.success) {
          await load();
        }
      } catch (error) {
        alert("Errore nella creazione della SIM.");
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
