import { StyleSheet, TouchableOpacity } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';

interface OverdueAlertProps {
  count: number;
  onPress?: () => void;
}

export function OverdueAlert({ count, onPress }: OverdueAlertProps) {
  const { t } = useTranslation();

  if (count === 0) return null;

  return (
    <TouchableOpacity
      style={[styles.overdueAlert, { backgroundColor: '#FFF4E6' }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Icon
        name="information-circle"
        size={20}
        color="warning"
      />
      <Typography
        variant="body2"
        color="warning"
        style={{
          marginLeft: 8,
          flex: 1,
        }}
      >
        {count} {t('home.overduePayments')}
      </Typography>
      <Icon
        name="chevron-forward"
        size={20}
        color="warning"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
});
