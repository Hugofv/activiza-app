import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Image as ExpoImage } from 'expo-image';

import { useTranslation } from 'react-i18next';

import { TFunction } from 'i18next';
import { Select } from '../ui/Select';

interface HeaderProps {
  profileImageUri?: string;
  onProfilePress?: () => void;
  onMonthPress?: () => void;
}

const MONTH_OPTIONS = (t: TFunction<"translation", undefined>) => [
  {
    value: 'thisMonth',
    label: t('home.thisMonth'),
  },
]

export function Header({
  profileImageUri = 'https://i.pravatar.cc/150?img=12',
  onProfilePress,
  onMonthPress,
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
          value={null}
          onValueChange={(value) => onMonthPress?.()}
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
