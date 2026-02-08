import { useEffect, useMemo } from 'react';

import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/themeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { isAuthenticated, isChecking, redirectToLogin } = useAuthGuard();
  const { user, logoutAsync, isLoggingOut } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      console.log(
        '[ProfileScreen] User not authenticated, calling redirectToLogin("profile")'
      );
      redirectToLogin('profile');
    }
  }, [isAuthenticated, isChecking, redirectToLogin]);

  const initials = useMemo(() => {
    if (!user?.name) return '?';
    const parts = user.name.split(' ').filter(Boolean);
    if (!parts.length) return '?';
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }, [user?.name]);

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // After clearing tokens, send user back to landing/auth flow
      router.replace('/');
    }
  };

  if (isChecking) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h4">{t('common.profile')}</Typography>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primaryWhitenOpacity },
            ]}
          >
            <Typography
              variant="h4"
              style={{ color: colors.primaryForeground }}
            >
              {initials}
            </Typography>
          </View>

          <View style={styles.info}>
            <Typography
              variant="body1SemiBold"
              style={[styles.name, { color: colors.text }]}
            >
              {user?.name || t('common.name')}
            </Typography>
            <Typography
              variant="body2"
              style={[styles.email, { color: colors.placeholder }]}
            >
              {user?.email}
            </Typography>
          </View>
        </View>

        <View style={[styles.themeSection, { backgroundColor: colors.muted }]}>
          <Typography
            variant="body1SemiBold"
            style={[styles.themeTitle, { color: colors.text }]}
          >
            {t('common.theme')}
          </Typography>
          {(['light', 'dark', 'system'] as const).map((option) => (
            <Pressable
              key={option}
              style={[
                styles.themeOption,
                option === theme?.preference && {
                  backgroundColor: colors.primaryWhitenOpacity,
                },
              ]}
              onPress={() => theme?.setPreference(option)}
            >
              <Typography
                variant="body1"
                style={{ color: colors.text }}
              >
                {t(
                  option === 'light'
                    ? 'common.themeLight'
                    : option === 'dark'
                      ? 'common.themeDark'
                      : 'common.themeSystem'
                )}
              </Typography>
              {theme?.preference === option && (
                <Icon
                  name="checkmark-circle"
                  size={22}
                  color={colors.primary}
                />
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            variant="secondary"
            size="full"
            onPress={handleLogout}
            loading={isLoggingOut}
          >
            {t('common.logout')}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: { marginBottom: 24 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { marginBottom: 4 },
  email: {},
  themeSection: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginTop: 16,
  },
  themeTitle: { marginBottom: 4 },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
