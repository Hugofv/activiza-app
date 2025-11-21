import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  className?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, placeholderTextColor, style, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
      <TextInput
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        style={[
          { color: colors.text },
          style,
        ]}
        placeholderTextColor={placeholderTextColor || colors.icon}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };

