/**
 * Document service - simplified formatting based on country and type
 * Validation algorithms (CPF/CNPJ, etc) are handled by the backend
 */

import type { CountryCode } from './postalCodeService';

export type DocumentType = 'cpf' | 'cnpj' | 'ssn' | 'ein' | 'ni' | 'crn' | 'other';

export interface DocumentFormatConfig {
  mask: string;
  placeholder: string;
  maxLength: number;
  format: (value: string) => string;
  normalize: (value: string) => string;
  minLength?: number;
}

/**
 * Get document format configuration based on country and type
 */
export function getDocumentFormat(
  countryCode: CountryCode,
  documentType?: DocumentType
): DocumentFormatConfig {
  switch (countryCode) {
    case 'BR':
      if (documentType === 'cpf') {
        return {
          mask: '000.000.000-00',
          placeholder: '000.000.000-00',
          maxLength: 14,
          minLength: 11,
          format: (value: string) => {
            const numbers = value.replace(/\D/g, '').slice(0, 11);
            if (numbers.length <= 3) return numbers;
            if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
            if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
            return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
          },
          normalize: (value: string) => value.replace(/\D/g, '').slice(0, 11),
        };
      } else if (documentType === 'cnpj') {
        return {
          mask: '00.000.000/0000-00',
          placeholder: '00.000.000/0000-00',
          maxLength: 18,
          minLength: 14,
          format: (value: string) => {
            const numbers = value.replace(/\D/g, '').slice(0, 14);
            if (numbers.length <= 2) return numbers;
            if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
            if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
            if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
            return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
          },
          normalize: (value: string) => value.replace(/\D/g, '').slice(0, 14),
        };
      }
      // Default BR: aceita CPF ou CNPJ (formata como CPF até 11, depois CNPJ)
      return {
        mask: '000.000.000-00',
        placeholder: 'CPF ou CNPJ',
        maxLength: 18,
        format: (value: string) => {
          const numbers = value.replace(/\D/g, '');
          if (numbers.length <= 11) {
            // Formata como CPF
            const limited = numbers.slice(0, 11);
            if (limited.length <= 3) return limited;
            if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
            if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
            return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
          } else {
            // Formata como CNPJ
            const limited = numbers.slice(0, 14);
            if (limited.length <= 2) return limited;
            if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
            if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
            if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
            return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
          }
        },
        normalize: (value: string) => value.replace(/\D/g, ''),
      };

    case 'US':
      if (documentType === 'ssn') {
        return {
          mask: '000-00-0000',
          placeholder: '123-45-6789',
          maxLength: 11,
          minLength: 9,
          format: (value: string) => {
            const numbers = value.replace(/\D/g, '').slice(0, 9);
            if (numbers.length <= 3) return numbers;
            if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
          },
          normalize: (value: string) => value.replace(/\D/g, '').slice(0, 9),
        };
      } else if (documentType === 'ein') {
        return {
          mask: '00-0000000',
          placeholder: '12-3456789',
          maxLength: 10,
          minLength: 9,
          format: (value: string) => {
            const numbers = value.replace(/\D/g, '').slice(0, 9);
            if (numbers.length <= 2) return numbers;
            return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
          },
          normalize: (value: string) => value.replace(/\D/g, '').slice(0, 9),
        };
      }
      // Default US: aceita SSN ou EIN
      return {
        mask: '000-00-0000',
        placeholder: 'SSN ou EIN',
        maxLength: 11,
        format: (value: string) => {
          const numbers = value.replace(/\D/g, '').slice(0, 9);
          if (numbers.length <= 3) return numbers;
          if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
          return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
        },
        normalize: (value: string) => value.replace(/\D/g, '').slice(0, 9),
      };

    case 'UK':
      if (documentType === 'ni') {
        return {
          mask: 'AA000000A',
          placeholder: 'AB123456C',
          maxLength: 9,
          minLength: 9,
          format: (value: string) => {
            // UK NI: 2 letters + 6 numbers + 1 letter
            const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 9);
            return cleaned;
          },
          normalize: (value: string) => value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 9),
        };
      } else if (documentType === 'crn') {
        return {
          mask: '00000000',
          placeholder: '12345678',
          maxLength: 8,
          minLength: 8,
          format: (value: string) => value.replace(/\D/g, '').slice(0, 8),
          normalize: (value: string) => value.replace(/\D/g, '').slice(0, 8),
        };
      }
      // Default UK: aceita alfanumérico
      return {
        mask: 'AA000000A',
        placeholder: 'NI Number ou CRN',
        maxLength: 10,
        format: (value: string) => value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 10),
        normalize: (value: string) => value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 10),
      };

    default:
      // Outros países: formato genérico
      return {
        mask: '0000000000',
        placeholder: 'Document number',
        maxLength: 30,
        format: (value: string) => value.slice(0, 30),
        normalize: (value: string) => value.replace(/\D/g, '').slice(0, 30),
      };
  }
}

/**
 * Normalize document value (remove formatting)
 */
export function normalizeDocument(value: string, countryCode: CountryCode, documentType?: DocumentType): string {
  const config = getDocumentFormat(countryCode, documentType);
  return config.normalize(value);
}

/**
 * Format document value for display
 */
export function formatDocument(value: string, countryCode: CountryCode, documentType?: DocumentType): string {
  const config = getDocumentFormat(countryCode, documentType);
  return config.format(value);
}

/**
 * Get available document types for a country
 */
export function getDocumentTypesForCountry(countryCode: CountryCode): { value: DocumentType; label: string; labelKey: string }[] {
  switch (countryCode) {
    case 'BR':
      return [
        { value: 'cpf', label: 'CPF', labelKey: 'documentTypeCPF' },
        { value: 'cnpj', label: 'CNPJ', labelKey: 'documentTypeCNPJ' },
      ];
    case 'US':
      return [
        { value: 'ssn', label: 'SSN', labelKey: 'documentTypeSSN' },
        { value: 'ein', label: 'EIN', labelKey: 'documentTypeEIN' },
      ];
    case 'UK':
      return [
        { value: 'ni', label: 'NI Number', labelKey: 'documentTypeNI' },
        { value: 'crn', label: 'CRN', labelKey: 'documentTypeCRN' },
      ];
    default:
      return [
        { value: 'other', label: 'Other', labelKey: 'documentTypeOther' },
      ];
  }
}

/**
 * Detect document type based on value and country code
 * Returns the detected type or null if cannot be determined
 */
export function detectDocumentType(value: string, countryCode: CountryCode): DocumentType | null {
  if (!value) return null;

  const normalized = value.replace(/\D/g, '');
  const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  switch (countryCode) {
    case 'BR':
      // CPF: 11 digits, CNPJ: 14 digits
      if (normalized.length === 11) {
        return 'cpf';
      } else if (normalized.length === 14) {
        return 'cnpj';
      }
      return null;

    case 'US':
      // SSN: 9 digits, EIN: 9 digits (hard to distinguish, but usually SSN is more common)
      if (normalized.length === 9) {
        // Default to SSN, user can change if needed
        return 'ssn';
      }
      return null;

    case 'UK':
      // NI Number: 2 letters + 6 numbers + 1 letter = 9 chars alphanumeric
      // CRN: 8 digits
      if (/^[A-Z]{2}\d{6}[A-Z]$/.test(cleaned)) {
        return 'ni';
      } else if (normalized.length === 8) {
        return 'crn';
      }
      return null;

    default:
      return null;
  }
}

/**
 * Get document mask configuration (wrapper for getDocumentFormat for compatibility)
 * Returns mask, placeholder, and maxLength
 */
export function getDocumentMask(countryCode: CountryCode, documentType?: DocumentType): { mask: string; placeholder: string; maxLength: number } {
  const config = getDocumentFormat(countryCode, documentType);
  return {
    mask: config.mask,
    placeholder: config.placeholder,
    maxLength: config.maxLength,
  };
}
