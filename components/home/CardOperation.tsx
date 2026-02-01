import React from 'react';

import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardOperationProps {
  icon: IconName;
  count: number;
  label: string;
  index: number;
}

const CardOperation: React.FC<CardOperationProps> = ({
  icon,
  count,
  label,
  index,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      key={index}
      style={[styles.summaryCard, { backgroundColor: colors.muted }]}
    >
      <View style={styles.headerCard}>
        <Icon
          name={icon}
          size={24}
          color="primaryForeground"
        />
        <Typography
          variant="body1"
          color="placeholder"
        >
          {count}
        </Typography>
      </View>
      <Typography
        variant="body2SemiBold"
        style={{
 color: colors.primaryForeground,
textAlign: 'center' 
}}
      >
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 12,
    padding: 10,
    height: 120,
    marginLeft: 3,
    marginRight: 3,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
});

export default CardOperation;
