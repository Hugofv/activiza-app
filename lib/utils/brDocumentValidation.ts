/**
 * Brazilian CPF/CNPJ check-digit validation (digits only, already normalized).
 */

function allSameDigit(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

function cpfCheckDigit(digits9: number[], factorStart: number): number {
  let sum = 0;
  for (let i = 0; i < digits9.length; i++) {
    sum += digits9[i]! * (factorStart - i);
  }
  const r = sum % 11;
  return r < 2 ? 0 : 11 - r;
}

/**
 * @param normalized11 — 11 numeric characters only
 */
export function isValidCPFDigits(normalized11: string): boolean {
  if (normalized11.length !== 11 || !/^\d{11}$/.test(normalized11)) {
    return false;
  }
  if (allSameDigit(normalized11)) return false;

  const nums = [...normalized11].map((c) => c.charCodeAt(0) - 48);
  const d9 = cpfCheckDigit(nums.slice(0, 9), 10);
  if (d9 !== nums[9]) return false;
  const d10 = cpfCheckDigit(nums.slice(0, 10), 11);
  return d10 === nums[10];
}

const CNPJ_WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const CNPJ_WEIGHTS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

function cnpjVerifierDigit(digits: number[], weights: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += digits[i]! * weights[i]!;
  }
  const r = sum % 11;
  return r < 2 ? 0 : 11 - r;
}

/**
 * @param normalized14 — 14 numeric characters only
 */
export function isValidCNPJDigits(normalized14: string): boolean {
  if (normalized14.length !== 14 || !/^\d{14}$/.test(normalized14)) {
    return false;
  }
  if (allSameDigit(normalized14)) return false;

  const nums = [...normalized14].map((c) => c.charCodeAt(0) - 48);
  const d1 = cnpjVerifierDigit(nums.slice(0, 12), CNPJ_WEIGHTS_1);
  if (d1 !== nums[12]) return false;
  const d2 = cnpjVerifierDigit(nums.slice(0, 13), CNPJ_WEIGHTS_2);
  return d2 === nums[13];
}
