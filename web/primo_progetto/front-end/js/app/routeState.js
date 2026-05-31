export function getRouteData() {
  const hash = window.location.hash || "#/dashboard";
  const [path, queryString = ""] = hash.split("?");

  return {
    path,
    params: new URLSearchParams(queryString)
  };
}

export function setContractsDetailPage(page, sort = "dataAttivazione", direction = "desc") {
  const params = new URLSearchParams({ page, sort, direction });
  const nextHash = `#/contratti-dettaglio?${params.toString()}`;

  if (window.location.hash === nextHash) {
    return false;
  }

  window.location.hash = nextHash;
  return true;
}
