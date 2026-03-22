import { isValidPhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

/** Matches `PhoneInput` defaultCountry when país ainda não foi escolhido no picker */
const FALLBACK_COUNTRY: CountryCode = 'BR';

export type PhoneLikeValue = {
  country?: string | null;
  countryCode?: string;
  phoneNumber?: string;
  formattedPhoneNumber?: string;
} | null;

/**
 * True only when the number is a valid full national/international phone for the selected country.
 * Use to block "continue" until the user finished typing a valid number.
 */
export function isPhoneInputValueComplete(
  value: PhoneLikeValue | undefined
): boolean {
  if (!value) return false;

  const national = String(value.phoneNumber ?? '').replace(/\D/g, '');
  if (!national.length) return false;

  const compact = String(value.formattedPhoneNumber ?? '').replace(/\s/g, '');
  if (compact.startsWith('+')) {
    if (isValidPhoneNumber(compact)) return true;
  }

  const country = (value.country || FALLBACK_COUNTRY) as CountryCode;
  return isValidPhoneNumber(national, country);
}
