import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Icon } from './icon';

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: any;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  CheckboxProps
>(
  (
    { checked = false, onCheckedChange, disabled = false, style, ...props },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const handlePress = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? colors.primary : 'transparent',
            borderColor: checked ? colors.primary : colors.icon,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        {...props}
      >
        {checked && (
          <Icon
            name='checkmark'
            size={16}
            color={checked ? colors.primaryForeground : colors.text}
            library='ionicons'
          />
        )}
      </Pressable>
    );
  }
);
Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { Checkbox };
