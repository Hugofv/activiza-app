import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { IconName } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import CardOperation from './CardOperation';

interface OperationData {
   icon: IconName;
   count: number;
   label: string;
}

interface FinancialSummaryProps {
   receivedAmount: number;
   totalExpected: number;
   operations: OperationData[];
}

export function FinancialSummary({
   receivedAmount,
   totalExpected,
   operations,
}: FinancialSummaryProps) {
   const { t } = useTranslation();
   const colorScheme = useColorScheme();
   const colors = Colors[colorScheme ?? 'light'];

   const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
         style: 'currency',
         currency: 'BRL',
      }).format(value);
   };

   return (
      <View style={styles.summarySection}>
         {/* Received This Month Card */}
         <View style={styles.receivedCard}>
            <Typography variant="caption" style={{ color: colors.icon, marginBottom: 4 }}>
               {t('home.receivedThisMonth')}
            </Typography>
            <Typography variant="h2" style={{ color: '#064e3b', marginBottom: 4 }}>
               {formatCurrency(receivedAmount)}
            </Typography>
            <Typography variant="caption" style={{ color: colors.icon }}>
               {t('home.of')} {formatCurrency(totalExpected)}
            </Typography>
         </View>

         {/* Summary Cards Row */}
         <View style={styles.summaryCardsRow}>
            {operations.map((operation, index) => (
               <CardOperation key={index} icon={operation.icon} count={operation.count} label={operation.label} index={index} />
            ))}
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   summarySection: {
      padding: 5,
      marginBottom: 32,
   },
   receivedCard: {
      marginBottom: 16,
   },
   summaryCardsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
   },
   summaryCard: {
      flex: 1,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
   },
});
