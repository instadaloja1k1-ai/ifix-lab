// @ts-nocheck

export const TIMEZONE = `America/Sao_Paulo`;
export function formatCurrency(e) {
  let t = e ?? 0;
  return new Intl.NumberFormat(`pt-BR`, {
    style: `currency`,
    currency: `BRL`,
  }).format(t);
}
export const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
export function formatDate(e) {
  if (!e) return `—`;
  let t;
  if (typeof e == `string`) {
    if (DATE_ONLY_RE.test(e)) {
      let [n, r, i] = e.split(`-`).map(Number);
      t = new Date(Date.UTC(n, (r ?? 1) - 1, i ?? 1, 12));
    } else t = new Date(e);
  } else t = e;
  return new Intl.DateTimeFormat(`pt-BR`, {
    timeZone: TIMEZONE,
    day: `2-digit`,
    month: `2-digit`,
    year: `numeric`,
  }).format(t);
}
export function formatDateTime(e) {
  if (!e) return `—`;
  let t = typeof e == `string` ? new Date(e) : e;
  return new Intl.DateTimeFormat(`pt-BR`, {
    timeZone: TIMEZONE,
    day: `2-digit`,
    month: `2-digit`,
    year: `numeric`,
    hour: `2-digit`,
    minute: `2-digit`,
  }).format(t);
}
export function todayISO() {
  let e = new Intl.DateTimeFormat(`en-CA`, {
      timeZone: TIMEZONE,
      year: `numeric`,
      month: `2-digit`,
      day: `2-digit`,
    }).formatToParts(new Date()),
    t = {};
  for (let n of e) t[n.type] = n.value;
  return `${t.year}-${t.month}-${t.day}`;
}
export function addDaysISO(e, t) {
  let [n, r, i] = e.split(`-`).map(Number),
    a = new Date(Date.UTC(n, (r ?? 1) - 1, i ?? 1, 12));
  return (
    a.setUTCDate(a.getUTCDate() + t),
    `${a.getUTCFullYear()}-${String(a.getUTCMonth() + 1).padStart(2, `0`)}-${String(a.getUTCDate()).padStart(2, `0`)}`
  );
}
export function getInitials(e) {
  return e
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((e) => e[0]?.toUpperCase() ?? ``)
    .join(``);
}
