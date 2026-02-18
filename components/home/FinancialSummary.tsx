import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { IconName } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import CardOperation from './CardOperation';

const { width: screenWidth } = Dimensions.get('window');

interface OperationData {
  icon: IconName;
  count: number;
  label: string;
}

interface FinancialSummaryProps {
  receivedAmount: number;
  totalExpected: number;
  operations: OperationData[];
  loading?: boolean;
}

export function FinancialSummary({
  receivedAmount,
  totalExpected,
  operations,
  loading,
}: FinancialSummaryProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  return (
    <View style={styles.summarySection}>
      {/* Received This Month Card */}
      <View style={styles.receivedCard}>
        <Typography
          variant="caption"
          style={{
            color: colors.icon,
            marginBottom: 4,
          }}
          loading={loading}
          skeletonWidth={160}
        >
          {t('home.receivedThisMonth')}
        </Typography>
        <Typography
          variant="h3"
          style={{
            color: '#064e3b',
            marginBottom: 4,
          }}
          loading={loading}
          skeletonWidth={200}
        >
          {formatCurrency(receivedAmount)}
        </Typography>
        <Typography
          variant="h2Medium"
          style={{ color: colors.icon }}
          loading={loading}
          skeletonWidth={140}
        >
          {t('home.of')} {formatCurrency(totalExpected)}
        </Typography>
      </View>

      {/* Summary Cards Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carouselContainer}
        contentContainerStyle={styles.carouselContent}
        bounces={false}
        scrollEventThrottle={16}
      >
        {loading && operations.length === 0
          ? [0, 1, 2].map((i) => (
              <View
                key={i}
                style={styles.itemWrapper}
              >
                <CardOperation
                  icon="cash"
                  count={0}
                  label=""
                  index={i}
                  loading
                />
              </View>
            ))
          : operations.map((operation, index) => (
              <View
                key={index}
                style={styles.itemWrapper}
              >
                <CardOperation
                  icon={operation.icon}
                  count={operation.count}
                  label={operation.label}
                  index={index}
                  loading={loading}
                />
              </View>
            ))}
        {/* Spacer no final para criar padding */}
        <View style={styles.spacerItem} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  summarySection: {
    padding: 5,
    marginBottom: 10,
  },
  receivedCard: { marginBottom: 15 },
  carouselContainer: {
    marginBottom: 5,
    marginLeft: -5,
  },
  carouselContent: {
    paddingRight: 20, // Padding no final do scroll
  },
  itemWrapper: {
    width: screenWidth * 0.3,
    marginRight: 5,
  },
  spacerItem: {
    width: 10, // Apenas um espaçador pequeno no final
    height: 120,
  },
});
