import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Image as ExpoImage } from 'expo-image';

import { useTranslation } from 'react-i18next';

import { TFunction } from 'i18next';
import { Select } from '../ui/Select';

interface HeaderProps {
  period: string;
  profileImageUri?: string;
  onProfilePress?: () => void;
  onPeriodChange?: (period: string) => void;
}

const MONTH_OPTIONS = (t: TFunction<"translation", undefined>) => [
  {
    value: 'last_month',
    label: t('home.pastMonth'),
  },
  {
    value: 'this_month',
    label: t('home.thisMonth'),
  },
  {
    value: 'this_week',
    label: t('home.thisWeek'),
  },
  {
    value: 'this_year',
    label: t('home.thisYear'),
  },
]

export function Header({
  period,
  profileImageUri = 'https://i.pravatar.cc/150?img=12',
  onProfilePress,
  onPeriodChange,
}: HeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={onProfilePress}
      >
        <ExpoImage
          source={{ uri: profileImageUri }}
          style={styles.profileImage}
          contentFit="cover"
        />
      </TouchableOpacity>

      <View>
        <Select
          variant="filled"
          options={MONTH_OPTIONS(t)}
          value={period}
          onValueChange={(value) => onPeriodChange?.(value)}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
});
