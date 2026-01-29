import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { StyleSheet, useColorScheme, View, type ViewStyle } from 'react-native';

import { Colors, type ThemeColorKey } from '@/constants/theme';
import { cn } from '@/lib/utils';

import { Icon, type IconName } from './Icon';
import { Typography, type TypographyVariant } from './Typography';

const badgeVariants = cva('', {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  /** Icon name to display */
  icon: IconName;
  /** Text or value to display */
  value?: string | number | React.ReactNode;
  /** Background color */
  backgroundColor: ThemeColorKey;
  /** Foreground color for icon and text */
  foregroundColor: ThemeColorKey;
  /** Icon size */
  iconSize?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Custom className */
  className?: string;
}

/**
 * Badge component for displaying icons with values/text
 *
 * @example
 * ```tsx
 * // Basic usage with custom colors
 * <Badge
 *   icon="star"
 *   value={4}
 *   backgroundColor="#F5F5F5"
 *   foregroundColor="#525E57"
 * />
 *
 * // Different sizes
 * <Badge icon="check" value={6} backgroundColor="#E5F7E7" foregroundColor="#2B7B3B" size="sm" />
 * <Badge icon="calendar" value={4} backgroundColor="#FCF1D2" foregroundColor="#A07E2F" size="md" />
 * <Badge icon="user-dollar" value="700£" backgroundColor="#F5F5F5" foregroundColor="#2B7B3B" size="lg" />
 * ```
 */
export const Badge = React.forwardRef<View, BadgeProps>(
  (
    {
      icon,
      value,
      size = 'md',
      backgroundColor,
      foregroundColor,
      iconSize,
      style,
      className,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    // Determine icon size based on badge size if not provided
    const getIconSize = (): number => {
      if (iconSize) return iconSize;
      switch (size) {
        case 'sm':
          return 16;
        case 'md':
          return 18;
        case 'lg':
          return 20;
        default:
          return 16;
      }
    };

    // Determine text variant based on size
    const getTextVariant = (): TypographyVariant => {
      switch (size) {
        case 'sm':
          return 'body2SemiBold';
        case 'md':
          return 'body2Medium';
        case 'lg':
          return 'body1Medium';
        default:
          return 'body2SemiBold';
      }
    };

    return (
      <View
        ref={ref}
        style={[
          styles.badge,
          {
            backgroundColor: colors[backgroundColor],
            paddingHorizontal: size === 'sm' ? 8 : size === 'md' ? 12 : 16,
            paddingVertical: size === 'sm' ? 4 : size === 'md' ? 8 : 12,
            gap: size === 'sm' ? 4 : size === 'md' ? 6 : 8,
          },
          style,
        ]}
        className={cn(badgeVariants({ size }), className)}
        {...props}
      >
        <Icon name={icon} size={getIconSize()} color={colors[foregroundColor]} />
        <Typography
          variant={getTextVariant()}
          style={[
            {
              color: colors[foregroundColor],
              fontSize: size === 'sm' ? 13 : size === 'md' ? 14 : 15,
              fontWeight: '600',
            },
          ]}
        >
          {value}
        </Typography>
      </View>
    );
  }
);

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
});
