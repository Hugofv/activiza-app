import * as React from 'react';

import {
  Pressable, StyleSheet, TextInput, type TextInputProps, View,
} from 'react-native';

import { Control, Controller, FieldPath } from 'react-hook-form';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';

import { Typography } from './Typography';

export type InputVariant = 'default' | 'outline';

export interface InputProps extends Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'editable'
> {
  className?: string;
  variant?: InputVariant;
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
            borderColor: hasError
              ? colors.error
              : colors.border,
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
          render={({
 field: {
 onChange, onBlur, value: fieldValue
}
}) => {
            const handleChange = (text: string) => {
              if (disabled) return;
              const formatted = onFormat ? onFormat(text) : text;
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
                  ]}
                  placeholderTextColor={finalPlaceholderColor}
                  value={fieldValue || ''}
                  onChangeText={handleChange}
                  onBlur={onBlur}
                  editable={!isDisabled}
                  {...props}
                />
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

const inputStyles = StyleSheet.create({
  outline: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 48,
  },
});

export { Input };
