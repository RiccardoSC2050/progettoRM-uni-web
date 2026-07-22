import { formatNumber, formatPercentage } from "./dashboardMetrics.js?v=rmk-sim-db-v5";

function getSegmentStyle(value, offset) {
  return `--chart-value: ${value.toFixed(4)}; --chart-offset: ${(-offset).toFixed(4)};`;
}

function getSegmentClass(value, modifier) {
  const hiddenClass = value <= 0 ? " is-hidden" : "";
  return `dashboard-chart-segment dashboard-chart-segment-${modifier}${hiddenClass}`;
}

export function renderDashboardChart(metrics) {
  return `
    <section class="dashboard-chart-card" aria-label="Distribuzione percentuale delle SIM">
      <h3 class="dashboard-chart-title">Distribuzione SIM</h3>

      <div class="dashboard-chart-wrapper">
        <svg class="dashboard-chart-svg" viewBox="0 0 120 120" role="img" aria-label="SIM attive ${formatPercentage(metrics.simAttivePercent)}, SIM disattive ${formatPercentage(metrics.simDisattivePercent)}, SIM non attive ${formatPercentage(metrics.simNonAttivePercent)}">
          <circle class="dashboard-chart-track" cx="60" cy="60" r="48"></circle>
          <circle class="${getSegmentClass(metrics.simAttivePercent, "active")}" cx="60" cy="60" r="48" pathLength="100" style="${getSegmentStyle(metrics.simAttivePercent, 0)}"></circle>
          <circle class="${getSegmentClass(metrics.simDisattivePercent, "disabled")}" cx="60" cy="60" r="48" pathLength="100" style="${getSegmentStyle(metrics.simDisattivePercent, metrics.simDisattiveOffset)}"></circle>
          <circle class="${getSegmentClass(metrics.simNonAttivePercent, "inactive")}" cx="60" cy="60" r="48" pathLength="100" style="${getSegmentStyle(metrics.simNonAttivePercent, metrics.simNonAttiveOffset)}"></circle>
        </svg>

        <div class="dashboard-chart-center">
          <strong>${formatNumber(metrics.totaleSIM)}</strong>
          <span>SIM totali</span>
        </div>
      </div>

      <div class="dashboard-chart-legend">
        <div class="dashboard-chart-legend-item">
          <span class="dashboard-chart-dot dashboard-chart-dot-active"></span>
          <p>
            <strong>Attive</strong>
            <span>${formatPercentage(metrics.simAttivePercent)}</span>
          </p>
        </div>

        <div class="dashboard-chart-legend-item">
          <span class="dashboard-chart-dot dashboard-chart-dot-disabled"></span>
          <p>
            <strong>Disattive</strong>
            <span>${formatPercentage(metrics.simDisattivePercent)}</span>
          </p>
        </div>

        <div class="dashboard-chart-legend-item">
          <span class="dashboard-chart-dot dashboard-chart-dot-inactive"></span>
          <p>
            <strong>Non attive</strong>
            <span>${formatPercentage(metrics.simNonAttivePercent)}</span>
          </p>
        </div>
      </div>
    </section>
  `;
}
