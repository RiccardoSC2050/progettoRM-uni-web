const API_BASE = "back-end/api";

export const API_ENDPOINTS = {
  dashboard: {
    summary: `${API_BASE}/dashboard/get-summary.php`
  },
  contracts: {
    list: `${API_BASE}/contracts/get-contracts.php`,
    detail: `${API_BASE}/contracts/get-contract-detail.php`,
    calls: `${API_BASE}/contracts/get-contract-calls.php`
  },
  calls: {
    summary: `${API_BASE}/telefonate/get-calls-summary.php`,
    list: `${API_BASE}/telefonate/get-calls.php`
  },
  sim: {
    list: `${API_BASE}/sim/get-sim.php`,
    create: `${API_BASE}/sim/create-sim.php`,
    update: `${API_BASE}/sim/update-sim.php`,
    delete: `${API_BASE}/sim/delete-sim.php`
  }
};
