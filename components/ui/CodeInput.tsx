import * as React from 'react';

import { StyleSheet, TextInput, View } from 'react-native';

import { Control, Controller, FieldPath } from 'react-hook-form';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Typography } from './Typography';

export interface CodeInputProps {
  // Number of input fields to render
  length?: number;
  // RHF props (optional)
  name?: FieldPath<any>;
  control?: Control<any>;
  error?: string;
  // Standalone props (when not using RHF)
  value?: string;
  onChangeText?: (value: string) => void;
  // Styling
  size?: number;
  spacing?: number;
  // Other props
  autoFocus?: boolean;
  disabled?: boolean;
  keyboardType?: 'default' | 'numeric' | 'number-pad';
}

const CodeInputComponent = ({
  length = 6,
  value = '',
  onChangeText,
  error,
  size = 56,
  spacing = 12,
  autoFocus = false,
  disabled = false,
  keyboardType = 'numeric',
}: Omit<CodeInputProps, 'name' | 'control'> & {
  value: string;
  onChangeText: (value: string) => void;
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const inputRefs = React.useRef<(TextInput | null)[]>([]);
  const [values, setValues] = React.useState<string[]>(
    value
      .split('')
      .slice(0, length)
      .concat(Array(length - value.length).fill(''))
  );

  React.useEffect(() => {
    const newValues = value
      .split('')
      .slice(0, length)
      .concat(Array(Math.max(0, length - value.length)).fill(''));
    setValues(newValues);
  }, [value, length]);

  const handleChange = (index: number, text: string) => {
    // Only allow single character
    const char = text.slice(-1).replace(/[^0-9]/g, '');

    if (!char && text === '') {
      // Handle backspace
      const newValues = [...values];
      newValues[index] = '';
      setValues(newValues);
      onChangeText(newValues.join(''));

      // Focus previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (char) {
      const newValues = [...values];
      newValues[index] = char;
      setValues(newValues);
      const newValue = newValues.join('');
      onChangeText(newValue);

      // Auto-focus next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // Last input, blur
        inputRefs.current[index]?.blur();
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [autoFocus]);

  return (
    <View style={styles.container}>
      <View style={[styles.inputsContainer, { gap: spacing }]}>
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.input,
              {
                width: size,
                height: size,
                borderColor: error ? '#ef4444' : colors.icon,
                color: colors.text,
                backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
              },
              values[index] && {
                borderColor: error ? '#ef4444' : colors.primary,
                borderWidth: 2,
              },
            ]}
            value={values[index]}
            onChangeText={(text) => handleChange(index, text)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(index, nativeEvent.key)
            }
            keyboardType={keyboardType}
            maxLength={1}
            selectTextOnFocus
            editable={!disabled}
            textAlign="center"
            fontSize={24}
            fontWeight="600"
          />
        ))}
      </View>
      {error && (
        <Typography
          variant="caption"
          style={{
            color: '#ef4444',
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

export const CodeInput = ({
  name,
  control,
  length = 6,
  value,
  onChangeText,
  error,
  ...props
}: CodeInputProps) => {
  // If RHF props are provided, use Controller
  if (name && control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value: fieldValue } }) => (
          <CodeInputComponent
            length={length}
            value={fieldValue || ''}
            onChangeText={onChange}
            error={error}
            {...props}
          />
        )}
      />
    );
  }

  // Standalone mode
  if (value !== undefined && onChangeText) {
    return (
      <CodeInputComponent
        length={length}
        value={value}
        onChangeText={onChangeText}
        error={error}
        {...props}
      />
    );
  }

  // Default: uncontrolled mode
  const [internalValue, setInternalValue] = React.useState('');
  return (
    <CodeInputComponent
      length={length}
      value={internalValue}
      onChangeText={setInternalValue}
      error={error}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    textAlign: 'center',
  },
});
