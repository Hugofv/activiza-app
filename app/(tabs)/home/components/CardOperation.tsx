import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { Icon, IconName } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';

interface CardOperationProps {
  icon: IconName;
  count: number;
  label: string;
  index: number;
}

// import { Container } from './styles';

const CardOperation: React.FC<CardOperationProps> = ({ icon, count, label, index }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View key={index} style={[styles.summaryCard]}>
      <View style={styles.headerCard}>
        <Icon name={icon} size={24} color={colors.primaryForeground} />
        <Typography variant="body1" style={{ color: colors.placeholder }}>
          {count}
        </Typography>
      </View>
      <Typography variant="body2SemiBold" style={{ color: colors.primaryForeground }}>
        {label}
      </Typography>
    </View>
  )
}


const styles = StyleSheet.create({
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: Colors.light.muted,
    padding: 10,
    minHeight: 120,
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