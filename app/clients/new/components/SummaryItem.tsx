import { Icon, IconName } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

const SummaryItem = ({ icon, label, value }: { icon?: string, label: string, value: any }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {icon && (
        <Icon name={icon as IconName} size={22} color={colors.icon} />
      )}
      <View>
        <Typography variant="body1Medium" color='placeholder'>
          {label}
        </Typography>
        <View style={styles.valueRow}>
          {
            typeof value === 'string' ? (
              <Typography variant="h6Medium" color='text'>
                {value}
              </Typography>
            ) : (
              value
            )
          }
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default SummaryItem;
