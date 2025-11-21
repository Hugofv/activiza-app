import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable, Text, type PressableProps, type TextProps } from 'react-native';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'active:opacity-80 items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: '',
        link: 'text-primary underline-offset-4',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
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
  ({ className, variant, size, children, textProps, ...props }, ref) => {
    return (
      <Pressable
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}>
        {typeof children === 'string' ? (
          <Text className={cn('text-sm font-medium', textProps?.className)} {...textProps}>
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

