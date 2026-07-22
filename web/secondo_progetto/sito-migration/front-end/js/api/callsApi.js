import { API_ENDPOINTS } from "./endpoints.js?v=rmk-sim-db-v5";
import { getJson } from "./httpClient.js?v=rmk-sim-db-v5";

export function getCallsSummary(params = {}) {
  return getJson(API_ENDPOINTS.calls.summary, params);
}

export function getCalls(params = {}) {
  return getJson(API_ENDPOINTS.calls.list, params);
}
