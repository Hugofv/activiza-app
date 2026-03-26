/**
 * Like the HTML living-standard regex, but the domain must include at least one dot
 * (e.g. user@example.com). Yup/HTML allow single-label hosts like "a@b", which are not
 * valid for typical registration / login identifiers.
 */
const REGISTRATION_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isValidRegistrationEmailShape(value: string): boolean {
  const v = value.trim();
  if (!REGISTRATION_EMAIL_REGEX.test(v)) return false;
  const at = v.indexOf('@');
  if (at <= 0) return false;
  const local = v.slice(0, at);
  const domain = v.slice(at + 1);
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return false;
  }
  if (
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.includes('..')
  ) {
    return false;
  }
  // TLD at least 2 chars (e.g. reject user@x.c if you want 2+ — common minimum)
  const lastDot = domain.lastIndexOf('.');
  const tld = domain.slice(lastDot + 1);
  return tld.length >= 2;
}

/**
 * Returns true when value is a non-empty string that is a plausible registration email
 * (domain with dot + TLD length ≥ 2).
 */
export function isValidEmailString(value: string): boolean {
  if (value == null || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  return isValidRegistrationEmailShape(trimmed);
}

/**
 * Optional email: empty / whitespace-only is valid; any non-empty value must be a valid email.
 */
export function isValidEmailWhenPresent(value: string | undefined | null): boolean {
  if (value == null) return true;
  const trimmed = String(value).trim();
  if (trimmed.length === 0) return true;
  return isValidEmailString(trimmed);
}
