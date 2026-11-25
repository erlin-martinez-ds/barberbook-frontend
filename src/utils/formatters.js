const moneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const formatPrice = (value) => moneda.format(Number(value) || 0);
export const formatDuration = (min) => `${min} min`;
