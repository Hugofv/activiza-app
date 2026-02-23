import { useCallback, useEffect, useRef, useState } from 'react';

import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TextInput,
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

import { VehicleCard } from '@/components/operations/VehicleCard';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createOfflineQueryOptions } from '@/lib/hooks/useQuery';
import {
  type Vehicle,
  getVehicles,
} from '@/lib/services/vehicleService';

import { useOperations } from '../_context';

const SEARCH_BAR_HEIGHT = 52;
const SPRING_CONFIG = { damping: 20, stiffness: 180, mass: 0.8 };

export default function VehicleSelectionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { updateFormData } = useOperations();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
    if (isSearchVisible) hideSearch();
    else showSearch();
  }, [isSearchVisible, showSearch, hideSearch]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const delta = currentY - lastScrollY.current;
      if (currentY <= 0 && delta < -10 && !isSearchVisible) showSearch();
      if (delta > 10 && isSearchVisible) hideSearch();
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
    const id = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const { data: vehiclesData } = useQuery(
    createOfflineQueryOptions({
      queryKey: ['vehicles', 'selection', debouncedSearch],
      queryFn: () =>
        debouncedSearch
          ? getVehicles({ search: debouncedSearch })
          : getVehicles({}),
      staleTime: 1000 * 60,
    })
  );

  const vehicles: Vehicle[] = vehiclesData?.results ?? [];

  const handleVehiclePress = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
  };

  const handleNext = () => {
    const selected = vehicles.find((v) => v.id === selectedVehicleId);
    if (selected) {
      updateFormData({ client: null });
      router.push('/operations/rentVehicle/form' as any);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerLeft}>
            <BackButton />
            <Typography variant="h4">
              {t('operations.selectVehicle')}
            </Typography>
          </View>
          <IconButton
            shape="rounded"
            size="sm"
            variant={isSearchVisible ? 'primary' : 'secondary'}
            icon="search"
            onPress={toggleSearch}
          />
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {vehicles.map((vehicle) => {
          const isSelected = vehicle.id === selectedVehicleId;
          return (
            <View
              key={vehicle.id}
              style={isSelected ? [styles.selectedCard, { backgroundColor: colors.muted }] : undefined}
            >
              <VehicleCard
                vehicle={vehicle}
                onPress={handleVehiclePress}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="full"
          onPress={handleNext}
          disabled={!selectedVehicleId}
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
  selectedCard: {
    borderRadius: 16,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
