import { escapeHtml } from "./simFormatters.js?v=rmk-architecture-v1";

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

function renderStatusField(mode) {
  if (mode !== "edit") {
    return `<input type="hidden" name="statoFinale" value="disattiva" />`;
  }

  return `
    <div class="sim-field sim-status-field">
      <label for="${mode}-stato">Stato finale</label>
      <select id="${mode}-stato" name="statoFinale" required>
        <option value="disattiva" selected>Disattivata</option>
        <option value="attiva">Attiva / riattiva</option>
      </select>
      <small class="sim-field-help">Se scegli Attiva, la SIM viene spostata in SIMAttiva.</small>
    </div>
  `;
}

export function renderSimForm(sim = null, mode = "create", options = {}) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Modifica SIM" : "Nuova SIM disattiva";
  const description = isEdit
    ? "Aggiorna la SIM selezionata oppure riattivala spostandola tra le SIM attive."
    : "Registra una nuova SIM disattivata mantenendo il collegamento a un contratto esistente.";
  const contractListId = `${mode}-contratti-suggeriti`;

  return `
    <section class="sim-form-card">
      <div class="sim-section-heading">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>

      <form class="sim-form" data-mode="${mode}">
        <input type="hidden" name="codiceOriginale" value="${escapeHtml(sim?.codice || "")}" />

        <div class="sim-form-fields">
          <div class="sim-field">
            <label for="${mode}-codice">Codice SIM</label>
            <input id="${mode}-codice" name="codice" type="text" placeholder="SIM260001" minlength="3" maxlength="30" value="${escapeHtml(sim?.codice || "")}" required />
            <small class="sim-field-help">Lettere, numeri, trattino o underscore. Esempio: SIM260001.</small>
          </div>

          <div class="sim-field">
            <label for="${mode}-tipo">Tipo SIM</label>
            <select id="${mode}-tipo" name="tipoSIM" required>
              ${renderTypeOptions(sim?.tipoSIM || "standard")}
            </select>
            <small class="sim-field-help">Scegli il formato fisico o digitale della SIM.</small>
          </div>

          <div class="sim-field">
            <label for="${mode}-contratto">Contratto</label>
            <input id="${mode}-contratto" name="eraAssociataA" type="text" inputmode="tel" autocomplete="off" list="${contractListId}" placeholder="+39320000000" value="${escapeHtml(sim?.eraAssociataA || "")}" required />
            ${renderContractSuggestions(contractListId, options.contractOptions || [])}
            <small class="sim-field-help">Deve esistere in ContrattoTelefonico. Puoi usare un numero suggerito.</small>
          </div>

          <div class="sim-field">
            <label for="${mode}-attivazione">Data attivazione</label>
            <input id="${mode}-attivazione" name="dataAttivazione" type="date" value="${escapeHtml(sim?.dataAttivazione || "")}" required />
            <small class="sim-field-help">Data in cui la SIM era stata attivata.</small>
          </div>

          <div class="sim-field">
            <label for="${mode}-disattivazione">Data disattivazione</label>
            <input id="${mode}-disattivazione" name="dataDisattivazione" type="date" value="${escapeHtml(sim?.dataDisattivazione || "")}" required />
            <small class="sim-field-help">Deve essere uguale o successiva alla data di attivazione.</small>
          </div>

          ${renderStatusField(mode)}
        </div>

        <div class="sim-form-assistance">
          <p><strong>Controllo dati:</strong> il codice deve essere nuovo, il contratto deve esistere e le date devono essere coerenti.</p>
          <div class="sim-form-examples" data-sim-examples></div>
          <div class="sim-form-message" data-sim-form-message data-visible="false"></div>
        </div>

        <div class="sim-form-actions">
          <button class="sim-btn sim-btn-primary" type="submit">
            ${isEdit ? "Salva modifica" : "Crea SIM"}
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
    codice: elementValue("codice"),
    tipoSIM: elementValue("tipoSIM"),
    eraAssociataA: elementValue("eraAssociataA"),
    dataAttivazione: elementValue("dataAttivazione"),
    dataDisattivazione: elementValue("dataDisattivazione"),
    statoFinale: elementValue("statoFinale") || "disattiva"
  };
}
