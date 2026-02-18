import React from 'react';

import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardOperationProps {
  icon: IconName;
  count: number;
  label: string;
  index: number;
  loading?: boolean;
}

const CardOperation: React.FC<CardOperationProps> = ({
  icon,
  count,
  label,
  index,
  loading,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      key={index}
      style={[styles.summaryCard, { backgroundColor: colors.muted }]}
    >
      <View style={styles.headerCard}>
        {loading ? (
          <Skeleton
            width={24}
            height={24}
            borderRadius={12}
          />
        ) : (
          <Icon
            name={icon}
            size={24}
            color="primaryForeground"
          />
        )}
        <Typography
          variant="body1"
          color="placeholder"
          loading={loading}
          skeletonWidth={28}
        >
          {count}
        </Typography>
      </View>
      <Typography
        variant="body2SemiBold"
        style={{
          color: colors.primaryForeground,
          textAlign: 'center',
        }}
        loading={loading}
        skeletonWidth="80%"
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
