import * as React from 'react';

import {
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

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

type AnchorRect = { x: number; y: number; width: number; height: number };

const DROPDOWN_GAP = 6;
const MIN_LIST_HEIGHT = 120;
const MAX_LIST_HEIGHT = 280;
/** Ignore focus-driven open briefly after a list selection (avoids Modal reopening). */
const SUPPRESS_FOCUS_OPEN_MS = 400;

function computeModalDropdownLayout(
  anchor: AnchorRect,
  keyboardHeight: number,
  topInset: number
): { top: number; left: number; width: number; maxHeight: number } | null {
  if (anchor.width <= 0 || anchor.height <= 0) return null;

  const winH = Dimensions.get('window').height;
  const bottomReserve = keyboardHeight + DROPDOWN_GAP;
  const topReserve = topInset + DROPDOWN_GAP;

  const spaceBelow = winH - anchor.y - anchor.height - bottomReserve;
  const spaceAbove = anchor.y - topReserve;

  const openAbove =
    spaceBelow < MIN_LIST_HEIGHT + 40 && spaceAbove > spaceBelow;

  let maxHeight = Math.min(
    MAX_LIST_HEIGHT,
    Math.max(MIN_LIST_HEIGHT, openAbove ? spaceAbove : spaceBelow)
  );

  let top: number;
  if (openAbove) {
    top = anchor.y - maxHeight - DROPDOWN_GAP;
    if (top < topReserve) {
      top = topReserve;
      maxHeight = Math.max(
        MIN_LIST_HEIGHT,
        Math.min(MAX_LIST_HEIGHT, anchor.y - topReserve - DROPDOWN_GAP)
      );
    }
  } else {
    top = anchor.y + anchor.height + DROPDOWN_GAP;
    const overflow = top + maxHeight + bottomReserve - winH;
    if (overflow > 0) {
      maxHeight = Math.max(MIN_LIST_HEIGHT, maxHeight - overflow);
    }
  }

  return {
    top,
    left: anchor.x,
    width: anchor.width,
    maxHeight,
  };
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
  const keyboardHeight = useKeyboardHeight();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [anchorRect, setAnchorRect] = React.useState<AnchorRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const inputRef = React.useRef<TextInput>(null);
  const anchorRef = React.useRef<View>(null);
  const suppressFocusOpenRef = React.useRef(false);
  const suppressFocusTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const topInset = insets.top;

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchQuery, searchable]);

  React.useEffect(
    () => () => {
      if (suppressFocusTimerRef.current) {
        clearTimeout(suppressFocusTimerRef.current);
      }
    },
    []
  );

  const measureAnchor = React.useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setAnchorRect({ x, y, width, height });
      }
    });
  }, []);

  React.useEffect(() => {
    if (!isOpen || filteredOptions.length === 0) return;
    const id = requestAnimationFrame(measureAnchor);
    return () => cancelAnimationFrame(id);
  }, [isOpen, filteredOptions.length, measureAnchor]);

  const modalLayout = React.useMemo(
    () =>
      computeModalDropdownLayout(anchorRect, keyboardHeight, topInset),
    [anchorRect, keyboardHeight, topInset]
  );

  const closeListOnly = React.useCallback(() => {
    setIsOpen(false);
    setAnchorRect({ x: 0, y: 0, width: 0, height: 0 });
    Keyboard.dismiss();
    inputRef.current?.blur();
  }, []);

  const handleSelect = React.useCallback(
    (option: AutocompleteOption<T>) => {
      if (suppressFocusTimerRef.current) {
        clearTimeout(suppressFocusTimerRef.current);
      }
      suppressFocusOpenRef.current = true;
      closeListOnly();
      setSearchQuery('');

      requestAnimationFrame(() => {
        onValueChange(option.value);
      });

      suppressFocusTimerRef.current = setTimeout(() => {
        suppressFocusOpenRef.current = false;
        suppressFocusTimerRef.current = null;
      }, SUPPRESS_FOCUS_OPEN_MS);
    },
    [closeListOnly, onValueChange]
  );

  const handleInputFocus = () => {
    if (suppressFocusOpenRef.current) {
      return;
    }
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Intentionally empty: closing is handled by selection, backdrop, or chevron.
  };

  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    if (onSearchChange) {
      onSearchChange(text);
    }
    if (!isOpen && !suppressFocusOpenRef.current) {
      setIsOpen(true);
    }
  };

  const closeDropdown = React.useCallback(() => {
    closeListOnly();
  }, [closeListOnly]);

  const winW = Dimensions.get('window').width;

  const effectiveLayout =
    modalLayout ??
    (isOpen && filteredOptions.length > 0
      ? {
          top: topInset + 72,
          left: 24,
          width: Math.max(200, winW - 48),
          maxHeight: MAX_LIST_HEIGHT,
        }
      : null);

  const showModal = isOpen && filteredOptions.length > 0 && effectiveLayout != null;

  const renderOption = React.useCallback(
    ({ item }: { item: AutocompleteOption<T> }) => {
      const isSelected = item.value === value;
      return (
        <TouchableOpacity
          activeOpacity={0.65}
          onPress={() => handleSelect(item)}
          style={[
            styles.option,
            isSelected && { backgroundColor: colors.muted },
          ]}
        >
          <Typography
            variant="body1"
            pointerEvents="none"
            style={[
              styles.optionText,
              {
                color: isSelected ? colors.primaryForeground : colors.text,
                fontWeight: isSelected ? '600' : '400',
              },
            ]}
          >
            {item.label}
          </Typography>
          {isSelected ? (
            <Icon
              name="check"
              size={20}
              color="primaryForeground"
            />
          ) : null}
        </TouchableOpacity>
      );
    },
    [colors.muted, colors.primaryForeground, colors.text, handleSelect, value]
  );

  const keyExtractor = React.useCallback(
    (item: AutocompleteOption<T>, index: number) =>
      `${String(item.value)}-${index}`,
    []
  );

  return (
    <View
      style={[
        styles.container,
        isOpen &&
          (Platform.OS === 'android'
            ? styles.containerOpenAndroid
            : styles.containerOpenIos),
      ]}
    >
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
        ref={anchorRef}
        collapsable={false}
        onLayout={() => {
          if (isOpen) {
            requestAnimationFrame(measureAnchor);
          }
        }}
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
              const next = !isOpen;
              setIsOpen(next);
              if (next) {
                requestAnimationFrame(() => measureAnchor());
                inputRef.current?.focus();
              } else {
                closeListOnly();
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

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={closeDropdown}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeDropdown}
          />
          {effectiveLayout ? (
            <View
              style={[
                styles.modalDropdown,
                {
                  top: effectiveLayout.top,
                  left: effectiveLayout.left,
                  width: effectiveLayout.width,
                  maxHeight: effectiveLayout.maxHeight,
                  backgroundColor: colors.background,
                  shadowColor: colors.icon,
                },
              ]}
              collapsable={false}
            >
              <FlatList
                data={filteredOptions}
                keyExtractor={keyExtractor}
                renderItem={renderOption}
                style={{ maxHeight: effectiveLayout.maxHeight }}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
                showsVerticalScrollIndicator
                bounces={false}
              />
            </View>
          ) : null}
        </View>
      </Modal>

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
  containerOpenAndroid: {
    zIndex: 10000,
    elevation: 24,
  },
  containerOpenIos: {
    zIndex: 100,
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
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
    zIndex: 0,
  },
  modalDropdown: {
    position: 'absolute',
    zIndex: 10,
    borderRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 24,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
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
