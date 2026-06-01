import { escapeHtml } from "./simFormatters.js?v=rmk-sim-db-v1";

const TYPES = ["standard", "microSIM", "nanoSIM", "eSIM"];

function renderTypeOptions(selected = "standard") {
  return TYPES.map((type) => `
    <option value="${type}" ${type === selected ? "selected" : ""}>${type}</option>
  `).join("");
}

function renderContractSuggestions(id, contractOptions = []) {
  const options = contractOptions
    .filter(Boolean)
    .map((numero) => `<option value="${escapeHtml(numero)}"></option>`)
    .join("");

  return `<datalist id="${id}">${options}</datalist>`;
}

function getFinalStatus(sim, mode, intent) {
  if (mode === "create") {
    return "non_attiva";
  }

  if (intent === "activate") {
    return "attiva";
  }

  if (intent === "deactivate") {
    return "disattiva";
  }

  return sim?.stato || "non_attiva";
}

function getStatusLabel(status) {
  return {
    attiva: "Attiva",
    disattiva: "Disattivata",
    non_attiva: "Non attiva"
  }[status] || "Non attiva";
}

function getStatusHelp(mode, intent, status) {
  if (mode === "create") {
    return "La SIM nasce senza contratto e senza date.";
  }

  if (intent === "activate") {
    return "La SIM verrà collegata a un contratto libero.";
  }

  if (intent === "deactivate") {
    return "La SIM verrà archiviata nello storico disattivate.";
  }

  return `Stato attuale: ${status.replace("_", " ")}.`;
}

function renderStatusField(sim, mode, intent) {
  const status = getFinalStatus(sim, mode, intent);

  return `
    <input type="hidden" name="statoFinale" value="${escapeHtml(status)}" />
    <div class="sim-field sim-state-info">
      <span>${mode === "create" ? "Stato iniziale" : "Risultato"}</span>
      <strong>${getStatusLabel(status)}</strong>
      <small class="sim-field-help">${getStatusHelp(mode, intent, status)}</small>
    </div>
  `;
}

function getContractValue(sim) {
  return sim?.contratto || sim?.eraAssociataA || "";
}

function getFormText(mode, intent, sim) {
  if (mode !== "edit") {
    return {
      title: "Nuova SIM",
      description: "Inserisci codice e tipo. Dopo la creazione potrai decidere se collegarla a un contratto."
    };
  }

  if (intent === "activate") {
    return {
      title: "Attiva SIM",
      description: "Scegli solo il contratto libero. La data di attivazione viene impostata automaticamente a oggi dal backend."
    };
  }

  if (intent === "deactivate") {
    return {
      title: "Disattiva SIM",
      description: "La SIM viene spostata subito nello storico delle SIM disattivate. La data effettiva di disattivazione viene impostata a oggi dal backend."
    };
  }

  return {
    title: "Modifica SIM",
    description: sim?.stato === "attiva"
      ? "Puoi modificare codice e tipo. Per cambiare contratto devi prima disattivare la SIM e poi riattivarla."
      : "Aggiorna codice e tipo della SIM. Per usarla, premi Attiva dall’elenco."
  };
}

function isReadOnlyContract(intent, sim) {
  return intent === "deactivate" || sim?.stato === "attiva";
}

function getSubmitLabel(mode, intent) {
  if (mode === "create") {
    return "Crea SIM";
  }

  if (intent === "activate") {
    return "Attiva SIM";
  }

  if (intent === "deactivate") {
    return "Disattiva SIM";
  }

  return "Salva";
}

export function renderSimForm(sim = null, mode = "create", options = {}) {
  const isEdit = mode === "edit";
  const intent = options.intent || "";
  const text = getFormText(mode, intent, sim);
  const contractListId = `${mode}-contratti-suggeriti`;
  const contractReadonly = isReadOnlyContract(intent, sim) ? "readonly" : "";
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
            <input id="${mode}-contratto" name="contratto" type="text" inputmode="tel" autocomplete="off" list="${contractListId}" placeholder="+39320000000" value="${escapeHtml(getContractValue(sim))}" data-sim-contract-input ${contractReadonly} />
            ${renderContractSuggestions(contractListId, options.contractOptions || [])}
            <small class="sim-field-help">Suggerisce solo contratti senza SIM attiva.</small>
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
