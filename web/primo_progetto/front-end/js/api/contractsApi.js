import { API_ENDPOINTS } from "./endpoints.js?v=rmk-architecture-v1";
import { getJson } from "./httpClient.js?v=rmk-architecture-v1";

export function getContracts(filters = {}) {
  return getJson(API_ENDPOINTS.contracts.list, filters);
}

export function getContractDetail(numero) {
  return getJson(API_ENDPOINTS.contracts.detail, { numero });
}

export function getContractCalls(options = {}) {
  return getJson(API_ENDPOINTS.contracts.calls, options);
}
