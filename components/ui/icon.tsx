import {
  IconAlertTriangle,
  IconArrowRight,
  IconBrandWhatsapp,
  IconCalendar,
  IconCalendarDot,
  IconCamera,
  IconCar,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconCurrencyDollar,
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
  IconPhoto,
  IconPlus,
  IconReceipt2,
  IconSquareRoundedPlusFilled,
  IconStar,
  IconStarFilled,
  IconUser,
  IconUserCircle,
  IconUserDollar,
  IconUserFilled,
  IconUserPlus,
  IconUsers,
  IconUserShare
} from '@tabler/icons-react-native';
import * as React from 'react';
import { type StyleProp, type ViewStyle, View } from 'react-native';

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
  'checkmark': IconCheck,
  'check': IconCheck,
  'add': IconPlus,
  'plus': IconPlus,
  'square-rounded-plus': IconSquareRoundedPlusFilled,
  'note': IconNote,

  // Visibility
  'eye-outline': IconEye,
  'eye': IconEye,
  'eye-off-outline': IconEyeOff,
  'eye-off': IconEyeOff,

  // Status
  'hourglass-outline': IconHourglass,
  'hourglass': IconHourglass,
  'checkmark-circle': IconCircleCheck,
  'close-circle': IconCircleX,
  'x': IconCircleX,
  'close': IconCircleX,
  'information-circle': IconInfoCircle,
  'info-circle': IconInfoCircle,
  'warning': IconAlertTriangle,
  'star': IconStar,
  'star-filled': IconStarFilled,
  'calendar': IconCalendar,
  'calendar-dots': IconCalendarDot,
  'mail': IconMail,
  'map-pin': IconMapPin,
  'user-share': IconUserShare,

  // People
  'person': IconUser,
  'user-dollar': IconUserDollar,
  'receipt-2': IconReceipt2,
  'user': IconUser,
  'user-filled': IconUserFilled,
  'people': IconUsers,
  'users': IconUsers,
  'user-circle': IconUserCircle,
  'user-plus': IconUserPlus,
  'whatsapp': IconBrandWhatsapp,
  'id': IconId,

  // Places
  'home': IconHomeFilled,
  'car': IconCar,
  'door-outline': IconDoor,
  'door': IconDoor,

  // Business
  'cash-outline': IconCurrencyDollar,
  'currency-dollar': IconCurrencyDollar,
  'document-text-outline': IconFileText,
  'file-text': IconFileText,
  'history': IconHistory,

  // Shapes
  'ellipse-outline': IconCircle,
  'circle': IconCircle,

  // Devices
  'camera': IconCamera,
  'photo': IconPhoto,
};

export type IconName = keyof typeof ICON_MAP | string;

export interface IconProps {
  name: IconName;
  library?: never; // Deprecated - no longer needed with Tabler icons
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const Icon = React.forwardRef<any, IconProps>(
  ({ name, library, size = 24, color, style, ...props }, ref) => {
    // Get the Tabler icon component from the map
    const IconComponent = ICON_MAP[name as string];

    // If icon not found, use a default or show warning
    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in icon map. Using Circle as fallback.`);
      return (
        <View ref={ref} style={[{ width: size, height: size }, style]}>
          <IconCircle size={size} color={color || '#000000'} strokeWidth={2} {...props} />
        </View>
      );
    }

    // Render the Tabler icon
    return (
      <View ref={ref} style={style}>
        <IconComponent size={size} color={color || '#000000'} strokeWidth={2} {...props} />
      </View>
    );
  }
);
Icon.displayName = 'Icon';

export { Icon };
