/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#a7e203'; // Primary green from Figma
const tintColorDark = '#a7e203';

export const Colors = {
  light: {
    text: '#00201c', // Foreground from Figma
    background: '#fff',
    tint: tintColorLight,
    primary: '#a7e203', // Primary green
    primaryForeground: '#064e3b', // Primary foreground (text on primary)
    primaryWhiten: '#9ED600',
    primaryWhitenOpacity: '#9ED60066',
    icon: '#687076',
    placeholder: '#9BAAA2', // Placeholder text color (lighter than icon for better contrast with label)
    muted: '#f3f7f5', // Muted background for progress bars
    disabledPlaceholder: 'rgba(104, 112, 118, 0.3)', // Lighter placeholder for disabled inputs (30% opacity of icon)
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    primary: '#a7e203',
    primaryForeground: '#001a00', // Very dark green/black for better contrast on bright green
    primaryWhiten: '#9ED600',
    primaryWhitenOpacity: '#9ED60066',
    icon: '#9BA1A6',
    placeholder: '#6B7280', // Placeholder text color (lighter than icon for better contrast with label)
    muted: '#1a2a24', // Muted background for progress bars (dark mode)
    disabledPlaceholder: 'rgba(155, 170, 166, 0.3)', // Lighter placeholder for disabled inputs (30% opacity of icon)
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
} as const;

// Extract color keys from theme (single source of truth)
export type ThemeColorKey = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** Inter font family */
    sans: 'Inter_400Regular',
    /** Inter Medium */
    medium: 'Inter_500Medium',
    /** Inter SemiBold */
    semiBold: 'Inter_600SemiBold',
    /** Inter Bold */
    bold: 'Inter_700Bold',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    /** Inter font family */
    sans: 'Inter_400Regular',
    /** Inter Medium */
    medium: 'Inter_500Medium',
    /** Inter SemiBold */
    semiBold: 'Inter_600SemiBold',
    /** Inter Bold */
    bold: 'Inter_700Bold',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    medium: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    semiBold: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    bold: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
