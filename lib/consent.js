// ── Cookie / consent helpers (client only) ──────────────────────────────────
// The choice is kept in localStorage so it survives reloads, and broadcast via
// a CustomEvent so Analytics and AdSlot can react without a page refresh.
//
// "Essential" storage (the choice itself, plus a tool's own autosave such as
// the CV builder draft) never needs consent. Only ads + analytics are gated.

export const CONSENT_KEY = "toolsstars-consent";
export const CONSENT_EVENT = "toolsstars:consent";

export const DEFAULT_CONSENT = { v: 1, ads: false, analytics: false, ts: 0 };

export function readConsent() {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONSENT, ...parsed };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function writeConsent({ ads, analytics }) {
  const next = { v: 1, ads: !!ads, analytics: !!analytics, ts: Date.now() };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  } catch {
    // Private mode / full storage — keep the choice in memory only.
  }
  window.__toolsstarsConsent = next;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
  return next;
}

// Calls fn immediately with the current choice, then on every change.
export function subscribeConsent(fn) {
  if (typeof window === "undefined") return () => {};
  fn(readConsent());
  const handler = (e) => fn(e.detail || readConsent());
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}
