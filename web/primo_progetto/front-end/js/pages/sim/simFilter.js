export function renderSimFilter(filters = {}) {
  return `
    <section class="sim-filter-card">
      <div class="sim-section-heading">
        <h3>Filtro SIM</h3>
        <p>Cerca per codice o contratto, tipo SIM e data di disattivazione.</p>
      </div>

      <form class="sim-filter-form">
        <div class="sim-filter-fields">
          <div class="sim-field">
            <label for="sim-filter-q">Ricerca</label>
            <input id="sim-filter-q" name="q" type="text" placeholder="Codice o contratto" value="${filters.q || ""}" />
          </div>

          <div class="sim-field">
            <label for="sim-filter-type">Tipo SIM</label>
            <select id="sim-filter-type" name="tipoSIM">
              <option value="">Tutte</option>
              <option value="standard" ${filters.tipoSIM === "standard" ? "selected" : ""}>standard</option>
              <option value="microSIM" ${filters.tipoSIM === "microSIM" ? "selected" : ""}>microSIM</option>
              <option value="nanoSIM" ${filters.tipoSIM === "nanoSIM" ? "selected" : ""}>nanoSIM</option>
              <option value="eSIM" ${filters.tipoSIM === "eSIM" ? "selected" : ""}>eSIM</option>
            </select>
          </div>

          <div class="sim-field">
            <label for="sim-filter-date">Disattivazione</label>
            <input id="sim-filter-date" name="dataDisattivazione" type="date" value="${filters.dataDisattivazione || ""}" />
          </div>
        </div>

        <div class="sim-filter-actions">
          <button class="sim-btn sim-btn-primary" type="submit">Applica</button>
          <button class="sim-btn sim-btn-secondary" type="reset">Reset</button>
        </div>
      </form>
    </section>
  `;
}

export function getSimFiltersFromForm(form) {
  const data = new FormData(form);

  return {
    q: data.get("q")?.trim() || "",
    tipoSIM: data.get("tipoSIM") || "",
    dataDisattivazione: data.get("dataDisattivazione") || ""
  };
}
