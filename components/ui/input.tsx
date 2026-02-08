import * as React from 'react';

import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { Control, Controller, FieldPath } from 'react-hook-form';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';

import { Typography } from './Typography';

export type InputVariant = 'default' | 'outline';
export type InputType = 'text' | 'percentage';

export interface InputProps extends Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'editable'
> {
  className?: string;
  variant?: InputVariant;
  /** Built-in input type with automatic formatting (default: 'text') */
  type?: InputType;
  /** Visual suffix rendered after the input value (e.g. '%', 'kg') */
  suffix?: string;
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
  (
    {
      className,
      placeholderTextColor,
      style,
      variant = 'default',
      type = 'text',
      suffix,
      name,
      control,
      error,
      onFormat,
      value,
      onChangeText,
      label,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<TextInput>(null);

    // Merge forwarded ref with internal ref
    React.useImperativeHandle(ref, () => inputRef.current as TextInput);

    const focusInput = () => {
      inputRef.current?.focus();
    };

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isOutline = variant === 'outline';

    // Built-in percentage formatter (money-mask style: right-to-left fill)
    // e.g. "1" → "0,01", "12" → "0,12", "123" → "1,23", "10000" → "100,00"
    const percentageFormatter = (text: string): string => {
      const digits = text.replace(/[^\d]/g, '');
      if (!digits) return '';

      // Remove leading zeros but keep at least one digit
      const cleaned = digits.replace(/^0+/, '') || '0';

      // Cap at 10000 (= 100,00%)
      const capped = Math.min(parseInt(cleaned, 10), 10000);
      const padded = String(capped).padStart(3, '0');

      const integerPart = padded.slice(0, -2);
      const decimalPart = padded.slice(-2);

      return `${integerPart},${decimalPart}`;
    };

    // Resolve formatter, keyboard type, and suffix based on input type
    const resolvedFormatter =
      type === 'percentage' ? (onFormat ?? percentageFormatter) : onFormat;
    const resolvedKeyboardType =
      type === 'percentage'
        ? (props.keyboardType ?? 'number-pad')
        : props.keyboardType;
    const resolvedSuffix =
      type === 'percentage' ? (suffix ?? '%') : suffix;

    // Use theme-based placeholder color (lighter when disabled, better contrast when enabled)
    const finalPlaceholderColor = disabled
      ? colors.disabledPlaceholder
      : placeholderTextColor || colors.placeholder;

    const getInputStyle = (
      isDisabled: boolean,
      hasError: boolean,
      extraStyle?: any
    ) => {
      if (isOutline) {
        return [
          inputStyles.outline,
          {
            color: isDisabled ? colors.icon : colors.text,
            borderColor: hasError ? colors.error : colors.border,
            backgroundColor: colors.background,
            opacity: isDisabled ? 0.6 : 1,
          },
          hasError && { borderColor: colors.error },
          extraStyle,
        ];
      }
      return [
        {
          color: isDisabled ? colors.icon : colors.text,
          height: 30,
          borderWidth: 0,
          borderBottomWidth: 1.5,
          borderBottomColor: hasError
            ? colors.error
            : (extraStyle as any)?.borderBottomColor || colors.icon,
          opacity: isDisabled ? 0.6 : 1,
        },
        hasError && { borderBottomColor: colors.error },
        extraStyle,
      ];
    };

    const labelStyle = isOutline
      ? {
          fontSize: 14,
          fontWeight: '500' as const,
          fontFamily: 'Inter_500Medium',
          color: colors.text,
        }
      : {
          fontSize: 14,
          fontWeight: '500' as const,
          fontFamily: 'Inter_500Medium',
          color: colors.text,
        };

    // If RHF props are provided, use Controller
    if (name && control) {
      return (
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value: fieldValue } }) => {
            const handleChange = (text: string) => {
              if (disabled) return;
              const formatted = resolvedFormatter
                ? resolvedFormatter(text)
                : text;
              onChange(formatted);
            };

            const isDisabled = disabled || false;

            return (
              <View style={{ gap: isOutline ? 6 : 4 }}>
                {label && (
                  <Pressable onPress={focusInput}>
                    <Typography
                      variant={isOutline ? 'body2Medium' : 'body1'}
                      style={labelStyle}
                    >
                      {label}
                    </Typography>
                  </Pressable>
                )}
                <View style={resolvedSuffix ? inputStyles.row : undefined}>
                  <TextInput
                    ref={inputRef}
                    className={cn(
                      isOutline
                        ? 'flex w-full text-base'
                        : 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg',
                      className
                    )}
                    style={[
                      ...getInputStyle(isDisabled, !!error, style),
                      resolvedSuffix ? { flex: 1 } : undefined,
                    ]}
                    placeholderTextColor={finalPlaceholderColor}
                    value={fieldValue || ''}
                    onChangeText={handleChange}
                    onBlur={onBlur}
                    editable={!isDisabled}
                    keyboardType={resolvedKeyboardType}
                    {...props}
                  />
                  {resolvedSuffix && (fieldValue || '') !== '' && (
                    <Typography
                      variant="body1"
                      style={{
                        color: isDisabled ? colors.icon : colors.text,
                        alignSelf: 'center',
                      }}
                    >
                      {resolvedSuffix}
                    </Typography>
                  )}
                </View>
                {error && (
                  <Typography
                    variant="caption"
                    style={{
                      color: colors.error,
                      marginTop: 2,
                    }}
                  >
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
      <View style={{ gap: isOutline ? 6 : 4 }}>
        {label && (
          <Pressable onPress={focusInput}>
            <Typography
              variant={isOutline ? 'body2Medium' : 'body1'}
              style={labelStyle}
            >
              {label}
            </Typography>
          </Pressable>
        )}
        <View style={resolvedSuffix ? inputStyles.row : undefined}>
          <TextInput
            ref={inputRef}
            className={cn(
              isOutline
                ? 'flex w-full text-base'
                : 'flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-lg',
              className
            )}
            style={[
              ...getInputStyle(isDisabled, false, style),
              resolvedSuffix ? { flex: 1 } : undefined,
            ]}
            placeholderTextColor={finalPlaceholderColor}
            value={value}
            onChangeText={onChangeText}
            editable={!isDisabled}
            keyboardType={resolvedKeyboardType}
            {...props}
          />
          {resolvedSuffix && (value || '') !== '' && (
            <Typography
              variant="body1"
              style={{
                color: isDisabled ? colors.icon : colors.text,
                alignSelf: 'center',
              }}
            >
              {resolvedSuffix}
            </Typography>
          )}
        </View>
      </View>
    );
  }
);
Input.displayName = 'Input';

const inputStyles = StyleSheet.create({
  outline: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export { Input };
