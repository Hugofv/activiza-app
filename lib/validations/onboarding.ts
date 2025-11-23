import i18n from '@/translation';
import * as yup from 'yup';

// CPF validation helper
const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11) return false;

  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Validate CPF algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;

  return true;
};

// CNPJ validation helper
const validateCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');
  if (numbers.length !== 14) return false;

  // Check for known invalid CNPJs
  if (/^(\d)\1{13}$/.test(numbers)) return false;

  // Validate CNPJ algorithm
  let length = numbers.length - 2;
  let digits = numbers.substring(0, length);
  const checkDigits = numbers.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(digits.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checkDigits.charAt(0))) return false;

  length = length + 1;
  digits = numbers.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(digits.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checkDigits.charAt(1))) return false;

  return true;
};

// Helper function to get translated error message
// Returns a function so translation is resolved at validation time, not schema definition time
const t = (key: string): (() => string) => {
  return () => i18n.t(`common.validation.${key}`) || key;
};

// Document (CPF or CNPJ) schema
export const documentSchema = yup.object().shape({
  document: yup
    .string()
    .required(t('documentRequired'))
    .test('document-format', t('documentFormat'), (value) => {
      if (!value) return false;
      const numbers = value.replace(/\D/g, '');
      return numbers.length === 11 || numbers.length === 14;
    })
    .test('document-valid', t('documentInvalid'), (value) => {
      if (!value) return false;
      const numbers = value.replace(/\D/g, '');
      if (numbers.length === 11) {
        return validateCPF(value);
      } else if (numbers.length === 14) {
        return validateCNPJ(value);
      }
      return false;
    }),
});

// Name schema
export const nameSchema = yup.object().shape({
  name: yup
    .string()
    .required(t('nameRequired'))
    .min(3, t('nameMin'))
    .max(100, t('nameMax'))
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, t('nameLettersOnly')),
});

// Phone schema
export const phoneSchema = yup.object().shape({
  phone: yup
    .object({
      country: yup.string().nullable().optional(),
      countryCode: yup.string().required(),
      phoneNumber: yup.string().required(),
      formattedPhoneNumber: yup.string().required(),
    })
    .nullable()
    .required(t('phoneRequired'))
    .test('phone-valid', t('phoneInvalid'), (value) => {
      if (!value) return false;
      return !!value.phoneNumber && value.phoneNumber.length >= 8;
    }),
});

// Email schema
export const emailSchema = yup.object().shape({
  email: yup
    .string()
    .required(t('emailRequired'))
    .email(t('emailInvalid'))
    .max(100, t('emailMax')),
});

// Code schema
export const codeSchema = yup.object().shape({
  code: yup
    .string()
    .required(t('codeRequired'))
    .length(6, t('codeLength'))
    .matches(/^\d+$/, t('codeNumeric')),
});

// Postal code schema factory - creates validation based on country
export const createPostalCodeSchema = (countryCode?: string) => {
  return yup.object().shape({
    postalCode: yup
      .string()
      .required(t('postalCodeRequired'))
      .test('postal-code-format', t('postalCodeInvalid'), (value) => {
        if (!value) return false;
        
        switch (countryCode) {
          case 'BR':
            // Brazil CEP: 8 digits (00000-000)
            const brNumbers = value.replace(/\D/g, '');
            return brNumbers.length === 8;
          
          case 'US':
            // USA ZIP: 5 or 9 digits (12345 or 12345-6789)
            const usNumbers = value.replace(/\D/g, '');
            return usNumbers.length === 5 || usNumbers.length === 9;
          
          case 'UK':
            // UK postcode: AA9A 9AA format (alphanumeric with space)
            // Examples: SW1A 1AA, M1 1AA, B33 8TH, SE26 5LN, EC1A 1BB
            const ukCleaned = value.replace(/\s/g, '').toUpperCase();
            // UK postcode regex: 
            // Outward code: 1-2 letters + 1-2 numbers/letters (2-4 chars total)
            // Inward code: 1 number + 2 letters (3 chars)
            // Total: 5-7 characters without space
            const ukPattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\d[A-Z]{2}$/i;
            return ukCleaned.length >= 5 && ukCleaned.length <= 7 && ukPattern.test(ukCleaned);
          
          default:
            // Default: at least 3 characters
            return value.length >= 3;
        }
      }),
  });
};

// Default postal code schema (Brazil format for backward compatibility)
export const postalCodeSchema = createPostalCodeSchema('BR');

// Address schema
export const addressSchema = yup.object().shape({
  postalCode: yup.string().required(t('postalCodeRequired')),
  street: yup.string().required(t('streetRequired')),
  neighborhood: yup.string().required(t('neighborhoodRequired')),
  city: yup.string().required(t('cityRequired')),
  state: yup.string().required(t('stateRequired')),
  country: yup.string().required(t('countryRequired')),
  number: yup.string().required(t('numberRequired')),
  complement: yup.string().optional(),
});

// Combined onboarding schema
export const onboardingSchema = yup.object().shape({
  document: yup
    .string()
    .required(t('documentRequired'))
    .test('document-format', t('documentFormat'), (value) => {
      if (!value) return false;
      const numbers = value.replace(/\D/g, '');
      return numbers.length === 11 || numbers.length === 14;
    })
    .test('document-valid', t('documentInvalid'), (value) => {
      if (!value) return false;
      const numbers = value.replace(/\D/g, '');
      if (numbers.length === 11) {
        return validateCPF(value);
      } else if (numbers.length === 14) {
        return validateCNPJ(value);
      }
      return false;
    }),
  name: yup
    .string()
    .required(t('nameRequired'))
    .min(3, t('nameMin'))
    .max(100, t('nameMax'))
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, t('nameLettersOnly')),
  phone: yup
    .object({
      country: yup.string().nullable(),
      countryCode: yup.string().required(),
      phoneNumber: yup.string().required(),
      formattedPhoneNumber: yup.string().required(),
    })
    .nullable()
    .required(t('phoneRequired'))
    .test('phone-valid', t('phoneInvalid'), (value) => {
      if (!value) return false;
      return !!value.phoneNumber && value.phoneNumber.length >= 8;
    }),
  email: yup
    .string()
    .required(t('emailRequired'))
    .email(t('emailInvalid'))
    .max(100, t('emailMax')),
});

