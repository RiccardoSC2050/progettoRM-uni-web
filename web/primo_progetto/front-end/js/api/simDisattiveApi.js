import { API_ENDPOINTS } from "./endpoints.js?v=rmk-architecture-v1";
import { getJson, postJson } from "./httpClient.js?v=rmk-architecture-v1";

export function getSimDisattive(filters = {}) {
  return getJson(API_ENDPOINTS.simDisattive.list, filters);
}

export function createSimDisattiva(data) {
  return postJson(API_ENDPOINTS.simDisattive.create, data);
}

export function updateSimDisattiva(data) {
  return postJson(API_ENDPOINTS.simDisattive.update, data);
}

export function deleteSimDisattiva(codice) {
  return postJson(API_ENDPOINTS.simDisattive.delete, { codice });
}
