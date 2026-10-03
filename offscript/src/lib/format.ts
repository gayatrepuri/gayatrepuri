// Helpers for showing dates and times nicely.

/**
 * Reads a time from the database reliably on every phone.
 * The database sends times like "2026-10-03T12:05:09.123456+00:00"; some phone
 * engines misread the extra digits or the offset, so we tidy it into the
 * standard "2026-10-03T12:05:09.123Z" form first.
 */
export function parseTime(iso: string) {
  let s = iso.trim().replace(' ', 'T');
  s = s.replace(/(\.\d{3})\d+/, '$1'); // keep milliseconds only
  s = s.replace(/([+-]\d\d)$/, '$1:00'); // "+00" → "+00:00"
  s = s.replace(/([+-]\d\d)(\d\d)$/, '$1:$2'); // "+0000" → "+00:00"
  if (!/(Z|[+-]\d\d:\d\d)$/i.test(s)) s += 'Z'; // no timezone → it's UTC
  return new Date(s);
}

const hm = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function formatWhen(iso: string | null) {
  if (!iso) return 'Anytime';
  const d = parseTime(iso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (d.toDateString() === now.toDateString()) return `Today · ${hm(d)}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow · ${hm(d)}`;
  return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${hm(d)}`;
}

/** For chat messages: "14:05", "Yesterday 09:12", or "3 Oct 18:40". */
export function messageTime(iso: string) {
  const d = parseTime(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return hm(d);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${hm(d)}`;
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${hm(d)}`;
}

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - parseTime(iso).getTime()) / 1000);
  if (!Number.isFinite(s)) return '';
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
