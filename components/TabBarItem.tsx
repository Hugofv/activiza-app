import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { useNavigationState } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
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
          <View style={focused && styles.tabIconContainerFocused}>
            <View style={focused && styles.tabIconCircle}>
              <Icon
                name={icon}
                size={24}
                color={focusedColor}
              />
            </View>
          </View>
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
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
