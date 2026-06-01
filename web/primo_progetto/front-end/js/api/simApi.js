import { API_ENDPOINTS } from "./endpoints.js?v=rmk-sim-db-v1";
import { getJson, postJson } from "./httpClient.js?v=rmk-sim-db-v1";

export function getSim(filters = {}) {
  return getJson(API_ENDPOINTS.sim.list, filters);
}

export function createSim(data) {
  return postJson(API_ENDPOINTS.sim.create, data);
}

export function updateSim(data) {
  return postJson(API_ENDPOINTS.sim.update, data);
}

export function deleteSim(codice) {
  return postJson(API_ENDPOINTS.sim.delete, { codice });
}
