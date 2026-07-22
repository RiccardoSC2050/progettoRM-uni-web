export function getDashboardFilters(refs) {
  return {
    q: refs.filterText?.value.trim() || "",
    tipo: refs.filterType?.value || "",
    data: refs.filterDate?.value || ""
  };
}
