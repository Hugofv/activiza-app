import type { Operation } from '@/lib/services/operationService';

/** Badge styles aligned with product design (solid background + light text). */
export function getLoanStatusPresentation(
  operation: Operation,
  t: (key: string) => string
): { label: string; bg: string; fg: string } {
  if (operation.status === 'COMPLETED') {
    return {
      label: t('operations.statusFinalized'),
      bg: '#14532D',
      fg: '#FFFFFF',
    };
  }

  if (operation.status === 'CANCELLED') {
    return {
      label: t('operations.statusCancelled'),
      bg: '#4B5563',
      fg: '#F9FAFB',
    };
  }

  const due = new Date(operation.dueDate);
  const overdue =
    operation.status === 'OVERDUE' ||
    (due < new Date() && operation.status === 'ACTIVE');

  if (overdue) {
    return {
      label: t('operations.statusOverdue'),
      bg: '#8F4F3C',
      fg: '#FAF5EF',
    };
  }

  return {
    label: t('operations.inProgress'),
    bg: '#1E3A8A',
    fg: '#FFFFFF',
  };
}
