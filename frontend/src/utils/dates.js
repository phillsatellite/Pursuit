// Shared date formatters/parsers used across the pages, kept in one place so
// they don't drift apart from being copy-pasted file to file.

// null/empty renders as a dash instead of "Invalid Date"
export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

// just the "YYYY-MM-DD" slice for <input type="date">
export function toLocalInputDate(iso) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

// <input type="datetime-local"> expects "YYYY-MM-DDTHH:mm" in *local* time.
// build it by hand — toISOString() would convert to UTC and shift the clock.
export function toLocalInputDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
