import { getDashboardSummary } from "../api/dashboardApi.js";

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
        <p>Errore: ${result.message}</p>
      `;
      return;
    }

    const data = result.data;

    container.innerHTML = `
      <h2>Dashboard</h2>

      <ul class="dashboard-details-list">
        <li>Contratti totali: ${data.contratti}</li>
        <li>SIM attive: ${data.simAttive}</li>
        <li>SIM disattive: ${data.simDisattive}</li>
        <li>SIM non attive: ${data.simNonAttive}</li>
        <li>Telefonate registrate: ${data.telefonate}</li>
      </ul>
    `;
  } catch (error) {
    container.innerHTML = `
      <h2>Dashboard</h2>
      <p>Errore nel caricamento dei dati.</p>
    `;
  }
}
