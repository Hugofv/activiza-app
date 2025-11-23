import * as React from 'react';
import { Control, Controller, FieldPath } from 'react-hook-form';
import { TextInput, type TextInputProps, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';
import { Typography } from './typography';

export interface InputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  className?: string;
  // RHF props (optional)
  name?: FieldPath<any>;
  control?: Control<any>;
  error?: string;
  onFormat?: (value: string) => string;
  value?: string;
  onChangeText?: (text: string) => void;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, placeholderTextColor, style, name, control, error, onFormat, value, onChangeText, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // If RHF props are provided, use Controller
    if (name && control) {
      return (
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value: fieldValue } }) => {
            const handleChange = (text: string) => {
              const formatted = onFormat ? onFormat(text) : text;
              onChange(formatted);
            };

            return (
              <View>
                <TextInput
                  ref={ref}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    className
                  )}
                  style={[
                    { 
                      color: colors.text,
                      borderWidth: 0,
                      borderBottomWidth: 1.5,
                      borderBottomColor: error ? '#ef4444' : (style as any)?.borderBottomColor || colors.icon,
                    },
                    error && { borderBottomColor: '#ef4444' },
                    style,
                  ]}
                  placeholderTextColor={placeholderTextColor || colors.icon}
                  value={fieldValue || ''}
                  onChangeText={handleChange}
                  onBlur={onBlur}
                  {...props}
                />
                {error && (
                  <Typography variant="caption" style={{ color: '#ef4444', marginTop: 4 }}>
                    {error}
                  </Typography>
                )}
              </View>
            );
          }}
        />
      );
    }

    // Regular input without RHF
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
          { 
            color: colors.text,
            borderWidth: 0,
            borderBottomWidth: 1.5,
            borderBottomColor: (style as any)?.borderBottomColor || colors.icon,
          },
          style,
        ]}
        placeholderTextColor={placeholderTextColor || colors.icon}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };

