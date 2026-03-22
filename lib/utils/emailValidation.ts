import * as yup from 'yup';

const emailShapeSchema = yup.string().email();

/**
 * Returns true when value is a non-empty string that passes Yup's email rule.
 */
export function isValidEmailString(value: string): boolean {
  try {
    emailShapeSchema.validateSync(value);
    return true;
  } catch {
    return false;
  }
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
