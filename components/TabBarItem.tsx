import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { useNavigationState } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Colors } from '@/constants/theme';

interface TabBarItemProps extends BottomTabBarButtonProps {
  icon: IconName;
  routeName: string;
  color: string;
  focusedColor?: string;
}

export function TabBarItem({
  icon,
  routeName,
  color,
  focusedColor = '#064e3b',
  onPressIn,
  style,
  ...props
}: TabBarItemProps) {
  const navigationState = useNavigationState((state) => {
    if (!state) return null;
    const route = state.routes[state.index ?? 0];
    return route?.name;
  });

  const focused = navigationState === routeName;

  const scale = useSharedValue(focused ? 1 : 0);
  const opacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1, {
        damping: 25,
        stiffness: 120,
        mass: 0.8,
      });
      opacity.value = withSpring(1, {
        damping: 25,
        stiffness: 120,
        mass: 0.8,
      });
    } else {
      scale.value = withSpring(0, {
        damping: 25,
        stiffness: 120,
        mass: 0.8,
      });
      opacity.value = withSpring(0, {
        damping: 25,
        stiffness: 120,
        mass: 0.8,
      });
    }
  }, [focused, scale, opacity]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      <PlatformPressable
        {...props}
        style={[styles.tabButton, style]}
        onPressIn={(ev) => {
          if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onPressIn?.(ev);
        }}
      >
        <View style={styles.iconWrapper}>
          {focused ? (
            <Animated.View
              style={[
                styles.tabIconContainerFocused,
                animatedContainerStyle,
              ]}
            >
              <Animated.View style={[styles.tabIconCircle, animatedCircleStyle]}>
                <Icon
                  name={icon}
                  size={32}
                  color={focusedColor}
                />
              </Animated.View>
            </Animated.View>
          ) : (
            <Icon
              name={icon}
              size={24}
              color={color}
            />
          )}
        </View>
      </PlatformPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    height: 65,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  tabIconContainerFocused: {
    backgroundColor: Colors.light.primaryWhitenOpacity,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconCircle: {
    width: 45,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
