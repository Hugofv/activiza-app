import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FinancialSummary } from '@/components/home/FinancialSummary';
import { Header } from '@/components/home/Header';
import { OverdueAlert } from '@/components/home/OverdueAlert';
import { ReportCard } from '@/components/home/ReportCard';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isChecking, redirectToLogin } = useAuthGuard();

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      console.log('[HomeScreen] User not authenticated, calling redirectToLogin("home")');
      redirectToLogin('home');
    }
  }, [isAuthenticated, isChecking, redirectToLogin]);

  if (isChecking) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mock data - replace with real data from API
  const receivedThisMonth = 8113.12;
  const totalExpected = 19954.98;
  const loansCount = 12;
  const roomRentalsCount = 2;
  const vehicleRentalsCount = 1;
  const overduePaymentsCount = 6;
  const loansTotal = 21200.10;
  const rentalsTotal = 5108.00;
  const operationsCount = 16;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const operations = [
    { icon: 'person' as const, count: loansCount, label: t('home.loans') },
    { icon: 'home' as const, count: roomRentalsCount, label: t('home.roomRentals') },
    { icon: 'car' as const, count: vehicleRentalsCount, label: t('home.vehicleRentals') },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <Header
        onProfilePress={() => {
          router.push('/profile');
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FinancialSummary
          receivedAmount={receivedThisMonth}
          totalExpected={totalExpected}
          operations={operations}
        />

        <OverdueAlert
          count={overduePaymentsCount}
          onPress={() => {/* Navigate to overdue screen */}}
        />

        {/* Reports Section */}
        <View style={styles.reportsSection}>
          <Typography variant="h5" style={{ color: colors.icon, marginBottom: 16 }}>
            {t('home.reports')}
          </Typography>

          <View style={styles.primaryReportsRow}>
            <ReportCard
              title={formatCurrency(loansTotal)}
              subtitle={`${loansCount} ${t('home.loans').toLowerCase()}`}
              description={t('home.inLoans')}
            />
            <ReportCard
              title={formatCurrency(rentalsTotal)}
              subtitle={`${roomRentalsCount + vehicleRentalsCount} ${t('home.roomRentals').toLowerCase().split(' ')[0]}`}
              description={t('home.inRentals')}
            />
          </View>

          <View style={styles.secondaryReportsRow}>
            <ReportCard
              title={operationsCount.toString()}
              description={t('home.operations')}
            />
            <ReportCard
              title="34"
              description=""
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  reportsSection: {
    marginBottom: 24,
  },
  primaryReportsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  secondaryReportsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
