import * as React from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Icon } from './Icon';
import { Typography } from './Typography';

export interface AutocompleteOption<T = string> {
  value: T;
  label: string;
}

export type AutocompleteVariant = 'default' | 'filled';

export interface AutocompleteProps<T = string> {
  options: AutocompleteOption<T>[];
  value: T | null;
  onValueChange: (value: T) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  variant?: AutocompleteVariant;
  /**
   * Optional callback fired whenever the internal search query changes.
   * Useful for implementing remote search with debounce in the parent.
   */
  onSearchChange?: (query: string) => void;
}

export function Autocomplete<T = string>({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  searchable = true,
  disabled = false,
  error,
  label,
  variant = 'default',
  onSearchChange,
}: AutocompleteProps<T>) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const inputRef = React.useRef<TextInput>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchQuery, searchable]);

  const handleSelect = (option: AutocompleteOption<T>) => {
    onValueChange(option.value);
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow option selection
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    if (onSearchChange) {
      onSearchChange(text);
    }
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typography
          variant="body2"
          color="text"
          style={[styles.label]}
        >
          {label}
        </Typography>
      )}
      <View
        style={[
          styles.inputContainer,
          variant === 'filled' && [
            styles.inputContainerFilled,
            { backgroundColor: colors.muted },
          ],
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            variant === 'filled' ? styles.inputFilled : styles.input,
            {
              color: disabled ? colors.icon : colors.text,
              opacity: disabled ? 0.6 : 1,
            },
            variant !== 'filled' && {
              borderBottomColor: error ? colors.error : colors.icon,
            },
          ]}
          placeholder={selectedOption?.label || placeholder}
          placeholderTextColor={colors.placeholder}
          value={
            isOpen && searchable ? searchQuery : selectedOption?.label || ''
          }
          onChangeText={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          editable={!disabled}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          onPress={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              if (!isOpen) {
                inputRef.current?.focus();
              } else {
                inputRef.current?.blur();
              }
            }
          }}
          style={styles.iconButton}
          disabled={disabled}
        >
          <Icon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={disabled ? colors.icon : colors.text}
          />
        </Pressable>
      </View>

      {isOpen && filteredOptions.length > 0 && (
        <>
          {/* Backdrop to close the list when clicking outside */}
          <Pressable
            style={styles.backdrop}
            onPress={() => {
              setIsOpen(false);
              inputRef.current?.blur();
            }}
          />
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.background,
                shadowColor: colors.icon,
              },
            ]}
          >
            <ScrollView
              style={styles.list}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {filteredOptions.map((item, index) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    key={`${item.value}-${index}`}
                    onPress={() => handleSelect(item)}
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
                          color: isSelected
                            ? colors.primaryForeground
                            : colors.text,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {item.label}
                    </Typography>
                    {isSelected && (
                      <Icon
                        name="check"
                        size={20}
                        color="primaryForeground"
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </>
      )}

      {error && (
        <Typography
          variant="caption"
          color="error"
          style={[styles.error]}
        >
          {error}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerFilled: {
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingRight: 40,
    borderBottomWidth: 1.5,
  },
  inputFilled: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 8,
    paddingRight: 32,
  },
  iconButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    zIndex: 2,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 8,
    marginTop: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1001,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  list: { maxHeight: 200 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
});
