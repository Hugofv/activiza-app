import i18n from '@/translation';
import * as yup from 'yup';

// Helper function to get translated error message
// Returns a function so translation is resolved at validation time, not schema definition time
const t = (key: string): (() => string) => {
  return () => i18n.t(`common.validation.${key}`) || key;
};

// Document schema simplificado (validação mínima baseada em país e tipo)
// Validação de algoritmo (CPF/CNPJ, etc) fica no backend
export const createDocumentSchema = (countryCode?: string, documentType?: string) => {
  return yup.object().shape({
    document: yup
      .string()
      .optional() // Documento agora é opcional
      .test('document-format', t('documentFormat'), (value) => {
        // Se não fornecido, é válido (opcional)
        if (!value) return true;
        
        const normalized = value.replace(/\D/g, '');
        
        // Validação mínima baseada no país e tipo
        switch (countryCode) {
          case 'BR':
            if (documentType === 'cpf') {
              return normalized.length === 11;
            } else if (documentType === 'cnpj') {
              return normalized.length === 14;
            }
            // Se tipo não especificado, aceita CPF ou CNPJ
            return normalized.length === 11 || normalized.length === 14;
          
          case 'US':
            if (documentType === 'ssn' || documentType === 'ein') {
              return normalized.length === 9;
            }
            return normalized.length >= 9 && normalized.length <= 10;
          
          case 'UK':
            // UK NI Number: formato alfanumérico 2 letras + 6 números + 1 letra
            // Conforme especificado no plano: /^[A-Z]{2}\d{6}[A-Z]$/
            if (documentType === 'ni') {
              const cleaned = value.replace(/\s/g, '').toUpperCase();
              return /^[A-Z]{2}\d{6}[A-Z]$/.test(cleaned);
            } else if (documentType === 'crn') {
              // UK Company Number: 8 digits
              return normalized.length === 8;
            }
            // Para UK sem tipo específico, aceita formato NI Number ou qualquer alfanumérico
            const cleaned = value.replace(/\s/g, '').toUpperCase();
            if (/^[A-Z]{2}\d{6}[A-Z]$/.test(cleaned)) {
              return true; // Formato NI Number válido
            }
            // Aceita qualquer formato alfanumérico com pelo menos 5 caracteres
            return value.replace(/[^A-Z0-9]/gi, '').length >= 5 && value.replace(/[^A-Z0-9]/gi, '').length <= 10;
          
          default:
            // Para outros países, aceita qualquer formato com pelo menos 5 caracteres
            return value.length >= 5 && value.length <= 30;
        }
      }),
    documentType: yup
      .string()
      .optional()
      .oneOf(['cpf', 'cnpj', 'ssn', 'ein', 'ni', 'crn', 'other'], t('documentTypeInvalid')),
  });
};

// Schema padrão (retrocompatibilidade)
export const documentSchema = createDocumentSchema('BR');

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

// Password schema
export const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required(t('passwordRequired'))
    .min(8, t('passwordMin'))
    .max(100, t('passwordMax'))
    .matches(/[A-Z]/, t('passwordUppercase'))
    .matches(/[a-z]/, t('passwordLowercase'))
    .matches(/[0-9]/, t('passwordNumber'))
    .matches(/[^A-Za-z0-9]/, t('passwordSpecial')),
  confirmPassword: yup
    .string()
    .required(t('confirmPasswordRequired'))
    .oneOf([yup.ref('password')], t('passwordMismatch'))
    .test('match', t('passwordMismatch'), function(value) {
      return value === this.parent.password;
    }),
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
  // Email é obrigatório (identificador primário)
  email: yup
    .string()
    .required(t('emailRequired'))
    .email(t('emailInvalid'))
    .max(100, t('emailMax')),
  
  // Documento é opcional (informação de identificação)
  document: yup.string().optional(),
  documentType: yup.string().optional(),
  
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
});

