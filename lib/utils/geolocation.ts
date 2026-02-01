/**
 * Utility functions for geolocation and country detection
 */
import * as Localization from 'expo-localization';

import type { CountryCode } from '../services/postalCodeService';

/**
 * Detect country code from device locale
 * Falls back to 'BR' if detection fails
 */
export function detectCountryFromLocale(): CountryCode {
  try {
    const locales = Localization.getLocales();
    const locale = locales[0];

    if (!locale) {
      return 'BR'; // Default fallback
    }

    // Try regionCode first (more reliable)
    if (locale.regionCode) {
      const countryMap: Record<string, CountryCode> = {
        BR: 'BR',
        US: 'US',
        GB: 'UK',
      };
      const mapped = countryMap[locale.regionCode];
      if (mapped) return mapped;
    }

    // Fallback: extract from locale string (e.g., 'pt-BR' -> 'BR', 'en-US' -> 'US')
    const localeString = locale.languageTag || locale.languageCode;
    if (localeString) {
      const parts = localeString.split('-');
      const countryCode = parts[parts.length - 1]?.toUpperCase();

      const countryMap: Record<string, CountryCode> = {
        BR: 'BR',
        US: 'US',
        GB: 'UK',
        UK: 'UK',
      };

      return countryMap[countryCode] || 'BR';
    }

    return 'BR'; // Default fallback
  } catch (error) {
    console.error('Error detecting country from locale:', error);
    return 'BR'; // Default fallback
  }
}

/**
 * Get country code from device region
 * Uses expo-localization to get the region code
 */
export function getCountryFromRegion(): CountryCode {
  try {
    const locales = Localization.getLocales();
    const regionCode = locales[0]?.regionCode;

    if (!regionCode) {
      return 'BR'; // Default fallback
    }

    const countryMap: Record<string, CountryCode> = {
      BR: 'BR',
      US: 'US',
      GB: 'UK',
    };

    return countryMap[regionCode] || 'BR';
  } catch (error) {
    console.error('Error getting country from region:', error);
    return 'BR'; // Default fallback
  }
}
