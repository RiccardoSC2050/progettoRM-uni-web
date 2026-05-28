const SUMMARY_API_URL = "back-end/api/telefonate/get-calls-summary.php";
const CALLS_API_URL = "back-end/api/telefonate/get-calls.php";

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  return query.toString();
}

export async function getCallsSummary(params = {}) {
  const query = buildQuery(params);
  const response = await fetch(`${SUMMARY_API_URL}${query ? `?${query}` : ""}`);

  return response.json();
}

export async function getCalls(params = {}) {
  const query = buildQuery(params);
  const response = await fetch(`${CALLS_API_URL}${query ? `?${query}` : ""}`);

  return response.json();
}
