import { escapeHtml } from "./simFormatters.js?v=rmk-sim-db-v5";
import { renderContractOptions, renderTypeOptions } from "./simFormOptions.js?v=rmk-sim-db-v5";
import { renderStatusField } from "./simFormStatus.js?v=rmk-sim-db-v5";
import { getContractValue, getFormText, getSubmitLabel, isReadOnlyContract } from "./simFormText.js?v=rmk-sim-db-v5";

export function renderSimForm(sim = null, mode = "create", options = {}) {
  const isEdit = mode === "edit";
  const intent = options.intent || "";
  const text = getFormText(mode, intent, sim);
  const contractLocked = isReadOnlyContract(intent, sim);
  const contractDisabled = contractLocked ? "disabled" : "";
  const contractLockedAttrs = contractLocked ? 'data-sim-locked="true" tabindex="-1" aria-disabled="true"' : "";
  const contractFieldClass = contractLocked ? " sim-field-readonly" : "";
  const contractHelp = contractLocked
    ? "Contratto bloccato: per cambiarlo devi prima disattivare la SIM e poi riattivarla su un altro numero."
    : "Scrivi per filtrare. La lista mostra solo contratti disponibili senza SIM attiva.";
  const typeLocked = intent === "deactivate";
  const typeDisabled = typeLocked ? "disabled" : "";
  const typeLockedAttrs = typeLocked ? 'data-sim-locked="true" tabindex="-1" aria-disabled="true"' : "";
  const codeLocked = intent === "deactivate";
  const codeReadonly = codeLocked ? "readonly" : "";
  const codeLockedAttrs = codeLocked ? 'data-sim-locked="true" tabindex="-1" aria-disabled="true"' : "";
  const codeFieldClass = codeLocked ? " sim-field-readonly" : "";
  const typeFieldClass = typeLocked ? " sim-field-readonly" : "";

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
          <div class="sim-field${codeFieldClass}">
            <label for="${mode}-codice">Codice SIM</label>
            <input id="${mode}-codice" name="codice" type="text" placeholder="SIM260001" minlength="3" maxlength="30" value="${escapeHtml(sim?.codice || "")}" ${codeReadonly} ${codeLockedAttrs} required />
            <small class="sim-field-help">Lettere, numeri, trattino o underscore. Esempio: SIM260001.</small>
          </div>

          <div class="sim-field${typeFieldClass}">
            <label for="${mode}-tipo">Tipo SIM</label>
            <select id="${mode}-tipo" name="tipoSIM" ${typeDisabled} ${typeLockedAttrs} required>
              ${renderTypeOptions(sim?.tipoSIM || "standard")}
            </select>
            <small class="sim-field-help">Scegli il formato fisico o digitale della SIM.</small>
          </div>

          ${renderStatusField(sim, mode, intent)}

          <div class="sim-field${contractFieldClass}" data-sim-contract-field data-sim-contract-locked="${contractLocked ? "true" : "false"}">
            <label for="${mode}-contratto-search">Contratto</label>
            <input id="${mode}-contratto-search" type="search" data-sim-contract-search placeholder="Scrivi per filtrare i numeri disponibili" ${contractDisabled} ${contractLockedAttrs} />
            <select id="${mode}-contratto" name="contratto" data-sim-contract-input ${contractDisabled} ${contractLockedAttrs}>
              ${renderContractOptions(options.contractOptions || [], getContractValue(sim))}
            </select>
            <small class="sim-field-help">${contractHelp}</small>
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
