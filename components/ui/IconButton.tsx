import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ActivityIndicator, Pressable, type PressableProps, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

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
        rounded: '',
      },
      size: {
        sm: 'h-[40px]',
        md: 'h-[56px]',
        lg: 'h-[80px]',
        default: 'h-[56px]',
      },
      width: {
        sm: 'w-[40px]',
        md: 'w-[56px]',
        lg: 'w-[80px]',
        default: 'w-[56px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface IconButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof iconButtonVariants> {
  icon: IconName;
  iconSize?: number;
  iconColor?: string;
  className?: string;
  width?: 'sm' | 'md' | 'lg' | 'default';
  loading?: boolean;
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
          icon,
          iconSize,
          iconColor,
          style,
          disabled,
          loading,
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

      // For rounded variant, always make it circular (width = height)
      // For other variants, can be rectangular
      const isRounded = variant === 'rounded';
      const widthSize = isRounded ? actualSize : (width || actualSize);

      // Set height based on size
      switch (actualSize) {
        case 'sm':
          baseStyle.height = 40;
          baseStyle.minHeight = 40;
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

      // Set width
      switch (widthSize) {
        case 'sm':
          baseStyle.width = 40;
          baseStyle.minWidth = 40;
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

      // Add horizontal padding for wider rectangular buttons (not rounded)
      if (!isRounded && widthSize === 'lg') {
        baseStyle.paddingHorizontal = 24;
      }

      // Use borderRadius: 99 for rounded buttons (perfect circle)
      // For other variants, also use 99 but it creates pill shape when width ≠ height
      baseStyle.borderRadius = 99;

      switch (variant) {
        case 'primary':
          baseStyle.backgroundColor = colors.primary;
          if (isDisabled) {
            baseStyle.opacity = 0.5;
          }
          break;
        case 'secondary':
          baseStyle.backgroundColor =
            colorScheme === 'dark' ? '#1a2a24' : '#f1f9f5';
          if (isDisabled) {
            baseStyle.opacity = 0.5;
          }
          break;
        case 'error':
          baseStyle.backgroundColor = '#ef4444';
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
        case 'rounded':
          baseStyle.backgroundColor = colors.primary;
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

      return baseStyle;
    };

    // Get icon color based on variant
    const getIconColor = () => {
      if (iconColor) return iconColor;

      switch (variant) {
        case 'primary':
          return colors.primaryForeground;
        case 'secondary':
          return colors.primary;
        case 'error':
          return '#ffffff';
        case 'outline':
          return colors.text;
        case 'ghost':
          return colors.text;
        case 'rounded':
          return colors.primaryForeground;
        default:
          return colors.primaryForeground;
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
    const iconColorValue = getIconColor();

    return (
      <Pressable
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
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={iconColorValue}
          />
        ) : (
          <Icon
            name={icon}
            size={getIconSize()}
            color={iconColorValue}
          />
        )}
      </Pressable>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };

