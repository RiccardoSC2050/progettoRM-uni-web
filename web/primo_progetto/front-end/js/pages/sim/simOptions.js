import { getContracts } from "../../api/contractsApi.js?v=rmk-architecture-v1";

export async function getContractOptions() {
  try {
    const result = await getContracts({
      limit: 8,
      offset: 0,
      sort: "dataAttivazione",
      direction: "desc"
    });

    if (!result.success) {
      return [];
    }

    return result.data.contratti
      .map((contract) => contract.numero)
      .filter(Boolean);
  } catch (_) {
    return [];
  }
}
