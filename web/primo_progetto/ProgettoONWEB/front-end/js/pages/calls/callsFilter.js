export function renderCallsFilter(filters = {}) {
  return `
    <section class="calls-filter-card">
      <div class="calls-section-heading">
        <h3>Filtro telefonate</h3>
        <p>Cerca per ID o contratto e restringi per data, durata o costo.</p>
      </div>

      <form class="calls-filter-form">
        <div class="calls-filter-fields">
          <div class="calls-field">
            <label for="calls-filter-q">Ricerca</label>
            <input id="calls-filter-q" name="q" type="text" placeholder="ID o contratto" value="${filters.q || ""}" />
          </div>

          <div class="calls-field">
            <label for="calls-filter-date">Data</label>
            <input id="calls-filter-date" name="data" type="date" value="${filters.data || ""}" />
          </div>

          <div class="calls-field">
            <label for="calls-filter-duration">Durata minima</label>
            <input id="calls-filter-duration" name="durataMin" type="number" min="0" step="1" placeholder="Secondi" value="${filters.durataMin || ""}" />
          </div>

          <div class="calls-field">
            <label for="calls-filter-cost-min">Costo minimo</label>
            <input id="calls-filter-cost-min" name="costoMin" type="number" min="0" step="0.01" placeholder="€" value="${filters.costoMin || ""}" />
          </div>

          <div class="calls-field">
            <label for="calls-filter-cost-max">Costo massimo</label>
            <input id="calls-filter-cost-max" name="costoMax" type="number" min="0" step="0.01" placeholder="€" value="${filters.costoMax || ""}" />
          </div>
        </div>

        <div class="calls-filter-actions">
          <button class="calls-btn calls-btn-primary" type="submit">Applica</button>
          <button class="calls-btn calls-btn-secondary" type="reset">Reset</button>
        </div>
      </form>
    </section>
  `;
}

export function getCallsFiltersFromForm(form) {
  const data = new FormData(form);

  return {
    q: data.get("q")?.trim() || "",
    data: data.get("data") || "",
    durataMin: data.get("durataMin") || "",
    costoMin: data.get("costoMin") || "",
    costoMax: data.get("costoMax") || ""
  };
}
