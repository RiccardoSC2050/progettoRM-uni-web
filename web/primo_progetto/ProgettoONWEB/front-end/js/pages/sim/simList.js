import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v5";
import { getSim } from "../../api/simApi.js?v=rmk-sim-db-v5";
import { getContractOptions } from "./simOptions.js?v=rmk-sim-db-v5";
import { getSimPageSize, getSimRouteState } from "./simListState.js?v=rmk-sim-db-v5";
import { renderSimListError, renderSimListLoading, renderSimListPage } from "./simListView.js?v=rmk-sim-db-v5";
import { bindSimListEvents } from "./simListEvents.js?v=rmk-sim-db-v5";

export async function renderSimList(container, params = new URLSearchParams()) {
  const { currentPage, filters } = getSimRouteState(params);
  const pageSize = getSimPageSize();
  const offset = (currentPage - 1) * pageSize;

  container.innerHTML = renderSimListLoading();

  async function load() {
    const [result, contractOptions] = await Promise.all([
      getSim({
        ...filters,
        limit: pageSize,
        offset
      }),
      getContractOptions()
    ]);

    if (!result.success) {
      container.innerHTML = renderSimListError(`Errore: ${escapeHtml(result.message)}`);
      return;
    }

    container.innerHTML = renderSimListPage({
      currentPage,
      filters,
      pageSize,
      contractOptions,
      result
    });

    bindSimListEvents(container, {
      filters,
      contractOptions,
      reload: load
    });
  }

  try {
    await load();
  } catch (error) {
    container.innerHTML = renderSimListError();
  }
}
