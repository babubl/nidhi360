export const inr = (n: number): string => "₹" + Math.round(n).toLocaleString("en-IN");

/** Compact Indian format: ₹4.2 L, ₹3.07 Cr. */
export const inrShort = (n: number): string => {
  const v = Math.round(n);
  const trim = (x: number) => x.toFixed(2).replace(/\.?0+$/, "");
  if (Math.abs(v) >= 1e7) return `₹${trim(v / 1e7)} Cr`;
  if (Math.abs(v) >= 1e5) return `₹${trim(v / 1e5)} L`;
  return inr(v);
};

export const fmtDate = (iso: string): string =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
