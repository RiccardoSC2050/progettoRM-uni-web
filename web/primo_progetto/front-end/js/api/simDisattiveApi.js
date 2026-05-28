function appendParam(params, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    params.set(key, value);
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Risposta PHP non valida: ${text}`);
  }
}

function jsonRequest(url, data) {
  return fetchJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

export async function getSimDisattive(filters = {}) {
  const params = new URLSearchParams();

  appendParam(params, "q", filters.q);
  appendParam(params, "tipoSIM", filters.tipoSIM);
  appendParam(params, "dataDisattivazione", filters.dataDisattivazione);
  appendParam(params, "limit", filters.limit);
  appendParam(params, "offset", filters.offset);

  const queryString = params.toString();
  const url = queryString
    ? `back-end/api/sim-disattive/get-sim-disattive.php?${queryString}`
    : "back-end/api/sim-disattive/get-sim-disattive.php";

  return fetchJson(url);
}

export async function createSimDisattiva(data) {
  return jsonRequest("back-end/api/sim-disattive/create-sim-disattiva.php", data);
}

export async function updateSimDisattiva(data) {
  return jsonRequest("back-end/api/sim-disattive/update-sim-disattiva.php", data);
}

export async function deleteSimDisattiva(codice) {
  return jsonRequest("back-end/api/sim-disattive/delete-sim-disattiva.php", { codice });
}
