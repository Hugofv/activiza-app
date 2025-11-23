import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable, type PressableProps, type TextProps, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';
import { Typography } from './typography';

const buttonVariants = cva(
  'active:opacity-80 flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: '', // Will be handled by style prop for theme colors
        secondary: '', // Will be handled by style prop for theme colors
        error: '', // Will be handled by style prop for theme colors
        outline: 'border border-input bg-background',
        ghost: '',
        link: 'text-primary underline-offset-4',
      },
      size: {
        default: 'h-[56px] px-4 py-[13px]',
        sm: 'h-9 px-3 py-2',
        lg: 'h-[56px] px-8 py-[13px]',
        icon: 'h-[56px]', // Width will be set dynamically based on variant/usage
        iconSmall: 'h-[56px]', // 40px width for back buttons
        iconLarge: 'h-[56px]', // 80px width for forward buttons
        full: 'h-[56px] w-full px-4 py-[13px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  textProps?: TextProps;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant = 'primary', size, children, textProps, style, disabled, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Get variant-specific styles
    const getVariantStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        borderRadius: 99, // rounded-[99px] from Figma
        minHeight: size === 'sm' ? 36 : 56, // Ensure minimum height
        alignItems: 'center',
        justifyContent: 'center',
      };
      
      // Handle width based on size
      if (size === 'icon') {
        // Default icon size: 56px (square)
        baseStyle.width = 56;
        baseStyle.minWidth = 56;
      } else if (size === 'iconSmall') {
        // Small icon button: 40px width (for back buttons)
        baseStyle.width = 40;
        baseStyle.minWidth = 40;
        baseStyle.paddingHorizontal = 4;
      } else if (size === 'iconLarge') {
        // Large icon button: 80px width (for forward/continue buttons)
        baseStyle.width = 80;
        baseStyle.minWidth = 80;
        baseStyle.paddingHorizontal = 24;
      } else if (size === 'full') {
        baseStyle.width = '100%';
        baseStyle.alignSelf = 'stretch';
      }
      // For other sizes, width is flexible (can be set via style prop)
      
      switch (variant) {
        case 'primary':
          baseStyle.backgroundColor = colors.primary; // Green (#a7e203)
          if (disabled) {
            baseStyle.opacity = 0.5;
          }
          break;
        case 'secondary':
          // Secondary button: light muted background (like back button in Figma)
          baseStyle.backgroundColor = colorScheme === 'dark' ? '#1a2a24' : '#f1f9f5'; // Light green tint from Figma
          // No border for secondary - just muted background
          if (disabled) {
            baseStyle.opacity = 0.5;
          }
          break;
        case 'error':
          baseStyle.backgroundColor = '#ef4444';
          if (disabled) {
            baseStyle.opacity = 0.5;
          }
          break;
        case 'outline':
          baseStyle.backgroundColor = 'transparent';
          baseStyle.borderColor = colors.icon;
          baseStyle.borderWidth = 1;
          if (disabled) {
            baseStyle.opacity = 0.5;
          }
          break;
        case 'ghost':
          baseStyle.backgroundColor = 'transparent';
          if (disabled) {
            baseStyle.opacity = 0.5;
          }
          break;
        case 'link':
          baseStyle.backgroundColor = 'transparent';
          if (disabled) {
            baseStyle.opacity = 0.5;
          }
          break;
        default:
          baseStyle.backgroundColor = colors.primary;
          if (disabled) {
            baseStyle.opacity = 0.5;
          }
      }
      
      return baseStyle;
    };

    // Get text color based on variant
    const getTextColor = () => {
      switch (variant) {
        case 'primary':
          // Use primaryForeground which is theme-aware and provides good contrast
          // In dark mode: #001a00 (very dark), in light mode: #064e3b (dark green)
          return colors.primaryForeground;
        case 'secondary':
          return colors.primary; // Green text on light background
        case 'error':
          return '#ffffff';
        case 'outline':
          return colors.text;
        case 'ghost':
          return colors.text;
        case 'link':
          return colors.primary;
        default:
          return colors.primaryForeground;
      }
    };

    const variantStyle = getVariantStyle();

    return (
      <Pressable
        className={cn(buttonVariants({ variant, size, className }))}
        style={[variantStyle, style] as any}
        ref={ref}
        disabled={disabled}
        {...props}>
          {typeof children === 'string' ? (
          <Typography 
            variant="lead"
            style={{ color: getTextColor() }}>
            {children}
          </Typography>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

