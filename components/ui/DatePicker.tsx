import * as React from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Control, Controller, FieldPath } from 'react-hook-form';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  formatDate,
  formatDateTime,
  formatShortDate,
  formatTime,
} from '@/lib/utils/dateFormat';

import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Icon } from './Icon';
import { Typography } from './Typography';

export type DatePickerMode = 'date' | 'time' | 'datetime';
export type DatePickerVariant = 'default' | 'outline';

/**
 * Formats a Date for display in the picker field.
 * Uses the centralized dateFormat helper which auto-resolves the i18n locale.
 */
function formatPickerDisplay(
  date: Date,
  mode: DatePickerMode,
  locale?: string,
  customFormat?: string
): string {
  if (customFormat) {
    return formatDate(date, customFormat, locale);
  }

  if (mode === 'time') return formatTime(date, locale);
  if (mode === 'datetime') return formatDateTime(date, locale);
  return formatShortDate(date, locale);
}

export interface DatePickerProps {
  mode?: DatePickerMode;
  variant?: DatePickerVariant;
  /** date-fns locale key (default: 'pt-BR') */
  locale?: string;
  /** Custom date-fns format string (e.g. 'yyyy-MM-dd'). Overrides mode default. */
  dateFormat?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  style?: any;
  // RHF
  control?: Control<any>;
  name?: FieldPath<any>;
  // Standalone
  value?: Date | null;
  onChange?: (date: Date) => void;
}

/**
 * DatePicker component styled like Input.
 * Opens the native date/time picker inside a BottomSheet on press.
 * The value is only committed when the user confirms.
 * Works with react-hook-form or as a standalone controlled component.
 */
export function DatePicker({
  mode = 'date',
  variant = 'default',
  locale = 'pt-BR',
  dateFormat,
  label,
  placeholder,
  error,
  disabled = false,
  minimumDate,
  maximumDate,
  style,
  control,
  name,
  value,
  onChange,
}: DatePickerProps) {
  if (name && control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange: fieldOnChange, value: fieldValue } }) => (
          <DatePickerInner
            mode={mode}
            variant={variant}
            locale={locale}
            dateFormat={dateFormat}
            label={label}
            placeholder={placeholder}
            error={error}
            disabled={disabled}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={style}
            value={fieldValue ?? null}
            onChange={fieldOnChange}
          />
        )}
      />
    );
  }

  return (
    <DatePickerInner
      mode={mode}
      variant={variant}
      locale={locale}
      dateFormat={dateFormat}
      label={label}
      placeholder={placeholder}
      error={error}
      disabled={disabled}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      style={style}
      value={value ?? null}
      onChange={onChange}
    />
  );
}

// ---------------------------------------------------------------------------
// Inner component (handles picker state and rendering)
// ---------------------------------------------------------------------------

interface DatePickerInnerProps {
  mode: DatePickerMode;
  variant: DatePickerVariant;
  locale: string;
  dateFormat?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  style?: any;
  value: Date | null;
  onChange?: (date: Date) => void;
}

function DatePickerInner({
  mode,
  variant,
  locale,
  dateFormat,
  label,
  placeholder,
  error,
  disabled,
  minimumDate,
  maximumDate,
  style,
  value,
  onChange,
}: DatePickerInnerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isOutline = variant === 'outline';

  const [visible, setVisible] = React.useState(false);
  // Draft value while the bottom sheet is open – not committed until confirm
  const [draft, setDraft] = React.useState<Date>(new Date());
  // For datetime mode: which step is currently shown
  const [step, setStep] = React.useState<'date' | 'time'>('date');

  const displayText =
    value instanceof Date
      ? formatPickerDisplay(value, mode, locale, dateFormat)
      : null;

  const defaultPlaceholder =
    placeholder ??
    (mode === 'time'
      ? '--:--'
      : mode === 'datetime'
        ? '__/__/____ --:--'
        : '__/__/____');

  const handleOpen = () => {
    if (disabled) return;
    setDraft(value instanceof Date ? new Date(value.getTime()) : new Date());
    setStep('date');
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleConfirm = () => {
    if (mode === 'datetime' && step === 'date') {
      // Move to time step instead of confirming
      setStep('time');
      return;
    }
    onChange?.(draft);
    setVisible(false);
  };

  const handlePickerChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (mode === 'datetime' && step === 'time') {
        // Merge the time into the draft date
        const merged = new Date(draft);
        merged.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setDraft(merged);
      } else {
        setDraft(selectedDate);
      }
    }
  };

  const labelStyle = {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: 'Inter_500Medium',
    color: colors.text,
  };

  const getFieldStyle = () => {
    const hasError = !!error;

    if (isOutline) {
      return [
        styles.fieldOutline,
        {
          borderColor: hasError ? colors.error : colors.border,
          backgroundColor: colors.background,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ];
    }

    return [
      styles.fieldDefault,
      {
        borderBottomColor: hasError ? colors.error : colors.icon,
        opacity: disabled ? 0.6 : 1,
      },
      style,
    ];
  };

  const currentPickerMode: 'date' | 'time' =
    mode === 'datetime' ? step : mode;

  const sheetTitle =
    mode === 'datetime' && step === 'time'
      ? label
        ? `${label} - Hora`
        : 'Hora'
      : label ?? '';

  const confirmLabel =
    mode === 'datetime' && step === 'date' ? 'Próximo' : 'OK';

  return (
    <View style={{ gap: isOutline ? 6 : 4 }}>
      {label && (
        <Pressable onPress={handleOpen}>
          <Typography
            variant={isOutline ? 'body2Medium' : 'body1'}
            style={labelStyle}
          >
            {label}
          </Typography>
        </Pressable>
      )}

      <Pressable
        onPress={handleOpen}
        disabled={disabled}
        style={getFieldStyle()}
      >
        <Typography
          variant="body2"
          style={{
            flex: 1,
            color: displayText ? colors.text : colors.placeholder,
            fontSize: isOutline ? 16 : 14,
          }}
        >
          {displayText ?? defaultPlaceholder}
        </Typography>
        <Icon
          name={mode === 'time' ? 'history' : 'calendar'}
          size={isOutline ? 28 : 24}
          color="icon"
        />
      </Pressable>

      {error && (
        <Typography
          variant="caption"
          style={{ color: colors.error, marginTop: 2 }}
        >
          {error}
        </Typography>
      )}

      <BottomSheet
        visible={visible}
        onClose={handleClose}
        title={sheetTitle}
      >
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={draft}
            mode={currentPickerMode}
            display="spinner"
            onChange={handlePickerChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale={locale}
          />
          <Button
            variant="primary"
            size="full"
            onPress={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldDefault: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    borderBottomWidth: 1.5,
  },
  fieldOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
  },
  pickerContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
});
