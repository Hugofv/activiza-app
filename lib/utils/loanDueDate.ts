/** Matches `FrequencyType` in operations context (lowercase). */
export type LoanFormFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly';

/**
 * First due / next settlement date: loan start plus one period of the contract frequency.
 */
export function dueDateFromLoanStart(
  start: Date,
  frequency: LoanFormFrequency
): Date {
  const d = new Date(start.getTime());
  d.setHours(0, 0, 0, 0);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    default:
      d.setDate(d.getDate() + 7);
  }
  return d;
}
