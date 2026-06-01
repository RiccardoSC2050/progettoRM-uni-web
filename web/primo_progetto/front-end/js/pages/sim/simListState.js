import { getResponsivePageSize } from "../../utils/responsivePageSize.js?v=rmk-sim-db-v1";

const DESKTOP_PAGE_SIZE = 15;
const MOBILE_PAGE_SIZE = 3;

export function getSimPageSize() {
  return getResponsivePageSize(DESKTOP_PAGE_SIZE, MOBILE_PAGE_SIZE, "(max-width: 900px)");
}

export function getRangeStart(page, total, count, pageSize) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return (page - 1) * pageSize + 1;
}

export function getRangeEnd(page, total, count, pageSize) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return Math.min(page * pageSize, total);
}

export function setSimPage(page, filters = {}) {
  const params = new URLSearchParams({ page });

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  window.location.hash = `#/sim-dettaglio?${params.toString()}`;
}

export function getSimRouteState(params = new URLSearchParams()) {
  return {
    currentPage: Math.max(1, Number(params.get("page")) || 1),
    filters: {
      q: params.get("q") || "",
      stato: params.get("stato") || "",
      tipoSIM: params.get("tipoSIM") || "",
      dataDisattivazione: params.get("dataDisattivazione") || ""
    }
  };
}
