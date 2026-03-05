import { toISODate } from "./date";

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function weekRangeISO(anchorDate = new Date()) {
  // Semana lunes-domingo
  const d = new Date(anchorDate);
  const day = d.getDay(); // 0=dom 1=lun...
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = addDays(d, diffToMonday);
  const sunday = addDays(monday, 6);

  return { from: toISODate(monday), to: toISODate(sunday), monday, sunday };
}