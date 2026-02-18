import { useCallback, useEffect, useMemo } from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FinancialSummary } from '@/components/home/FinancialSummary';
import { Header } from '@/components/home/Header';
import { OverdueAlert } from '@/components/home/OverdueAlert';
import { ReportCard } from '@/components/home/ReportCard';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import {
  type DashboardData,
  type DashboardReportByType,
  getDashboard,
} from '@/lib/services/dashboardService';

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const ICON_MAP: Record<string, 'person' | 'home' | 'car' | 'cash'> = {
  LOAN: 'person',
  INSTALLMENTS: 'cash',
  RENT_PROPERTY: 'home',
  RENT_ROOM: 'home',
  RENT_VEHICLE: 'car',
};

const LABEL_MAP: Record<string, string> = {
  LOAN: 'home.loans',
  INSTALLMENTS: 'home.operations',
  RENT_PROPERTY: 'home.roomRentals',
  RENT_ROOM: 'home.roomRentals',
  RENT_VEHICLE: 'home.vehicleRentals',
};

function findReport(
  reports: DashboardReportByType[] | undefined,
  type: string
): DashboardReportByType | undefined {
  return reports?.find((r) => r.type === type);
}

// -----------------------------------------------------------------------
// Screen
// -----------------------------------------------------------------------

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isChecking, redirectToLogin } = useAuthGuard();

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      redirectToLogin('home');
    }
  }, [isAuthenticated, isChecking, redirectToLogin]);

  const {
    data: dashboard,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard', 'this_month'],
    queryFn: () => getDashboard({ period: 'this_month' }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value),
    []
  );

  const operations = useMemo(() => {
    if (!dashboard?.operationsByType) return [];
    return dashboard.operationsByType.map((op) => ({
      icon: ICON_MAP[op.type] ?? ('cash' as const),
      count: op.count ?? 0,
      label: t(LABEL_MAP[op.type] ?? 'home.operations'),
    }));
  }, [dashboard, t]);

  console.log('operations', dashboard?.operationsByType);
  const loanReport = findReport(dashboard?.reportsByType, 'LOAN');

  const rentalReport = useMemo(() => {
    if (!dashboard?.reportsByType) return { totalAmount: 0, count: 0 };
    const rentalTypes = ['RENT_PROPERTY', 'RENT_ROOM', 'RENT_VEHICLE'];
    return dashboard.reportsByType
      .filter((r) => rentalTypes.includes(r.type))
      .reduce(
        (acc, r) => ({
          totalAmount: acc.totalAmount + (r.totalAmount ?? 0),
          count: acc.count + (r.count ?? 0),
        }),
        { totalAmount: 0, count: 0 }
      );
  }, [dashboard]);

  if (isChecking) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.centeredContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <FinancialSummary
          receivedAmount={dashboard?.received ?? 0}
          totalExpected={dashboard?.expected ?? 0}
          operations={operations}
          loading={isLoading}
        />

        <OverdueAlert
          count={dashboard?.overdueCount ?? 0}
          onPress={() => {
            /* Navigate to overdue screen */
          }}
          loading={isLoading}
        />

        {/* Reports Section */}
        <View style={styles.reportsSection}>
          <Typography
            variant="h5"
            style={{
              color: colors.icon,
              marginBottom: 16,
            }}
            loading={isLoading}
            skeletonWidth={120}
          >
            {t('home.reports')}
          </Typography>

          <View style={styles.primaryReportsRow}>
            <ReportCard
              title={formatCurrency(loanReport?.totalAmount ?? 0)}
              subtitle={`${loanReport?.count ?? 0} ${t('home.loans').toLowerCase()}`}
              description={t('home.inLoans')}
              loading={isLoading}
            />
            <ReportCard
              title={formatCurrency(rentalReport.totalAmount)}
              subtitle={`${rentalReport.count} ${t('home.inRentals')}`}
              description={t('home.inRentals')}
              loading={isLoading}
            />
          </View>

          <View style={styles.secondaryReportsRow}>
            <ReportCard
              title={(dashboard?.totalOperations ?? 0).toString()}
              description={t('home.operations')}
              loading={isLoading}
            />
            <ReportCard
              title={(dashboard?.totalClients ?? 0).toString()}
              description={t('home.clients')}
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  reportsSection: { marginBottom: 24 },
  primaryReportsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  secondaryReportsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
