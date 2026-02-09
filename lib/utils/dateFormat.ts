import {
  type Locale,
  format as fnsFormat,
  formatDistance,
  formatRelative,
  isToday,
  isYesterday,
} from 'date-fns';
import { enGB, ptBR } from 'date-fns/locale';

// -----------------------------------------------------------------------
// Locale resolution (aligned with the app's i18n supported languages)
// Lazy-imports i18n to avoid circular / timing issues during app startup.
// -----------------------------------------------------------------------

const LOCALE_MAP: Record<string, Locale> = {
  'pt-BR': ptBR,
  'en-UK': enGB,
  'en-BR': enGB,
};

let _i18n: { language?: string } | null = null;

function getI18n() {
  if (!_i18n) {
    // Lazy import to avoid circular / timing issues during app startup
    _i18n = (require('@/translation') as { default: { language?: string } }).default; // eslint-disable-line
  }
  return _i18n;
}

function getLocale(override?: string): Locale {
  const key = override ?? getI18n()?.language ?? 'pt-BR';
  return LOCALE_MAP[key] ?? ptBR;
}

// -----------------------------------------------------------------------
// Core formatting
// -----------------------------------------------------------------------

/**
 * Format a Date with a date-fns token string.
 * Automatically resolves the locale from i18n unless `locale` is provided.
 *
 * @example
 * formatDate(new Date())                      // "08/02/2026"
 * formatDate(new Date(), 'dd MMM yyyy')       // "08 fev 2026"
 * formatDate(new Date(), 'HH:mm')             // "14:30"
 * formatDate(new Date(), 'PPPp', 'en-UK')     // "8 February 2026 at 14:30"
 */
export function formatDate(
  date: Date | string | null | undefined,
  pattern = 'dd/MM/yyyy',
  locale?: string
): string {
  const d = date instanceof Date ? date : new Date(date as string);
  if (!date || Number.isNaN(d.getTime())) return '';
  return fnsFormat(d, pattern, { locale: getLocale(locale) });
}

// -----------------------------------------------------------------------
// Preset helpers (most common use-cases)
// -----------------------------------------------------------------------

/** "08/02/2026" */
export function formatShortDate(date: Date, locale?: string): string {
  return formatDate(date, 'dd/MM/yyyy', locale);
}

/** "08 fev 2026" or "08 Feb 2026" */
export function formatMediumDate(date: Date, locale?: string): string {
  return formatDate(date, 'dd MMM yyyy', locale);
}

/** "8 de fevereiro de 2026" or "8 February 2026" */
export function formatLongDate(date: Date, locale?: string): string {
  return formatDate(date, 'PPP', locale);
}

/** "14:30" */
export function formatTime(date: Date, locale?: string): string {
  return formatDate(date, 'HH:mm', locale);
}

/** "08/02/2026 14:30" */
export function formatDateTime(date: Date, locale?: string): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm', locale);
}

// -----------------------------------------------------------------------
// Relative / human-readable helpers
// -----------------------------------------------------------------------

/**
 * "há 3 dias" / "3 days ago"
 */
export function formatDistanceToNow(date: Date, locale?: string): string {
  return formatDistance(date, new Date(), {
    addSuffix: true,
    locale: getLocale(locale),
  });
}

/**
 * "ontem às 14:30" / "yesterday at 14:30"
 */
export function formatRelativeDate(date: Date, locale?: string): string {
  return formatRelative(date, new Date(), { locale: getLocale(locale) });
}

/**
 * Smart format: "Hoje 14:30" / "Ontem 14:30" / "08/02/2026"
 */
export function formatSmartDate(date: Date, locale?: string): string {
  const loc = getLocale(locale);
  const time = fnsFormat(date, 'HH:mm', { locale: loc });

  if (isToday(date)) {
    return `${loc === ptBR ? 'Hoje' : 'Today'} ${time}`;
  }
  if (isYesterday(date)) {
    return `${loc === ptBR ? 'Ontem' : 'Yesterday'} ${time}`;
  }
  return fnsFormat(date, 'dd/MM/yyyy', { locale: loc });
}

export function formatDateWithDay(date: Date): string {
  const loc = getLocale();
  const dateFormat = formatDate(date, 'dd/MM/yyyy');
  let whenDay = formatDate(date, 'EEEE', loc.code);

  if (isToday(date)) {
    whenDay = loc === ptBR ? 'Hoje' : 'Today';
  }
  if (isYesterday(date)) {
    whenDay = loc === ptBR ? 'Ontem' : 'Yesterday';
  }

  return `${whenDay} ${dateFormat}`;
}
