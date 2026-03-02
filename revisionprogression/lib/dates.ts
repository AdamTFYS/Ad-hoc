const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(iso: string, includeYear = false): string {
  const [year, month, day] = iso.split("-");
  const m = MONTH_NAMES[parseInt(month, 10) - 1];
  const d = parseInt(day, 10);
  return includeYear ? `${m} ${d}, ${year}` : `${m} ${d}`;
}

export function formatTime(time: string): string {
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

export function isOverdue(iso: string): boolean {
  return iso < todayISO();
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeDurationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function formatDuration(minutes: number): string {
  if (minutes < 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getMonthGrid(year: number, month: number): { startOffset: number; daysInMonth: number } {
  // month is 1-based
  const firstDay = new Date(year, month - 1, 1);
  // getDay() returns 0=Sun, we want Mon=0
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const daysInMonth = new Date(year, month, 0).getDate();
  return { startOffset, daysInMonth };
}
