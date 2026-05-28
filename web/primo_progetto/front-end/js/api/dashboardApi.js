export async function getDashboardSummary() {
  const response = await fetch("back-end/api/dashboard/get-summary.php", {
    cache: "no-store"
  });

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
