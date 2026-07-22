export function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  return query.toString();
}

async function parseJson(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error("Risposta del server non valida.");
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {})
    }
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new Error(payload?.message || `Errore HTTP ${response.status}`);
  }

  if (!payload) {
    throw new Error("Risposta del server vuota.");
  }

  return payload;
}

export function getJson(url, params = {}) {
  const query = buildQuery(params);
  return requestJson(`${url}${query ? `?${query}` : ""}`);
}

export function postJson(url, data = {}) {
  return requestJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}
