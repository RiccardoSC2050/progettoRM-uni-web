function appendParam(params, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    params.set(key, value);
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Risposta PHP non valida: ${text}`);
  }
}

export async function getContracts(filters = {}) {
  const params = new URLSearchParams();

  appendParam(params, "q", filters.q);
  appendParam(params, "tipo", filters.tipo);
  appendParam(params, "data", filters.data);
  appendParam(params, "sort", filters.sort);
  appendParam(params, "direction", filters.direction);
  appendParam(params, "limit", filters.limit);
  appendParam(params, "offset", filters.offset);

  const queryString = params.toString();
  const url = queryString
    ? `back-end/api/contracts/get-contracts.php?${queryString}`
    : "back-end/api/contracts/get-contracts.php";

  return fetchJson(url);
}

export async function getContractDetail(numero) {
  const params = new URLSearchParams({ numero });
  return fetchJson(`back-end/api/contracts/get-contract-detail.php?${params.toString()}`);
}

export async function getContractCalls(options = {}) {
  const params = new URLSearchParams();

  appendParam(params, "numero", options.numero);
  appendParam(params, "id", options.id);
  appendParam(params, "data", options.data);
  appendParam(params, "minDurata", options.minDurata);
  appendParam(params, "maxCosto", options.maxCosto);
  appendParam(params, "limit", options.limit);
  appendParam(params, "offset", options.offset);

  return fetchJson(`back-end/api/contracts/get-contract-calls.php?${params.toString()}`);
}
