import { getContracts } from "../../api/contractsApi.js?v=rmk-sim-db-v1";

function isAvailableContract(contract, currentContract = "") {
  if (!contract?.numero) {
    return false;
  }

  return !contract.codiceSIM || contract.numero === currentContract;
}

export async function getAvailableContractOptions(query = "", currentContract = "") {
  try {
    const result = await getContracts({
      q: query,
      limit: 20,
      offset: 0,
      sort: "numero",
      direction: "asc"
    });

    if (!result.success) {
      return currentContract ? [currentContract] : [];
    }

    const options = result.data.contratti
      .filter((contract) => isAvailableContract(contract, currentContract))
      .map((contract) => contract.numero)
      .filter(Boolean);

    if (currentContract && !options.includes(currentContract)) {
      options.unshift(currentContract);
    }

    return options;
  } catch (_) {
    return currentContract ? [currentContract] : [];
  }
}

export function getContractOptions() {
  return getAvailableContractOptions();
}
