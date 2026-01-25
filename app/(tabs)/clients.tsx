import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClientItem } from '@/components/clients';
import { IconButton } from '@/components/ui/IconButton';
import { Select } from '@/components/ui/Select';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { getClients, type Client } from '@/lib/services/clientService';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

// Filter options will be translated in the component

export default function ClientsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isChecking } = useAuthGuard();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const FILTER_OPTIONS = [
    { value: 'all' as const, label: t('tabs.filterAll') || 'Todos' },
    { value: 'active' as const, label: t('tabs.filterActive') || 'Ativos' },
    { value: 'inactive' as const, label: t('tabs.filterInactive') || 'Inativos' },
  ];

  // Fetch clients
  const {
    data: clientsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['clients', selectedFilter],
    queryFn: () => getClients({ status: selectedFilter === 'all' ? undefined : selectedFilter }),
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
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

  const handleClientPress = (client: Client) => {
    // Navigate to client details
    // TODO: Create client details screen
    console.log('Navigate to client:', client.id);
  };

  const handleNewClient = () => {
    router.push('/clients/new/name');
  };

  const clients = clientsData?.results || [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Sub-header with title, filter and new client button */}
        <View style={styles.subHeader}>
          <Typography variant="h4" style={[styles.title, { color: colors.primary }]}>
            {t('tabs.customers') || 'Clientes'}
          </Typography>

          <View style={styles.headerActions}>
            {/* New Client Button */}
            <IconButton
              icon="plus"
              variant="primary"
              shape="rounded"
              size="sm"
              onPress={handleNewClient}
              accessibilityLabel={t('tabs.newClient') || 'Novo Cliente'}
            />
          </View>
        </View>

        <View>
          <Select
            options={FILTER_OPTIONS}
            value={selectedFilter}
            onValueChange={(value) => setSelectedFilter(value)}
            style={styles.select}
          />
        </View>

        {/* Clients List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Typography variant="body1" style={{ color: colors.text }}>
              {t('common.error') || 'Erro ao carregar clientes'}
            </Typography>
          </View>
        ) : clients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography variant="body1" style={{ color: colors.icon }}>
              {t('tabs.noClients') || 'Nenhum cliente encontrado'}
            </Typography>
          </View>
        ) : (
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ClientItem client={item} onPress={handleClientPress} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refetch}
            refreshing={isLoading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  select: {
    minWidth: 115,
  },
  listContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
