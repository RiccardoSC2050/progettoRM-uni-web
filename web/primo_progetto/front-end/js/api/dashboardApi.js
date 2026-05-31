import { API_ENDPOINTS } from "./endpoints.js?v=rmk-architecture-v1";
import { getJson } from "./httpClient.js?v=rmk-architecture-v1";

export function getDashboardSummary() {
  return getJson(API_ENDPOINTS.dashboard.summary);
}
