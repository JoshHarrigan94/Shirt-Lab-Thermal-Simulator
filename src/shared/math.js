export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const round = (value, digits = 1) => Number(value.toFixed(digits));
