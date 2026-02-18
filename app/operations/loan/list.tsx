import { useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoanCard } from '@/components/operations/LoanCard';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type Operation,
  type OperationStatus,
  OperationType,
  getOperations,
} from '@/lib/services/operationService';

type FilterValue = 'all' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE';

export default function LoanListScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('all');

  const FILTER_OPTIONS = [
    { value: 'all' as const, label: t('operations.filterAll') },
    { value: 'ACTIVE' as const, label: t('operations.filterActive') },
    { value: 'COMPLETED' as const, label: t('operations.filterCompleted') },
    { value: 'OVERDUE' as const, label: t('operations.filterOverdue') },
  ];

  const statusFilter: OperationStatus | undefined =
    selectedFilter === 'all' ? undefined : selectedFilter;

  const {
    data: operationsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['operations', 'loans', statusFilter],
    queryFn: () =>
      getOperations({
        type: OperationType.LOAN,
        status: statusFilter,
      }),
  });

  const operations = operationsData?.results ?? [];
  const count = operationsData?.count ?? 0;

  const handleLoanPress = (operation: Operation) => {
    // Future: navigate to loan detail
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backButton}
          >
            <Icon
              name="chevron-back"
              size={24}
              color="primaryForeground"
            />
          </Pressable>

          <View style={{ flex: 1 }} />

          <Select
            variant="filled"
            options={FILTER_OPTIONS}
            value={selectedFilter}
            onValueChange={(value) => setSelectedFilter(value)}
            style={styles.select}
          />
        </View>

        {/* Title + count */}
        <View style={styles.titleRow}>
          <Typography variant="h3">
            {t('operations.loansList')}
          </Typography>
          {!isLoading && (
            <Typography
              variant="h3"
              color="placeholder"
              style={{ marginLeft: 8 }}
            >
              {count}
            </Typography>
          )}
        </View>

        {/* List */}
        {isLoading ? (
          <View style={styles.centeredContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        ) : error ? (
          <View style={styles.centeredContainer}>
            <Typography
              variant="body1"
              color="icon"
            >
              {t('operations.loadError')}
            </Typography>
          </View>
        ) : operations.length === 0 ? (
          <View style={styles.centeredContainer}>
            <Typography
              variant="body1"
              color="icon"
            >
              {t('operations.noLoans')}
            </Typography>
          </View>
        ) : (
          <FlatList
            data={operations}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <LoanCard
                operation={item}
                onPress={handleLoanPress}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refetch}
            refreshing={isRefetching}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  select: { minWidth: 115 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
