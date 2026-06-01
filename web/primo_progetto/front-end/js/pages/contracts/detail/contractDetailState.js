import { getResponsivePageSize } from "../../../utils/responsivePageSize.js?v=rmk-sim-db-v1";

const DESKTOP_CALLS_PAGE_SIZE = 5;
const MOBILE_CALLS_PAGE_SIZE = 3;

export function getCallsPageSize() {
  return getResponsivePageSize(DESKTOP_CALLS_PAGE_SIZE, MOBILE_CALLS_PAGE_SIZE);
}

export function getRangeStart(page, total, count) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return (page - 1) * getCallsPageSize() + 1;
}

export function getRangeEnd(page, total, count) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return Math.min(page * getCallsPageSize(), total);
}

export function getCallsFilters(container) {
  const form = container.querySelector(".contract-calls-filter-form");

  if (!form) {
    return {};
  }

  const formData = new FormData(form);

  return {
    id: String(formData.get("id") || "").trim(),
    data: String(formData.get("data") || ""),
    minDurata: String(formData.get("minDurata") || "").trim(),
    maxCosto: String(formData.get("maxCosto") || "").trim()
  };
}
