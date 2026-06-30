import { getRouteData, setContractsDetailPage } from "./routeState.js?v=rmk-sim-db-v5";

export function bindGlobalFilters(refs, router) {
  if (!refs.filterForm) {
    return;
  }

  refs.filterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const { path, params } = getRouteData();

    if (path === "#/contratti-dettaglio") {
      if (!setContractsDetailPage(1, params.get("sort") || "dataAttivazione", params.get("direction") || "desc")) {
        router();
      }
      return;
    }

    router();
  });

  refs.filterForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      const { path, params } = getRouteData();

      if (path === "#/contratti-dettaglio") {
        if (!setContractsDetailPage(1, params.get("sort") || "dataAttivazione", params.get("direction") || "desc")) {
          router();
        }
        return;
      }

      router();
    }, 0);
  });
}
