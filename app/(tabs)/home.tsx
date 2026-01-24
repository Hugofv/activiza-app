import { Image as ExpoImage } from 'expo-image';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isChecking, redirectToLogin } = useAuthGuard();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, isChecking, redirectToLogin]);

  // Show loading while checking authentication
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

  // Don't render content if not authenticated (will redirect)
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
  const otherCount = 34;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity style={styles.profileButton}>
          <ExpoImage
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.profileImage}
            contentFit="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.monthSelector, { backgroundColor: '#F3F7F5' }]}>
          <Typography variant="body2" style={{ color: colors.text }}>
            {t('home.thisMonth')}
          </Typography>
          <Icon name="chevron-down" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Summary Section */}
        <View style={[styles.summarySection]}>
          {/* Received This Month Card */}
          <View style={styles.receivedCard}>
            <Typography variant="caption" style={{ color: colors.icon, marginBottom: 4 }}>
              {t('home.receivedThisMonth')}
            </Typography>
            <Typography variant="h2" style={{ color: '#064e3b', marginBottom: 4 }}>
              {formatCurrency(receivedThisMonth)}
            </Typography>
            <Typography variant="caption" style={{ color: colors.icon }}>
              {t('home.of')} {formatCurrency(totalExpected)}
            </Typography>
          </View>

          {/* Summary Cards Row */}
          <View style={styles.summaryCardsRow}>
            <View style={[styles.summaryCard, { backgroundColor: '#F3F7F5' }]}>
              <Icon name="person" size={24} color={colors.primary} />
              <Typography variant="h3" style={{ color: colors.text, marginTop: 8 }}>
                {loansCount}
              </Typography>
              <Typography variant="caption" style={{ color: colors.icon, marginTop: 4 }}>
                {t('home.loans')}
              </Typography>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: '#F3F7F5' }]}>
              <Icon name="home" size={24} color={colors.primary} />
              <Typography variant="h3" style={{ color: colors.text, marginTop: 8 }}>
                {roomRentalsCount}
              </Typography>
              <Typography variant="caption" style={{ color: colors.icon, marginTop: 4 }}>
                {t('home.roomRentals')}
              </Typography>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: '#F3F7F5' }]}>
              <Icon name="car" size={24} color={colors.primary} />
              <Typography variant="h3" style={{ color: colors.text, marginTop: 8 }}>
                {vehicleRentalsCount}
              </Typography>
              <Typography variant="caption" style={{ color: colors.icon, marginTop: 4 }}>
                {t('home.vehicleRentals')}
              </Typography>
            </View>
          </View>

          {/* Overdue Payments Alert */}
          <TouchableOpacity 
            style={[styles.overdueAlert, { backgroundColor: '#FFF4E6' }]}
            activeOpacity={0.7}
          >
            <Icon name="information-circle" size={20} color="#F59E0B" />
            <Typography variant="body2" style={{ color: '#92400E', marginLeft: 8, flex: 1 }}>
              {overduePaymentsCount} {t('home.overduePayments')}
            </Typography>
            <Icon name="chevron-forward" size={20} color="#92400E" />
          </TouchableOpacity>
        </View>

        {/* Reports Section */}
        <View style={styles.reportsSection}>
          <Typography variant="h5" style={{ color: colors.icon, marginBottom: 16 }}>
            {t('home.reports')}
          </Typography>

          {/* Primary Report Cards */}
          <View style={styles.primaryReportsRow}>
            <View style={[styles.reportCard, { backgroundColor: colors.background, shadowColor: '#000' }]}>
              <Typography variant="h2" style={{ color: '#064e3b', marginBottom: 4 }}>
                {formatCurrency(loansTotal)}
              </Typography>
              <Typography variant="body2" style={{ color: colors.icon, marginBottom: 2 }}>
                {loansCount} {t('home.loans').toLowerCase()}
              </Typography>
              <Typography variant="caption" style={{ color: colors.icon }}>
                {t('home.inLoans')}
              </Typography>
            </View>

            <View style={[styles.reportCard, { backgroundColor: colors.background, shadowColor: '#000' }]}>
              <Typography variant="h2" style={{ color: '#064e3b', marginBottom: 4 }}>
                {formatCurrency(rentalsTotal)}
              </Typography>
              <Typography variant="body2" style={{ color: colors.icon, marginBottom: 2 }}>
                {roomRentalsCount + vehicleRentalsCount} {t('home.roomRentals').toLowerCase().split(' ')[0]}
              </Typography>
              <Typography variant="caption" style={{ color: colors.icon }}>
                {t('home.inRentals')}
              </Typography>
            </View>
          </View>

          {/* Secondary Report Cards */}
          <View style={styles.secondaryReportsRow}>
            <View style={[styles.reportCard, { backgroundColor: colors.background, shadowColor: '#000' }]}>
              <Typography variant="h2" style={{ color: '#064e3b', marginBottom: 4 }}>
                {operationsCount}
              </Typography>
              <Typography variant="caption" style={{ color: colors.icon }}>
                {t('home.operations')}
              </Typography>
            </View>

            <View style={[styles.reportCard, { backgroundColor: colors.background, shadowColor: '#000' }]}>
              <Typography variant="h2" style={{ color: '#064e3b', marginBottom: 4 }}>
                {otherCount}
              </Typography>
              <Typography variant="caption" style={{ color: colors.icon }}>
                {/* Add label as needed */}
              </Typography>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
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
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
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
  reportCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
