import { escapeHtml } from "./simFormatters.js?v=rmk-contracts-mobile-fix-v1";

const TYPES = ["standard", "microSIM", "nanoSIM", "eSIM"];

function renderTypeOptions(selected = "standard") {
  return TYPES.map((type) => `
    <option value="${type}" ${type === selected ? "selected" : ""}>${type}</option>
  `).join("");
}

export function renderSimForm(sim = null, mode = "create") {
  const isEdit = mode === "edit";
  const title = isEdit ? "Modifica SIM disattiva" : "Nuova SIM disattiva";
  const description = isEdit
    ? "Aggiorna i dati della SIM selezionata o annulla la modifica."
    : "Registra una nuova SIM disattivata mantenendo il collegamento al contratto precedente.";

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
            <input id="${mode}-codice" name="codice" type="text" placeholder="SIM00000000" value="${escapeHtml(sim?.codice || "")}" required />
          </div>

          <div class="sim-field">
            <label for="${mode}-tipo">Tipo SIM</label>
            <select id="${mode}-tipo" name="tipoSIM" required>
              ${renderTypeOptions(sim?.tipoSIM || "standard")}
            </select>
          </div>

          <div class="sim-field">
            <label for="${mode}-contratto">Contratto precedente</label>
            <input id="${mode}-contratto" name="eraAssociataA" type="text" placeholder="+39320000000" value="${escapeHtml(sim?.eraAssociataA || "")}" required />
          </div>

          <div class="sim-field">
            <label for="${mode}-attivazione">Data attivazione</label>
            <input id="${mode}-attivazione" name="dataAttivazione" type="date" value="${escapeHtml(sim?.dataAttivazione || "")}" required />
          </div>

          <div class="sim-field">
            <label for="${mode}-disattivazione">Data disattivazione</label>
            <input id="${mode}-disattivazione" name="dataDisattivazione" type="date" value="${escapeHtml(sim?.dataDisattivazione || "")}" required />
          </div>
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
  const formData = new FormData(form);

  return {
    codiceOriginale: formData.get("codiceOriginale") || "",
    codice: formData.get("codice")?.trim() || "",
    tipoSIM: formData.get("tipoSIM") || "",
    eraAssociataA: formData.get("eraAssociataA")?.trim() || "",
    dataAttivazione: formData.get("dataAttivazione") || "",
    dataDisattivazione: formData.get("dataDisattivazione") || ""
  };
}
