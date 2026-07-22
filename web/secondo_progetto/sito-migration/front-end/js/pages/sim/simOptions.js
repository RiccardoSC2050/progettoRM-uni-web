import { getContracts } from "../../api/contractsApi.js?v=rmk-sim-db-v5";

function isAvailableContract(contract, currentContract = "") {
  if (!contract?.numero) {
    return false;
  }

  return !contract.codiceSIM || contract.numero === currentContract;
}

function normalizeAvailableOptions(contracts, currentContract = "") {
  const options = contracts
    .filter((contract) => isAvailableContract(contract, currentContract))
    .map((contract) => contract.numero)
    .filter(Boolean);

  if (currentContract && !options.includes(currentContract)) {
    options.unshift(currentContract);
  }

  return Array.from(new Set(options));
}

export async function getAvailableContractOptions(query = "", currentContract = "") {
  try {
    const result = await getContracts({
      q: query,
      availableForSim: "1",
      limit: 30,
      offset: 0,
      sort: "numero",
      direction: "asc"
    });

    if (!result.success) {
      return currentContract ? [currentContract] : [];
    }

    return normalizeAvailableOptions(result.data.contratti, currentContract);
  } catch (_) {
    return currentContract ? [currentContract] : [];
  }
}

export function getContractOptions() {
  return getAvailableContractOptions();
}
