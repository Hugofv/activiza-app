import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClientItem } from '@/components/clients/ClientItem';
import { Avatar } from '@/components/ui/Avatar';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createOfflineQueryOptions } from '@/lib/hooks/useQuery';
import { type Client, getClients } from '@/lib/services/clientService';

import { useOperations } from '../_context';

const SEARCH_BAR_HEIGHT = 52;
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 180,
  mass: 0.8,
};

export default function ClientSelectionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOperations();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Search bar animation
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchHeight = useSharedValue(0);
  const searchOpacity = useSharedValue(0);
  const searchInputRef = useRef<TextInput>(null);
  const lastScrollY = useRef(0);

  const showSearch = useCallback(() => {
    if (isSearchVisible) return;
    setIsSearchVisible(true);
    searchHeight.value = withSpring(SEARCH_BAR_HEIGHT, SPRING_CONFIG);
    searchOpacity.value = withSpring(1, SPRING_CONFIG);
    setTimeout(() => searchInputRef.current?.focus(), 300);
  }, [isSearchVisible, searchHeight, searchOpacity]);

  const hideSearch = useCallback(() => {
    if (!isSearchVisible) return;
    searchInputRef.current?.blur();
    searchHeight.value = withSpring(0, SPRING_CONFIG);
    searchOpacity.value = withSpring(0, SPRING_CONFIG);
    setIsSearchVisible(false);
    setSearchQuery('');
  }, [isSearchVisible, searchHeight, searchOpacity]);

  const toggleSearch = useCallback(() => {
    if (isSearchVisible) {
      hideSearch();
    } else {
      showSearch();
    }
  }, [isSearchVisible, showSearch, hideSearch]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const delta = currentY - lastScrollY.current;

      if (currentY <= 0 && delta < -10 && !isSearchVisible) {
        showSearch();
      }

      if (delta > 10 && isSearchVisible) {
        hideSearch();
      }

      lastScrollY.current = currentY;
    },
    [isSearchVisible, showSearch, hideSearch]
  );

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    height: searchHeight.value,
    opacity: searchOpacity.value,
    overflow: 'hidden' as const,
  }));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const { data: clientsData } = useQuery(
    createOfflineQueryOptions({
      queryKey: ['clients', 'loan-search', debouncedSearch],
      queryFn: () =>
        debouncedSearch
          ? getClients({ search: debouncedSearch })
          : getClients({}),
      staleTime: 1000 * 60,
    })
  );

  const clients: Client[] = clientsData?.results ?? [];

  const handleClientPress = (client: Client) => {
    updateFormData({
      selectedClientId: String(client.id),
      selectedClientName: client.name ?? client.meta?.name ?? '',
    });
  };

  const handleNext = () => {
    if (formData.selectedClientId) {
      router.push('/operations/loan/form');
    }
  };

  const handleLendToNewClient = () => {
    router.push('/clients/new/name');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerLeft}>
            <BackButton />
            <Typography variant="h4">
              {t('operations.lendLoan')}
            </Typography>
          </View>
          <View>
            <IconButton
              shape="rounded"
              size="sm"
              variant={isSearchVisible ? 'primary' : 'secondary'}
              icon="search"
              onPress={toggleSearch}
            />
          </View>
        </View>
        <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
          <Input
            ref={searchInputRef}
            variant="outline"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('common.search')}
            returnKeyType="search"
          />
        </Animated.View>
      </View>

      {/* Client List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Lend to new client */}
        <TouchableOpacity
          style={[styles.newClientRow, { borderBottomColor: colors.border }]}
          onPress={handleLendToNewClient}
          activeOpacity={0.7}
        >
          <Avatar
            icon="user-filled"
            size={48}
            backgroundColor="muted"
            iconColor="icon"
          />
          <Typography
            variant="body1Medium"
            style={styles.newClientText}
          >
            {t('operations.lendToNewClient')}
          </Typography>
          <Icon
            name="chevron-right"
            size={20}
            color="icon"
          />
        </TouchableOpacity>

        {/* Client list */}
        {clients.map((client) => {
          const isSelected =
            formData.selectedClientId === String(client.id);
          return (
            <View
              key={client.id}
              style={[
                isSelected && {
                  backgroundColor: colors.muted,
                  borderRadius: 12,
                  marginHorizontal: -8,
                  paddingHorizontal: 8,
                },
              ]}
            >
              <ClientItem
                client={client}
                onPress={handleClientPress}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="full"
          onPress={handleNext}
          disabled={!formData.selectedClientId}
        >
          {t('operations.next')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchContainer: {
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  newClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  newClientText: {
    flex: 1,
    fontSize: 16,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
