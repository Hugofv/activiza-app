import { useCallback, useMemo } from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { router, Tabs } from 'expo-router';

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { TabBarItem } from '@/components/TabBarItem';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import {
  BottomSheetProvider,
  useBottomSheet,
} from '@/contexts/bottomSheetContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mapModulesToOperationOptions } from '@/lib/constants/operationConstants';
import { useModules } from '@/lib/hooks/useModules';

function CreateTabButton(props: BottomTabBarButtonProps) {
  const { open } = useBottomSheet();
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    open();
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

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], }));

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

function TabLayoutContent() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { isOpen, close } = useBottomSheet();
  const {
    data: modules,
    isLoading: isLoadingModules,
    error: modulesError,
  } = useModules();
  const operationOptions = useMemo(
    () => mapModulesToOperationOptions(modules),
    [modules]
  );

  const handleOptionPress = useCallback(
    (route?: string) => {
      close();
      if (route) {
        router.push(route as any);
      }
    },
    [close]
  );

  const handleClose = useCallback(() => {
    close();
  }, [close]);

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

  const tabBarItemStyle = { height: 65, };

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
            tabBarButton: (props) => <CreateTabButton {...props} />,
          }}
        />
        <Tabs.Screen
          name="clients"
          options={{
            title: t('tabs.clients') || 'Clientes',
            tabBarButton: (props) => (
              <TabBarItem
                {...props}
                icon="people"
                routeName="clients"
                color="text"
              />
            ),
          }}
        />
      </Tabs>
      <BottomSheet
        visible={isOpen}
        onClose={handleClose}
      >
        <View style={styles.optionsList}>
          {isLoadingModules ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={Colors[colorScheme ?? 'light'].primary}
              />
              <Typography
                variant="body2"
                style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].icon }]}
              >
                {t('common.loading')}
              </Typography>
            </View>
          ) : modulesError ? (
            <Typography
              variant="body2"
              style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].text }]}
            >
              {t('common.error')}
            </Typography>
          ) : operationOptions.length === 0 ? (
            <Typography
              variant="body2"
              style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].icon }]}
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
                      borderBottomColor:
                        Colors[colorScheme ?? 'light'].icon + '20',
                    },
                  ],
                ]}
                onPress={() => handleOptionPress(option.route)}
                android_ripple={{ color: Colors[colorScheme ?? 'light'].icon + '10', }}
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
        </View>
      </BottomSheet>
    </>
  );
}

export default function TabLayout() {
  return (
    <BottomSheetProvider>
      <TabLayoutContent />
    </BottomSheetProvider>
  );
}

const styles = StyleSheet.create({
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 65,
    width: '100%',
  },
  optionsList: { paddingVertical: 8, },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { marginTop: 4, },
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
  optionItemBorder: { borderBottomWidth: 1, },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});
