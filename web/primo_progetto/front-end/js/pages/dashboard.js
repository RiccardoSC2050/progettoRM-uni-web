import { escapeHtml } from "../utils/escapeHtml.js?v=rmk-sim-db-v1";
import { getDashboardSummary } from "../api/dashboardApi.js?v=rmk-sim-db-v1";

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString("it-IT");
}

function getPercentage(value, total) {
  const safeTotal = toNumber(total);

  if (safeTotal <= 0) {
    return 0;
  }

  return (toNumber(value) / safeTotal) * 100;
}

function formatPercentage(value) {
  return value.toFixed(1).replace(".", ",") + "%";
}

function getSegmentStyle(value, offset) {
  return `--chart-value: ${value.toFixed(4)}; --chart-offset: ${(-offset).toFixed(4)};`;
}

function getSegmentClass(value, modifier) {
  const hiddenClass = value <= 0 ? " is-hidden" : "";
  return `dashboard-chart-segment dashboard-chart-segment-${modifier}${hiddenClass}`;
}

export async function renderDashboard(container) {
  container.innerHTML = `
    <h2>Dashboard</h2>
    <p>Caricamento dati...</p>
  `;

  try {
    const result = await getDashboardSummary();

    if (!result.success) {
      container.innerHTML = `
        <h2>Dashboard</h2>
        <p>Errore: ${escapeHtml(result.message)}</p>
      `;
      return;
    }

    const data = result.data;
    const contratti = toNumber(data.contratti);
    const simAttive = toNumber(data.simAttive);
    const simDisattive = toNumber(data.simDisattive);
    const simNonAttive = toNumber(data.simNonAttive);
    const telefonate = toNumber(data.telefonate);
    const totaleSIM = simAttive + simDisattive + simNonAttive;

    const simAttivePercent = getPercentage(simAttive, totaleSIM);
    const simDisattivePercent = getPercentage(simDisattive, totaleSIM);
    const simNonAttivePercent = getPercentage(simNonAttive, totaleSIM);

    const simDisattiveOffset = simAttivePercent;
    const simNonAttiveOffset = simAttivePercent + simDisattivePercent;

    container.innerHTML = `
      <h2>Dashboard</h2>

      <div class="dashboard-summary-grid">
        <ul class="dashboard-details-list">
          <li>
            <span>Contratti totali</span>
            <strong>${formatNumber(contratti)}</strong>
          </li>

          <li>
            <span>SIM attive</span>
            <strong>${formatNumber(simAttive)}</strong>
          </li>

          <li>
            <span>SIM disattive</span>
            <strong>${formatNumber(simDisattive)}</strong>
          </li>

          <li>
            <span>SIM non attive</span>
            <strong>${formatNumber(simNonAttive)}</strong>
          </li>

          <li>
            <span>Telefonate registrate</span>
            <strong>${formatNumber(telefonate)}</strong>
          </li>
        </ul>

        <section class="dashboard-chart-card" aria-label="Distribuzione percentuale delle SIM">
          <h3 class="dashboard-chart-title">Distribuzione SIM</h3>

          <div class="dashboard-chart-wrapper">
            <svg class="dashboard-chart-svg" viewBox="0 0 120 120" role="img" aria-label="SIM attive ${formatPercentage(simAttivePercent)}, SIM disattive ${formatPercentage(simDisattivePercent)}, SIM non attive ${formatPercentage(simNonAttivePercent)}">
              <circle class="dashboard-chart-track" cx="60" cy="60" r="48"></circle>
              <circle class="${getSegmentClass(simAttivePercent, "active")}" cx="60" cy="60" r="48" pathLength="100" style="${getSegmentStyle(simAttivePercent, 0)}"></circle>
              <circle class="${getSegmentClass(simDisattivePercent, "disabled")}" cx="60" cy="60" r="48" pathLength="100" style="${getSegmentStyle(simDisattivePercent, simDisattiveOffset)}"></circle>
              <circle class="${getSegmentClass(simNonAttivePercent, "inactive")}" cx="60" cy="60" r="48" pathLength="100" style="${getSegmentStyle(simNonAttivePercent, simNonAttiveOffset)}"></circle>
            </svg>

            <div class="dashboard-chart-center">
              <strong>${formatNumber(totaleSIM)}</strong>
              <span>SIM totali</span>
            </div>
          </div>

          <div class="dashboard-chart-legend">
            <div class="dashboard-chart-legend-item">
              <span class="dashboard-chart-dot dashboard-chart-dot-active"></span>
              <p>
                <strong>Attive</strong>
                <span>${formatPercentage(simAttivePercent)}</span>
              </p>
            </div>

            <div class="dashboard-chart-legend-item">
              <span class="dashboard-chart-dot dashboard-chart-dot-disabled"></span>
              <p>
                <strong>Disattive</strong>
                <span>${formatPercentage(simDisattivePercent)}</span>
              </p>
            </div>

            <div class="dashboard-chart-legend-item">
              <span class="dashboard-chart-dot dashboard-chart-dot-inactive"></span>
              <p>
                <strong>Non attive</strong>
                <span>${formatPercentage(simNonAttivePercent)}</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `
      <h2>Dashboard</h2>
      <p>Errore nel caricamento dei dati.</p>
    `;
  }
}
