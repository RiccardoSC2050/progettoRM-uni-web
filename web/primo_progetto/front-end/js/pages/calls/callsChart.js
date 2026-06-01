import {
  formatChartCurrency,
  formatCurrency,
  formatNumber,
  getMonthLabel
} from "./callsFormatters.js?v=rmk-sim-db-v1";

export function renderCallsYearSelector(years = [], selectedYear) {
  return `
    <form class="calls-year-form">
      <label for="calls-year">Anno grafico</label>
      <select id="calls-year" name="year">
        ${years
          .map((year) => `
            <option value="${year}" ${Number(year) === Number(selectedYear) ? "selected" : ""}>
              ${year}
            </option>
          `)
          .join("")}
      </select>
    </form>
  `;
}

export function renderCallsChart(monthly = []) {
  const maxValue = Math.max(...monthly.map((item) => Number(item.entrate || 0)), 1);

  return `
    <section class="calls-chart-card">
      <div class="calls-section-heading">
        <h3>Entrate mensili</h3>
        <p>Distribuzione dei costi registrati nelle telefonate dell’anno selezionato.</p>
      </div>

      <div class="calls-chart">
        ${monthly
          .map((item) => {
            const value = Number(item.entrate || 0);
            const height = Math.max(6, (value / maxValue) * 100);

            return `
              <div class="calls-chart-item">
                <div class="calls-chart-bar-wrap" title="${formatCurrency(value)} · ${formatNumber(item.telefonate)} telefonate">
                  <span class="calls-chart-value">${formatChartCurrency(value)}</span>
                  <span
                    class="calls-chart-bar"
                    style="--calls-bar-height: ${height}%"
                    aria-hidden="true"
                  ></span>
                </div>
                <strong>${getMonthLabel(item.mese)}</strong>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}
