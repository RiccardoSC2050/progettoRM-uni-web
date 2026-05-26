export async function getDashboardSummary() {
  const response = await fetch("back-end/api/dashboard/get-summary.php");

  if (!response.ok) {
    throw new Error("Errore HTTP");
  }

  return await response.json();
}
