import React, { useMemo } from 'react';

import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Typography } from '@/components/ui/Typography';
import type { Operation } from '@/lib/services/operationService';
import { formatDate } from '@/lib/utils/dateFormat';

function getDetailStatusBadge(
  operation: Operation,
  t: (k: string) => string
): { label: string; bg: string; fg: string } {
  if (operation.status === 'COMPLETED') {
    return {
      label: t('operations.closed'),
      bg: '#DCFCE7',
      fg: '#166534',
    };
  }

  const due = new Date(operation.dueDate);
  const overdue =
    operation.status === 'OVERDUE' ||
    (due < new Date() && operation.status === 'ACTIVE');

  if (overdue) {
    return {
      label: formatDate(operation.dueDate, 'dd/MM/yyyy'),
      bg: '#FEE2E2',
      fg: '#991B1B',
    };
  }

  return {
    label: t('operations.inProgress'),
    bg: '#DBEAFE',
    fg: '#1E40AF',
  };
}

interface LoanStatusBadgeProps {
  operation: Operation;
}

export function LoanStatusBadge({ operation }: LoanStatusBadgeProps) {
  const { t } = useTranslation();
  const badge = useMemo(
    () => getDetailStatusBadge(operation, t),
    [operation, t]
  );

  return (
    <View style={[styles.pill, { backgroundColor: badge.bg }]}>
      <Typography
        variant="caption"
        style={{ color: badge.fg }}
      >
        {badge.label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
