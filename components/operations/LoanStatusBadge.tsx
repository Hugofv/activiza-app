import React, { useMemo } from 'react';

import { StyleSheet, View, ViewStyle } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Typography } from '@/components/ui/Typography';
import { getLoanStatusPresentation } from '@/lib/operations/loanStatusPresentation';
import type { Operation } from '@/lib/services/operationService';

interface LoanStatusBadgeProps {
  operation: Operation;
  style?: ViewStyle;
}

export function LoanStatusBadge({ operation, style }: LoanStatusBadgeProps) {
  const { t } = useTranslation();
  const badge = useMemo(
    () => getLoanStatusPresentation(operation, t),
    [operation, t]
  );

  return (
    <View style={[styles.pill, { backgroundColor: badge.bg }, style]}>
      <Typography
        variant="body2SemiBold"
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
