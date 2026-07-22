import { formatNumber } from "./dashboardMetrics.js?v=rmk-sim-db-v5";
import { renderDashboardChart } from "./dashboardChartTemplate.js?v=rmk-sim-db-v5";

export function renderDashboardLoading() {
  return `
    <h2>Dashboard</h2>
    <p>Caricamento dati...</p>
  `;
}

export function renderDashboardError(message) {
  return `
    <h2>Dashboard</h2>
    <p>Errore: ${message}</p>
  `;
}

export function renderDashboardData(metrics) {
  return `
    <h2>Dashboard</h2>

    <div class="dashboard-summary-grid">
      <ul class="dashboard-details-list">
        <li>
          <span>Contratti totali</span>
          <strong>${formatNumber(metrics.contratti)}</strong>
        </li>

        <li>
          <span>SIM attive</span>
          <strong>${formatNumber(metrics.simAttive)}</strong>
        </li>

        <li>
          <span>SIM disattive</span>
          <strong>${formatNumber(metrics.simDisattive)}</strong>
        </li>

        <li>
          <span>SIM non attive</span>
          <strong>${formatNumber(metrics.simNonAttive)}</strong>
        </li>

        <li>
          <span>Telefonate registrate</span>
          <strong>${formatNumber(metrics.telefonate)}</strong>
        </li>
      </ul>

      ${renderDashboardChart(metrics)}
    </div>
  `;
}
