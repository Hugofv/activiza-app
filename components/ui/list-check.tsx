import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Icon } from './icon';
import { Typography } from './typography';

export interface ListCheckOption<T = string> {
  value: T;
  label: string;
  /** Optional custom content to render on the left side (e.g., flag emoji, icon) */
  leftContent?: React.ReactNode;
}

export interface ListCheckProps<T = string> {
  /** Array of options to display */
  options: ListCheckOption<T>[];
  /** Currently selected value */
  selectedValue?: T | null;
  /** Callback when an option is selected */
  onValueChange?: (value: T) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Custom style for the container */
  style?: ViewStyle;
  /** Custom style for individual items */
  itemStyle?: ViewStyle;
  /** Gap between items (default: 12) */
  gap?: number;
}

/**
 * ListCheck component for displaying selectable options with radio buttons
 * Similar to radio button groups but styled as a list
 */
export function ListCheck<T = string>({
  options,
  selectedValue,
  onValueChange,
  disabled = false,
  style,
  itemStyle,
  gap = 12,
}: ListCheckProps<T>) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = (value: T) => {
    if (!disabled && onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <View style={[styles.container, { gap }, style]}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <TouchableOpacity
            key={String(option.value)}
            style={[
              styles.item,
              {
                backgroundColor: isSelected
                  ? colorScheme === 'dark'
                    ? '#1a2a24'
                    : '#effad1'
                  : 'transparent',
                borderColor: isSelected ? colors.primary : colors.icon,
                opacity: disabled ? 0.5 : 1,
              },
              itemStyle,
            ]}
            onPress={() => handlePress(option.value)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              {option.leftContent && (
                <View style={styles.leftContent}>{option.leftContent}</View>
              )}
              <Typography
                variant='body1'
                style={[
                  styles.itemText,
                  {
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {option.label}
              </Typography>
            </View>
            <View
              style={[
                styles.radioButton,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : 'transparent',
                  borderColor: isSelected ? colors.primary : colors.icon,
                },
              ]}
            >
              <Icon
                name='checkmark'
                size={16}
                color={
                  isSelected ? colors.primaryForeground : colors.icon
                }
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  leftContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    flex: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
