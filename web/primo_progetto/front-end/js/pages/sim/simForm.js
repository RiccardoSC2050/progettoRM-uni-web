import { escapeHtml } from "./simFormatters.js?v=rmk-sim-db-v1";
import { renderContractOptions, renderTypeOptions } from "./simFormOptions.js?v=rmk-sim-db-v1";
import { renderStatusField } from "./simFormStatus.js?v=rmk-sim-db-v1";
import { getContractValue, getFormText, getSubmitLabel, isReadOnlyContract } from "./simFormText.js?v=rmk-sim-db-v1";

export function renderSimForm(sim = null, mode = "create", options = {}) {
  const isEdit = mode === "edit";
  const intent = options.intent || "";
  const text = getFormText(mode, intent, sim);
  const contractDisabled = isReadOnlyContract(intent, sim) ? "disabled" : "";
  const typeDisabled = intent === "deactivate" ? "disabled" : "";
  const codeReadonly = intent === "deactivate" ? "readonly" : "";

  return `
    <section class="sim-form-card">
      <div class="sim-section-heading">
        <h3>${text.title}</h3>
        <p>${text.description}</p>
      </div>

      <form class="sim-form" data-mode="${mode}" data-intent="${escapeHtml(intent)}">
        <input type="hidden" name="codiceOriginale" value="${escapeHtml(sim?.codice || "")}" />
        <input type="hidden" name="statoOriginale" value="${escapeHtml(sim?.stato || "")}" />
        <div class="sim-form-fields">
          <div class="sim-field">
            <label for="${mode}-codice">Codice SIM</label>
            <input id="${mode}-codice" name="codice" type="text" placeholder="SIM260001" minlength="3" maxlength="30" value="${escapeHtml(sim?.codice || "")}" ${codeReadonly} required />
            <small class="sim-field-help">Lettere, numeri, trattino o underscore. Esempio: SIM260001.</small>
          </div>

          <div class="sim-field">
            <label for="${mode}-tipo">Tipo SIM</label>
            <select id="${mode}-tipo" name="tipoSIM" ${typeDisabled} required>
              ${renderTypeOptions(sim?.tipoSIM || "standard")}
            </select>
            <small class="sim-field-help">Scegli il formato fisico o digitale della SIM.</small>
          </div>

          ${renderStatusField(sim, mode, intent)}

          <div class="sim-field" data-sim-contract-field>
            <label for="${mode}-contratto">Contratto</label>
            <select id="${mode}-contratto" name="contratto" data-sim-contract-input ${contractDisabled}>
              ${renderContractOptions(options.contractOptions || [], getContractValue(sim))}
            </select>
            <small class="sim-field-help">Mostra solo contratti disponibili senza SIM attiva.</small>
          </div>

        </div>

        <div class="sim-form-assistance">
          <p><strong>Flusso consigliato:</strong> crea la SIM senza contratto. Per usarla premi Attiva e scegli un contratto libero. Le date non si inseriscono: attivazione e disattivazione vengono registrate automaticamente dal backend nel giorno dell’evento.</p>
          <div class="sim-form-examples" data-sim-examples></div>
          <div class="sim-form-message" data-sim-form-message data-visible="false"></div>
        </div>

        <div class="sim-form-actions">
          <button class="sim-btn sim-btn-primary" type="submit">
            ${getSubmitLabel(mode, intent)}
          </button>

          <button class="sim-btn sim-btn-secondary" type="reset">
            ${isEdit ? "Annulla" : "Pulisci"}
          </button>
        </div>
      </form>
    </section>
  `;
}

export function getSimFormData(form) {
  const elementValue = (name) => form.elements[name]?.value?.trim() || "";

  return {
    codiceOriginale: elementValue("codiceOriginale"),
    statoOriginale: elementValue("statoOriginale"),
    codice: elementValue("codice"),
    tipoSIM: elementValue("tipoSIM"),
    contratto: elementValue("contratto"),
    dataAttivazione: "",
    dataDisattivazione: "",
    statoFinale: elementValue("statoFinale") || "non_attiva"
  };
}
