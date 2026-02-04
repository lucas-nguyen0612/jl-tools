export const APP_TIMEZONE = "Asia/Ho_Chi_Minh";

export function formatDateInTZ(date: Date, timeZone = APP_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getTodayInTZ() {
  return formatDateInTZ(new Date(), APP_TIMEZONE);
}

export function addDays(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day + days);
  return new Date(utc).toISOString().slice(0, 10);
}

export function diffInDays(fromDate: string, toDate: string) {
  const [y1, m1, d1] = fromDate.split("-").map(Number);
  const [y2, m2, d2] = toDate.split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / 86400000);
}

export function getDateRange(endDate: string, days: number) {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    dates.push(addDays(endDate, -i));
  }
  return dates;
}

export function getMonthInfo(dateStr: string) {
  const [year, month] = dateStr.split("-").map(Number);
  return getMonthInfoFor(year, month);
}

export function getMonthInfoFor(year: number, month: number) {
  const firstDayUtc = Date.UTC(year, month - 1, 1);
  const firstDay = new Date(firstDayUtc);
  const lastDayUtc = Date.UTC(year, month, 0);
  const lastDay = new Date(lastDayUtc);
  return {
    year,
    month,
    daysInMonth: lastDay.getUTCDate(),
    firstWeekday: firstDay.getUTCDay()
  };
}
