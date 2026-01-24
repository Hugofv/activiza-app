import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ActivityIndicator, Pressable, type PressableProps, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './icon';

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
        default: 'h-[56px]',
        lg: 'h-[80px]',
      },
      width: {
        sm: 'w-[40px]',
        default: 'w-[56px]',
        lg: 'w-[80px]',
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
  width?: 'sm' | 'default' | 'lg';
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

      // Height is always 56px for icon buttons (matches original Button component)
      // This ensures buttons are rectangular (width ≠ height) to create pill shapes, not circles
      baseStyle.height = 56;
      baseStyle.minHeight = 56;

      // Handle width - can be different from height for rectangular buttons
      // If width is not specified, it matches the size prop
      const widthSize = width || size;
      switch (widthSize) {
        case 'sm':
          baseStyle.width = 40;
          baseStyle.minWidth = 40;
          break;
        case 'lg':
          baseStyle.width = 80;
          baseStyle.minWidth = 80;
          // Add horizontal padding for wider buttons to better center the icon
          baseStyle.paddingHorizontal = 24;
          break;
        default:
          baseStyle.width = 56;
          baseStyle.minWidth = 56;
      }

      // Use borderRadius: 99 like the original Button component
      // When width = height, this creates a circle
      // When width ≠ height, this creates a pill/rounded rectangle shape
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
        default:
          return colors.primaryForeground;
      }
    };

    // Get icon size based on button size
    const getIconSize = () => {
      if (iconSize) return iconSize;

      switch (size) {
        case 'sm':
          return 24;
        case 'lg':
          return 32;
        default:
          return 32;
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

