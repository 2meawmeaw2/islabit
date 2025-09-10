export const addAlpha = (hex: string, a: number) => {
  // hex #RRGGBB
  try {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  } catch {
    return `rgba(0,174,239,${a})`; // brand fallback
  }
};
