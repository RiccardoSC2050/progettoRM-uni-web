const MONTHS = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
];

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("it-IT");
}

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR"
  });
}

export function formatCompactCurrency(value) {
  const amount = Number(value || 0);

  if (Math.abs(amount) <= 100000) {
    return formatCurrency(amount);
  }

  const compactValue = amount.toLocaleString("it-IT", {
    notation: "compact",
    maximumFractionDigits: 1
  });

  return `${compactValue} €`;
}

export function formatChartCurrency(value) {
  const amount = Number(value || 0);

  if (Math.abs(amount) < 1000) {
    const valueLabel = amount.toLocaleString("it-IT", {
      maximumFractionDigits: 0
    });

    return `${valueLabel} €`;
  }

  const compactValue = amount.toLocaleString("it-IT", {
    notation: "compact",
    maximumFractionDigits: 1
  });

  return `${compactValue} €`;
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function formatTime(value) {
  if (!value) {
    return "-";
  }

  return String(value).slice(0, 5);
}

export function formatDuration(seconds) {
  const total = Number(seconds || 0);
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export function getMonthLabel(month) {
  return MONTHS[Number(month) - 1] || "-";
}
