import { escapeHtml } from "../utils/escapeHtml.js?v=rmk-sim-db-v5";
import { getDashboardSummary } from "../api/dashboardApi.js?v=rmk-sim-db-v5";
import { buildDashboardMetrics } from "./dashboard/dashboardMetrics.js?v=rmk-sim-db-v5";
import {
  renderDashboardData,
  renderDashboardError,
  renderDashboardLoading
} from "./dashboard/dashboardTemplate.js?v=rmk-sim-db-v5";

export async function renderDashboard(container) {
  container.innerHTML = renderDashboardLoading();

  try {
    const result = await getDashboardSummary();

    if (!result.success) {
      container.innerHTML = renderDashboardError(escapeHtml(result.message));
      return;
    }

    container.innerHTML = renderDashboardData(buildDashboardMetrics(result.data));
  } catch (error) {
    container.innerHTML = renderDashboardError("Errore nel caricamento dei dati.");
  }
}
