import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Image as ExpoImage } from 'expo-image';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface HeaderProps {
  profileImageUri?: string;
  onProfilePress?: () => void;
  onMonthPress?: () => void;
}

export function Header({
  profileImageUri = 'https://i.pravatar.cc/150?img=12',
  onProfilePress,
  onMonthPress,
}: HeaderProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      <TouchableOpacity
        style={[styles.monthSelector, { backgroundColor: '#F3F7F5' }]}
        onPress={onMonthPress}
      >
        <Typography
          variant="body2"
          style={{ color: colors.text }}
        >
          {t('home.thisMonth')}
        </Typography>
        <Icon
          name="chevron-down"
          size={16}
          color="text"
        />
      </TouchableOpacity>
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
