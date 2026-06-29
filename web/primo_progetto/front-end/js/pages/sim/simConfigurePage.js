import { updateSim } from "../../api/simApi.js?v=rmk-sim-db-v1";
import { renderSimForm, getSimFormData } from "./simForm.js?v=rmk-sim-db-v1";
import { getContractOptions } from "./simOptions.js?v=rmk-sim-db-v1";
import {
  bindSimFormAssistance,
  getUserFriendlySimError,
  showSimFormMessage,
  validateSimFormBeforeSubmit
} from "./simValidation.js?v=rmk-sim-db-v1";

function getCreatedSimFromParams(params) {
  return {
    codice: params.get("codice") || "",
    tipoSIM: params.get("tipoSIM") || "standard",
    stato: "non_attiva",
    contratto: "",
    dataAttivazione: "",
    dataDisattivazione: ""
  };
}

function renderConfigurePage(sim, contractOptions) {
  return `
    <section class="sim-page sim-configure-page">
      <header class="sim-page-header">
        <div>
          <h2>Configura SIM</h2>
          <p>Pagina dedicata solo alla configurazione della SIM appena creata.</p>
        </div>

        <div class="sim-page-header-actions">
          <a class="sim-btn sim-btn-secondary" href="#/sim-dettaglio?q=${encodeURIComponent(sim.codice)}">Torna alle SIM</a>
        </div>
      </header>

      ${renderSimForm(sim, "edit", {
        contractOptions,
        intent: "activate"
      })}
    </section>
  `;
}

function bindConfigureForm(container, contractOptions, codice) {
  const form = container.querySelector(".sim-form[data-mode='edit']");

  if (!form) {
    return;
  }

  bindSimFormAssistance(form, { contractOptions });

  form.addEventListener("reset", (event) => {
    event.preventDefault();
    window.location.hash = `#/sim-dettaglio?q=${encodeURIComponent(codice)}`;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateSimFormBeforeSubmit(form)) {
      return;
    }

    const button = form.querySelector("[type='submit']");
    button.disabled = true;

    try {
      const result = await updateSim(getSimFormData(form));

      if (result.success) {
        showSimFormMessage(form, "info", result.message);
        window.setTimeout(() => {
          window.location.hash = `#/sim-dettaglio?q=${encodeURIComponent(codice)}`;
        }, 700);
        return;
      }

      showSimFormMessage(form, "error", result.message);
    } catch (error) {
      showSimFormMessage(
        form,
        "error",
        getUserFriendlySimError(error, "Errore nella configurazione della SIM. Controlla stato e contratto.")
      );
    } finally {
      button.disabled = false;
    }
  });
}

export async function renderSimConfigurePage(container, params = new URLSearchParams()) {
  const sim = getCreatedSimFromParams(params);

  if (!sim.codice) {
    window.location.hash = "#/sim-dettaglio";
    return;
  }

  try {
    const contractOptions = await getContractOptions();
    container.innerHTML = renderConfigurePage(sim, contractOptions);
    bindConfigureForm(container, contractOptions, sim.codice);
  } catch (error) {
    container.innerHTML = `
      <section class="sim-page sim-configure-page">
        <h2>Configura SIM</h2>
        <p>Errore nel caricamento della configurazione SIM.</p>
      </section>
    `;
  }
}
