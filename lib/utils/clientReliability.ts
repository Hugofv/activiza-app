/** Minimal shape for client-like objects that may carry a reliability score. */
export type ReliabilitySource = {
  rating?: number | null;
  reliability?: unknown;
  meta?: { reliability?: unknown } | null;
} | null | undefined;

/**
 * Numeric reliability for UI (e.g. loan cards, client list).
 * Order: `rating`, top-level `reliability`, then `meta.reliability`.
 */
export function getReliabilityScore(source: ReliabilitySource): number {
  if (!source) return 0;
  if (source.rating != null && Number.isFinite(source.rating)) {
    return Math.round(source.rating);
  }
  const top = source.reliability;
  if (top != null && top !== '') {
    const n = Number(top);
    if (Number.isFinite(n)) return Math.round(n);
  }
  const raw = source.meta?.reliability;
  if (raw != null && raw !== '') {
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.round(n);
  }
  return 0;
}
