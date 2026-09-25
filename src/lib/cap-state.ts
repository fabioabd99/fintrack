export type CapState = "ok" | "near" | "over";

// used = spent / cap. "near" from 80%, exactly 100% is not over yet.
export function capState(used: number): CapState {
  if (used > 1) return "over";
  if (used >= 0.8) return "near";
  return "ok";
}
