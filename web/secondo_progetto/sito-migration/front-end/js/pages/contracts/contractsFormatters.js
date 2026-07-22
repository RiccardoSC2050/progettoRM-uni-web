export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function formatNumber(value) {
  return toNumber(value).toLocaleString("it-IT");
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(toNumber(value));
}

export function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("it-IT").format(new Date(`${value}T00:00:00`));
}

export function formatContractType(type) {
  return type === "ricarica" ? "Ricarica" : "Consumo";
}

export function secondsToRoundedMinutes(seconds) {
  const value = toNumber(seconds);

  if (value <= 0) {
    return 0;
  }

  return Math.ceil(value / 60);
}

export function formatCallMinutes(seconds) {
  return `${formatNumber(secondsToRoundedMinutes(seconds))} min`;
}

export function formatContractValue(contract) {
  if (contract.tipo === "ricarica") {
    return formatCurrency(contract.creditoResiduo);
  }

  return formatCallMinutes(contract.durataTotale);
}
