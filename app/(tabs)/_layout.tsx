import { useCallback, useMemo } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { Tabs, router } from 'expo-router';

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { TabBarItem } from '@/components/TabBarItem';
import { BottomSheetHost, type BottomSheetHostItem } from '@/components/ui/BottomSheetHost';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mapModulesToOperationOptions } from '@/lib/constants/operationConstants';
import { useBottomSheetController } from '@/lib/hooks/useBottomSheetController';
import { useModules } from '@/lib/hooks/useModules';

interface ActionTabButtonProps extends BottomTabBarButtonProps {
  onOpen: () => void;
}

function CreateTabButton({ onOpen, ...props }: ActionTabButtonProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onOpen();
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 25,
      stiffness: 120,
      mass: 0.8,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 25,
      stiffness: 120,
      mass: 0.8,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.createButton}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel}
    >
      <Animated.View style={animatedStyle}>
        <Icon
          name="square-rounded-plus"
          size={34}
          color="text"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

function AssetsTabButton({ onOpen, ...props }: ActionTabButtonProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onOpen();
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 25,
      stiffness: 120,
      mass: 0.8,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 25,
      stiffness: 120,
      mass: 0.8,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.createButton}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel}
    >
      <Animated.View style={animatedStyle}>
        <Icon
          name="layout-grid"
          size={34}
          color="text"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}


function TabLayoutContent() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  type TabsSheetId = 'operations' | 'assets';
  const bottomSheets = useBottomSheetController<TabsSheetId>();
  const {
    data: modules,
    isLoading: isLoadingModules,
    error: modulesError,
  } = useModules();
  const operationOptions = useMemo(
    () => mapModulesToOperationOptions(modules),
    [modules]
  );
  const assetOptions = useMemo(
    () => [
      {
        id: 'vehicles',
        icon: 'car',
        label: t('operations.vehicles'),
        route: '/vehicles',
      },
      {
        id: 'clients',
        icon: 'users',
        label: t('tabs.customers'),
        route: '/clients',
      },
    ],
    [t]
  );

  const handleOptionPress = useCallback(
    (route?: string) => {
      bottomSheets.close('operations');
      if (route) {
        router.push(route as any);
      }
    },
    [bottomSheets]
  );

  const handleClose = useCallback(() => {
    bottomSheets.close('operations');
  }, [bottomSheets]);

  const handleCloseAssets = useCallback(() => {
    bottomSheets.close('assets');
  }, [bottomSheets]);

  const handleAssetOptionPress = useCallback(
    (route?: string) => {
      bottomSheets.close('assets');
      if (route) {
        router.push(route as any);
      }
    },
    [bottomSheets]
  );

  const tabBarStyle = {
    backgroundColor:
      colorScheme === 'dark'
        ? 'rgba(0, 0, 0, 0.9)'
        : 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 0,
    borderRadius: 40,
    marginBottom: 30,
    marginHorizontal: '20%' as any,
    paddingHorizontal: 24,
    height: 65,
    width: '60%' as any,
    position: 'absolute' as const,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor:
      colorScheme === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden' as const,
  };

  const tabBarItemStyle = { height: 65 };

  const operationsSheetContent = useMemo(
    () => (
      <ScrollView
        style={styles.optionsList}
        contentContainerStyle={styles.optionsListContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingModules ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={Colors[colorScheme ?? 'light'].primary}
            />
            <Typography
              variant="body2"
              style={[
                styles.loadingText,
                { color: Colors[colorScheme ?? 'light'].icon },
              ]}
            >
              {t('common.loading')}
            </Typography>
          </View>
        ) : modulesError ? (
          <Typography
            variant="body2"
            style={[
              styles.errorText,
              { color: Colors[colorScheme ?? 'light'].text },
            ]}
          >
            {t('common.error')}
          </Typography>
        ) : operationOptions.length === 0 ? (
          <Typography
            variant="body2"
            style={[
              styles.emptyText,
              { color: Colors[colorScheme ?? 'light'].icon },
            ]}
          >
            {t('common.noData')}
          </Typography>
        ) : (
          operationOptions.map((option, index) => (
            <Pressable
              key={option.id}
              style={[
                styles.optionItem,
                index < operationOptions.length - 1 && [
                  styles.optionItemBorder,
                  {
                    borderBottomColor: `${Colors[colorScheme ?? 'light'].icon}20`,
                  },
                ],
              ]}
              onPress={() => handleOptionPress(option.route)}
              android_ripple={{
                color: `${Colors[colorScheme ?? 'light'].icon}10`,
              }}
            >
              <Icon
                name={option.icon as any}
                size={28}
                color="text"
              />
              <Typography
                variant="body1"
                style={[styles.optionText, { color: 'text' }]}
              >
                {t(`tabs.${option.labelKey}`)}
              </Typography>
            </Pressable>
          ))
        )}
      </ScrollView>
    ),
    [colorScheme, handleOptionPress, isLoadingModules, modulesError, operationOptions, t]
  );

  const assetsSheetContent = useMemo(
    () => (
      <ScrollView
        style={styles.assetsList}
        contentContainerStyle={styles.assetsListContent}
        showsVerticalScrollIndicator={false}
      >
        {assetOptions.map((option, index) => (
          <Pressable
            key={option.id}
            style={[
              styles.optionItem,
              index < assetOptions.length - 1 && [
                styles.optionItemBorder,
                {
                  borderBottomColor: `${Colors[colorScheme ?? 'light'].icon}20`,
                },
              ],
            ]}
            onPress={() => handleAssetOptionPress(option.route)}
            android_ripple={{
              color: `${Colors[colorScheme ?? 'light'].icon}10`,
            }}
          >
            <Icon
              name={option.icon as any}
              size={28}
              color="text"
            />
            <Typography
              variant="body1"
              style={[styles.optionText, { color: 'text' }]}
            >
              {option.label}
            </Typography>
          </Pressable>
        ))}
      </ScrollView>
    ),
    [assetOptions, colorScheme, handleAssetOptionPress]
  );

  const sheets = useMemo<BottomSheetHostItem<TabsSheetId>[]>(
    () => [
      {
        id: 'operations',
        onClose: handleClose,
        content: operationsSheetContent,
      },
      {
        id: 'assets',
        onClose: handleCloseAssets,
        content: assetsSheetContent,
      },
    ],
    [assetsSheetContent, handleClose, handleCloseAssets, operationsSheetContent]
  );

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'primary',
          tabBarInactiveTintColor: 'icon',
          tabBarStyle,
          tabBarItemStyle,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t('tabs.home') || 'Home',
            tabBarButton: (props) => (
              <TabBarItem
                {...props}
                icon="home"
                routeName="home"
                color="text"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: t('tabs.create') || 'Criar',
            tabBarButton: (props) => (
              <CreateTabButton
                {...props}
                onOpen={() => bottomSheets.open('operations')}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="assets"
          options={{
            title: t('tabs.assets') || 'Ativos',
            tabBarButton: (props) => (
              <AssetsTabButton
                {...props}
                onOpen={() => bottomSheets.open('assets')}
              />
            ),
          }}
        />
      </Tabs>
      <BottomSheetHost
        openedIds={bottomSheets.openedIds}
        close={bottomSheets.close}
        sheets={sheets}
      />
    </>
  );
}

export default function TabLayout() {
  return <TabLayoutContent />;
}

const styles = StyleSheet.create({
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 65,
    width: '100%',
  },
  optionsList: { flexGrow: 0 },
  optionsListContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
  assetsList: { flexGrow: 0 },
  assetsListContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { marginTop: 4 },
  errorText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  optionItemBorder: { borderBottomWidth: 1 },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});
