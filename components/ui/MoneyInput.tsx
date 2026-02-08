import * as React from 'react';

import { Control, FieldPath } from 'react-hook-form';

import { Input, type InputProps } from './Input';

/** Supported currency codes */
export type CurrencyCode = 'BRL' | 'USD' | 'GBP' | 'EUR';

interface CurrencyConfig {
  symbol: string;
  thousandSeparator: string;
  decimalSeparator: string;
}

const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  BRL: {
    symbol: 'R$',
    thousandSeparator: '.',
    decimalSeparator: ',',
  },
  USD: {
    symbol: '$',
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  GBP: {
    symbol: '£',
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    symbol: '€',
    thousandSeparator: '.',
    decimalSeparator: ',',
  },
};

/**
 * Formats a raw digit string (cents) into a currency display string.
 * e.g. "123456" with BRL -> "1.234,56"
 */
function formatMoney(rawDigits: string, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIG[currency];

  // Remove leading zeros but keep at least one digit
  const cleaned = rawDigits.replace(/^0+/, '') || '0';

  // Pad to at least 3 digits so we always have 2 decimal places
  const padded = cleaned.padStart(3, '0');

  const integerPart = padded.slice(0, -2);
  const decimalPart = padded.slice(-2);

  // Add thousand separators
  const withThousands = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    config.thousandSeparator
  );

  return `${withThousands}${config.decimalSeparator}${decimalPart}`;
}

/**
 * Extracts the numeric value (as a float) from a formatted money string.
 */
export function parseMoneyValue(
  formattedValue: string,
  currency: CurrencyCode
): number {
  const config = CURRENCY_CONFIG[currency];
  const digits = formattedValue.replace(/[^\d]/g, '');
  if (!digits) return 0;

  const cleaned = digits.replace(/^0+/, '') || '0';
  const padded = cleaned.padStart(3, '0');
  const integerPart = padded.slice(0, -2);
  const decimalPart = padded.slice(-2);

  return parseFloat(`${integerPart}.${decimalPart}`);
}

/**
 * Returns the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_CONFIG[currency]?.symbol ?? '';
}

export interface MoneyInputProps extends Omit<
  InputProps,
  'onFormat' | 'keyboardType' | 'value' | 'onChangeText'
> {
  /** Currency code that determines formatting (default: 'BRL') */
  currency?: CurrencyCode;
  /** RHF control (required for form usage) */
  control?: Control<any>;
  /** RHF field name (required for form usage) */
  name?: FieldPath<any>;
  /** Standalone value */
  value?: string;
  /** Standalone change handler */
  onChangeText?: (text: string) => void;
}

/**
 * Money input with automatic currency masking.
 * Works with react-hook-form or as a standalone controlled input.
 *
 * The stored value is the formatted display string (e.g. "1.234,56").
 * Use `parseMoneyValue()` to extract the numeric value.
 */
export const MoneyInput = React.forwardRef<any, MoneyInputProps>(
  ({ currency = 'BRL', ...props }, ref) => {
    const moneyFormatter = React.useCallback(
      (text: string): string => {
        // Strip everything except digits
        const digits = text.replace(/[^\d]/g, '');
        if (!digits) return '';
        return formatMoney(digits, currency);
      },
      [currency]
    );

    return (
      <Input
        ref={ref}
        keyboardType="number-pad"
        onFormat={moneyFormatter}
        {...props}
      />
    );
  }
);

MoneyInput.displayName = 'MoneyInput';
