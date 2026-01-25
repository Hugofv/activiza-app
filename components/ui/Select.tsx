import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from './Icon';
import { Typography } from './Typography';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value: T | null;
  onValueChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  style?: any;
}

/**
 * Simple Select component for dropdown selection (inline, no modal)
 */
export function Select<T = string>({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  disabled = false,
  style,
}: SelectProps<T>) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option: SelectOption<T>) => {
    onValueChange(option.value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      // This allows the dropdown to render first
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.container]}>
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: colors.muted,
              borderColor: colors.icon,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
          onPress={handleToggle}
          disabled={disabled}
        >
          <Typography
            variant="body2"
            style={[styles.buttonText, { color: colors.text }]}
          >
            {selectedOption?.label || placeholder}
          </Typography>
          <Icon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.icon}
          />
        </Pressable>

        {isOpen && options.length > 0 && (
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.background,
                borderColor: colors.icon,
                shadowColor: colors.text,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              style={styles.list}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={`${option.value}-${index}`}
                    onPress={() => handleSelect(option)}
                    style={[
                      styles.option,
                      isSelected && { backgroundColor: colors.muted },
                    ]}
                  >
                    <Typography
                      variant="body1"
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {option.label}
                    </Typography>
                    {isSelected && (
                      <Icon name="check" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Invisible overlay to close dropdown when clicking outside */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 1,
  },
  container: {
    position: 'relative',
    zIndex: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 8,
    marginTop: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  list: {
    maxHeight: 200,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});
