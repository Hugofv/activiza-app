import * as React from 'react';
import { Control, Controller, FieldPath } from 'react-hook-form';
import { TextInput, type TextInputProps, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';
import { Typography } from './typography';

export interface InputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'editable'> {
  className?: string;
  // RHF props (optional)
  name?: FieldPath<any>;
  control?: Control<any>;
  error?: string;
  onFormat?: (value: string) => string;
  value?: string;
  onChangeText?: (text: string) => void;
  label?: string;
  disabled?: boolean;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, placeholderTextColor, style, name, control, error, onFormat, value, onChangeText, label, disabled, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Use theme-based placeholder color (lighter when disabled, better contrast when enabled)
    const finalPlaceholderColor = disabled 
      ? colors.disabledPlaceholder 
      : (placeholderTextColor || colors.placeholder);

    // If RHF props are provided, use Controller
    if (name && control) {
      return (
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value: fieldValue } }) => {
            const handleChange = (text: string) => {
              if (disabled) return;
              const formatted = onFormat ? onFormat(text) : text;
              onChange(formatted);
            };

            const isDisabled = disabled || false;

            return (
              <View style={{ gap: 4 }}>
                {label && (
                  <Typography variant='body1' style={{ fontSize: 20, fontWeight: '500', fontFamily: 'Inter_500Medium', color: colors.text }}>
                    {label}
                  </Typography>
                )}
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
                      color: isDisabled ? colors.icon : colors.text,
                      borderWidth: 0,
                      borderBottomWidth: 1.5,
                      borderBottomColor: error ? '#ef4444' : (style as any)?.borderBottomColor || colors.icon,
                      opacity: isDisabled ? 0.6 : 1,
                    },
                    error && { borderBottomColor: '#ef4444' },
                    style,
                  ]}
                  placeholderTextColor={finalPlaceholderColor}
                  value={fieldValue || ''}
                  onChangeText={handleChange}
                  onBlur={onBlur}
                  editable={!isDisabled}
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
    const isDisabled = disabled || false;
    return (
      <View style={{ gap: 4 }}>
        {label && (
          <Typography variant='body1' style={{ fontSize: 20, fontWeight: '500', fontFamily: 'Inter_500Medium', color: colors.text }}>
            {label}
          </Typography>
        )}
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
              color: isDisabled ? colors.icon : colors.text,
            borderWidth: 0,
            borderBottomWidth: 1.5,
            borderBottomColor: (style as any)?.borderBottomColor || colors.icon,
              opacity: isDisabled ? 0.6 : 1,
          },
          style,
        ]}
          placeholderTextColor={finalPlaceholderColor}
        value={value}
        onChangeText={onChangeText}
          editable={!isDisabled}
        {...props}
      />
      </View>
    );
  }
);
Input.displayName = 'Input';

export { Input };

