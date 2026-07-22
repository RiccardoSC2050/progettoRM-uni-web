import { API_ENDPOINTS } from "./endpoints.js?v=rmk-sim-db-v5";
import { getJson } from "./httpClient.js?v=rmk-sim-db-v5";

export function getDashboardSummary() {
  return getJson(API_ENDPOINTS.dashboard.summary);
}
