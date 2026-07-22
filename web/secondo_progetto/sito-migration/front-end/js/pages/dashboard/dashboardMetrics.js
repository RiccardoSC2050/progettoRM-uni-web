export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function formatNumber(value) {
  return toNumber(value).toLocaleString("it-IT");
}

export function getPercentage(value, total) {
  const safeTotal = toNumber(total);

  if (safeTotal <= 0) {
    return 0;
  }

  return (toNumber(value) / safeTotal) * 100;
}

export function formatPercentage(value) {
  return value.toFixed(1).replace(".", ",") + "%";
}

export function buildDashboardMetrics(data) {
  const contratti = toNumber(data.contratti);
  const simAttive = toNumber(data.simAttive);
  const simDisattive = toNumber(data.simDisattive);
  const simNonAttive = toNumber(data.simNonAttive);
  const telefonate = toNumber(data.telefonate);
  const totaleSIM = simAttive + simDisattive + simNonAttive;

  const simAttivePercent = getPercentage(simAttive, totaleSIM);
  const simDisattivePercent = getPercentage(simDisattive, totaleSIM);
  const simNonAttivePercent = getPercentage(simNonAttive, totaleSIM);

  return {
    contratti,
    simAttive,
    simDisattive,
    simNonAttive,
    telefonate,
    totaleSIM,
    simAttivePercent,
    simDisattivePercent,
    simNonAttivePercent,
    simDisattiveOffset: simAttivePercent,
    simNonAttiveOffset: simAttivePercent + simDisattivePercent
  };
}
