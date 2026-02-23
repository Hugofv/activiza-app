import * as React from 'react';

import { type StyleProp, View, type ViewStyle } from 'react-native';

import {
  IconAlertTriangle,
  IconArrowRight,
  IconBrandWhatsapp,
  IconCalendar,
  IconCalendarDot,
  IconCamera,
  IconCar,
  IconClipboardCheck,
  IconMotorbike,
  IconSettings,
  IconTrash,
  IconChartArrowsVertical,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconCurrencyDollar,
  IconCurrencyPound,
  IconCurrencyReal,
  IconDoor,
  IconEye,
  IconEyeOff,
  IconFileText,
  IconHistory,
  IconHomeFilled,
  IconHourglass,
  IconId,
  IconInfoCircle,
  IconMail,
  IconMapPin,
  IconNote,
  IconPencil,
  IconPercentage,
  IconPhoto,
  IconPig,
  IconPlus,
  IconReceipt2,
  IconReload,
  IconSearch,
  IconSquareRoundedPlusFilled,
  IconStar,
  IconStarFilled,
  IconUser,
  IconUserCircle,
  IconUserDollar,
  IconUserFilled,
  IconUserPlus,
  IconUserShare,
  IconUsers,
} from '@tabler/icons-react-native';

import { Colors, ThemeColorKey } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Map old icon names to Tabler icon components
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  // Navigation
  'chevron-back': IconChevronLeft,
  'chevron-left': IconChevronLeft,
  'chevron-forward': IconChevronRight,
  'chevron-right': IconChevronRight,
  'chevron-down': IconChevronDown,
  'chevron-up': IconChevronUp,
  'arrow-forward': IconArrowRight,
  'arrow-right': IconArrowRight,

  // Actions
  checkmark: IconCheck,
  check: IconCheck,
  add: IconPlus,
  plus: IconPlus,
  'square-rounded-plus': IconSquareRoundedPlusFilled,
  note: IconNote,
  search: IconSearch,
  reload: IconReload,

  // Visibility
  'eye-outline': IconEye,
  eye: IconEye,
  'eye-off-outline': IconEyeOff,
  'eye-off': IconEyeOff,

  // Status
  'hourglass-outline': IconHourglass,
  hourglass: IconHourglass,
  'checkmark-circle': IconCircleCheck,
  'close-circle': IconCircleX,
  x: IconCircleX,
  close: IconCircleX,
  'information-circle': IconInfoCircle,
  'info-circle': IconInfoCircle,
  warning: IconAlertTriangle,
  star: IconStar,
  'star-filled': IconStarFilled,
  calendar: IconCalendar,
  'calendar-dots': IconCalendarDot,
  mail: IconMail,
  'map-pin': IconMapPin,
  'user-share': IconUserShare,

  // People
  person: IconUser,
  'user-dollar': IconUserDollar,
  'receipt-2': IconReceipt2,
  user: IconUser,
  'user-filled': IconUserFilled,
  people: IconUsers,
  users: IconUsers,
  'user-circle': IconUserCircle,
  'user-plus': IconUserPlus,
  whatsapp: IconBrandWhatsapp,
  id: IconId,

  // Places
  home: IconHomeFilled,
  car: IconCar,
  motorbike: IconMotorbike,
  motorcycle: IconMotorbike,
  trash: IconTrash,
  settings: IconSettings,
  'clipboard-check': IconClipboardCheck,
  'door-outline': IconDoor,
  door: IconDoor,

  // Business
  'cash-outline': IconCurrencyDollar,
  'document-text-outline': IconFileText,
  'file-text': IconFileText,
  history: IconHistory,
  percentage: IconPercentage,
  'chart-line': IconChartArrowsVertical,
  pig: IconPig,

  // Shapes
  'ellipse-outline': IconCircle,
  circle: IconCircle,
  pencil: IconPencil,

  // Devices
  camera: IconCamera,
  photo: IconPhoto,

  // Currencies
  'currency-dollar': IconCurrencyDollar,
  'currency-pound': IconCurrencyPound,
  'currency-real': IconCurrencyReal,
};

export type IconName = keyof typeof ICON_MAP | string;

/** Theme key (e.g. 'primaryForeground') or raw color (e.g. '#fff', 'rgb(...)') */
export type IconColor = ThemeColorKey | string;

export interface IconProps {
  name: IconName;
  library?: never; // Deprecated - no longer needed with Tabler icons
  size?: number;
  /** Theme color key or raw hex/rgb string */
  color?: IconColor;
  style?: StyleProp<ViewStyle>;
}

function resolveIconColor(
  color: IconColor | undefined,
  colors: Record<ThemeColorKey, string>
): string {
  if (!color) return colors.primaryForeground;
  if (color.startsWith('#') || color.startsWith('rgb')) return color;
  const key = color as ThemeColorKey;
  return key in colors ? colors[key] : color;
}

const Icon = React.forwardRef<any, IconProps>(
  ({ name, size = 24, color, style, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const resolvedColor = resolveIconColor(color, colors);

    // Get the Tabler icon component from the map
    const IconComponent = ICON_MAP[name as string];

    // If icon not found, use a default or show warning
    if (!IconComponent) {
      console.warn(
        `Icon "${name}" not found in icon map. Using Circle as fallback.`
      );
      return (
        <View
          ref={ref}
          style={[
            {
              width: size,
              height: size,
            },
            style,
          ]}
        >
          <IconCircle
            size={size}
            color={resolvedColor}
            strokeWidth={2}
            {...props}
          />
        </View>
      );
    }

    return (
      <View
        ref={ref}
        style={style}
      >
        <IconComponent
          size={size}
          color={resolvedColor}
          strokeWidth={2}
          {...props}
        />
      </View>
    );
  }
);
Icon.displayName = 'Icon';

export { Icon };
