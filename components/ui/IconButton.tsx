import * as React from 'react';

import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { type VariantProps, cva } from 'class-variance-authority';

import { Colors, type ThemeColorKey } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';

import { Icon, IconColor, type IconName } from './Icon';
import { Typography } from './Typography';

const iconButtonVariants = cva(
  'active:opacity-80 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
        error: '',
        outline: 'border border-input bg-background',
        ghost: '',
      },
      size: {
        sm: 'h-[40px]',
        md: 'h-[56px]',
        lg: 'h-[80px]',
        default: 'h-[56px]',
        sl: 'h-[48px]',
      },
      width: {
        sm: 'w-[40px]',
        md: 'w-[56px]',
        lg: 'w-[80px]',
        default: 'w-[56px]',
        sl: 'w-[48px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface IconButtonProps
  extends
    Omit<PressableProps, 'children'>,
    VariantProps<typeof iconButtonVariants> {
  icon: IconName;
  iconSize?: number;
  iconColor?: IconColor;
  className?: string;
  width?: 'sm' | 'md' | 'lg' | 'default' | 'sl';
  shape?: 'rounded' | 'cylinder' | 'default';
  loading?: boolean;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  /** Background color from theme color scheme */
  backgroundColor?: IconColor;
}

const IconButton = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  IconButtonProps
>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      width,
      shape = 'default',
      icon,
      iconSize,
      iconColor,
      style,
      disabled,
      loading,
      label,
      labelStyle,
      backgroundColor,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Disable button when loading
    const isDisabled = disabled || loading;

    // Get variant-specific styles
    const getVariantStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        alignItems: 'center',
        justifyContent: 'center',
      };

      // Determine actual size (handle 'default' as 'md')
      const actualSize = size === 'default' ? 'md' : size;

      // Shape determines the form: rounded (circular), cylinder (vertical oval), or default (rectangular)
      const isRounded = shape === 'rounded';
      const isCylinder = shape === 'cylinder';
      const widthSize =
        isRounded || isCylinder ? actualSize : width || actualSize;

      // Set height based on size
      switch (actualSize) {
        case 'sm':
          baseStyle.height = 40;
          baseStyle.minHeight = 40;
          break;
        case 'sl':
          baseStyle.height = 48;
          baseStyle.minHeight = 48;
          break;
        case 'md':
          baseStyle.height = 56;
          baseStyle.minHeight = 56;
          break;
        case 'lg':
          baseStyle.height = 80;
          baseStyle.minHeight = 80;
          break;
        default:
          baseStyle.height = 56;
          baseStyle.minHeight = 56;
      }

      // Set width based on shape
      if (isCylinder) {
        // Cylindrical: width < height (vertical oval)
        switch (actualSize) {
          case 'sm':
            baseStyle.width = 32;
            baseStyle.minWidth = 32;
            break;
          case 'sl':
            baseStyle.width = 40;
            baseStyle.minWidth = 40;
            break;
          case 'md':
            baseStyle.width = 44;
            baseStyle.minWidth = 44;
            break;
          case 'lg':
            baseStyle.width = 64;
            baseStyle.minWidth = 64;
            break;
          default:
            baseStyle.width = 44;
            baseStyle.minWidth = 44;
        }
      } else if (isRounded) {
        // Rounded: width = height (perfect circle)
        switch (actualSize) {
          case 'sm':
            baseStyle.width = 40;
            baseStyle.minWidth = 40;
            break;
          case 'sl':
            baseStyle.width = 48;
            baseStyle.minWidth = 48;
            break;
          case 'md':
            baseStyle.width = 56;
            baseStyle.minWidth = 56;
            break;
          case 'lg':
            baseStyle.width = 80;
            baseStyle.minWidth = 80;
            break;
          default:
            baseStyle.width = 56;
            baseStyle.minWidth = 56;
        }
      } else {
        // Default: rectangular horizontal (width > height)
        // If width prop is provided, use it; otherwise make width larger than height
        if (width) {
          // Use custom width if provided
          switch (widthSize) {
            case 'sm':
              baseStyle.width = 40;
              baseStyle.minWidth = 40;
              break;
            case 'sl':
              baseStyle.width = 48;
              baseStyle.minWidth = 48;
              break;
            case 'md':
              baseStyle.width = 56;
              baseStyle.minWidth = 56;
              break;
            case 'lg':
              baseStyle.width = 80;
              baseStyle.minWidth = 80;
              break;
            default:
              baseStyle.width = 56;
              baseStyle.minWidth = 56;
          }
        } else {
          // Default horizontal: width > height
          switch (actualSize) {
            case 'sm':
              baseStyle.width = 56; // width > height (40)
              baseStyle.minWidth = 56;
              break;
            case 'sl':
              baseStyle.width = 64; // width > height (48)
              baseStyle.minWidth = 64;
              break;
            case 'md':
              baseStyle.width = 72; // width > height (56)
              baseStyle.minWidth = 72;
              break;
            case 'lg':
              baseStyle.width = 104; // width > height (80)
              baseStyle.minWidth = 104;
              break;
            default:
              baseStyle.width = 72;
              baseStyle.minWidth = 72;
          }
        }
      }

      // Add horizontal padding for wider rectangular buttons (not rounded/cylinder)
      if (!isRounded && !isCylinder && widthSize === 'lg') {
        baseStyle.paddingHorizontal = 24;
      }

      // Use borderRadius: 99 for rounded/cylinder buttons (perfect circle or vertical oval)
      // For other variants, also use 99 but it creates pill shape when width ≠ height
      baseStyle.borderRadius = 99;

      // Variant defines color/style
      // If backgroundColor prop is provided, it overrides variant background
      if (backgroundColor) {
        baseStyle.backgroundColor = colors[backgroundColor as ThemeColorKey];
        if (isDisabled) {
          baseStyle.opacity = 0.5;
        }
      } else {
        switch (variant) {
          case 'primary':
            baseStyle.backgroundColor = colors.primary;
            if (isDisabled) {
              baseStyle.opacity = 0.5;
            }
            break;
          case 'secondary':
            baseStyle.backgroundColor =
              colorScheme === 'dark' ? colors.muted : colors.muted;
            if (isDisabled) {
              baseStyle.opacity = 0.5;
            }
            break;
          case 'error':
            baseStyle.backgroundColor = colors.error;
            if (isDisabled) {
              baseStyle.opacity = 0.5;
            }
            break;
          case 'outline':
            baseStyle.backgroundColor = 'transparent';
            baseStyle.borderColor = colors.icon;
            baseStyle.borderWidth = 1;
            if (isDisabled) {
              baseStyle.opacity = 0.5;
            }
            break;
          case 'ghost':
            baseStyle.backgroundColor = 'transparent';
            if (isDisabled) {
              baseStyle.opacity = 0.5;
            }
            break;
          default:
            baseStyle.backgroundColor = colors.primary;
            if (isDisabled) {
              baseStyle.opacity = 0.5;
            }
        }
      }

      return baseStyle;
    };

    // Get icon color based on variant
    const getIconColor = (): ThemeColorKey => {
      if (iconColor) return iconColor as ThemeColorKey;

      switch (variant) {
        case 'primary':
          return 'primaryForeground';
        case 'secondary':
          return 'primaryForeground';
        case 'error':
          return 'text';
        case 'outline':
          return 'text';
        case 'ghost':
          return 'text';
        default:
          return 'primaryForeground';
      }
    };

    // Get icon size based on button size
    const getIconSize = () => {
      if (iconSize) return iconSize;

      // Handle 'default' as 'md'
      const actualSize = size === 'default' ? 'md' : size;

      switch (actualSize) {
        case 'sm':
          return 20;
        case 'md':
          return 24;
        case 'lg':
          return 32;
        default:
          return 24;
      }
    };

    const variantStyle = getVariantStyle();
    const iconColorValue = colors[getIconColor()];

    return (
      <Pressable
        style={label ? styles.container : {}}
        disabled={isDisabled}
        {...props}
      >
        <View
          className={cn(
            iconButtonVariants({
              variant,
              size,
              width: width || size,
              className,
            })
          )}
          style={[variantStyle, style] as any}
          ref={ref}
          {...props}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={iconColorValue as ThemeColorKey}
            />
          ) : (
            <Icon
              name={icon}
              size={getIconSize()}
              color={iconColorValue as ThemeColorKey}
            />
          )}
        </View>
        {label && (
          <Typography
            variant="body2Medium"
            color="primaryForeground"
            style={labelStyle}
          >
            {label}
          </Typography>
        )}
      </Pressable>
    );
  }
);
IconButton.displayName = 'IconButton';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
});

export { IconButton, iconButtonVariants };
