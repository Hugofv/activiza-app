import { useCallback } from 'react';

import { useNavigation } from '@react-navigation/native';
import { type Href, router, usePathname } from 'expo-router';

import { BackButton, type BackButtonProps } from '@/components/ui/BackButton';
import { getOnboardingPreviousHref } from '@/lib/config/onboardingSteps';

/**
 * Back handler for onboarding when the stack was reset (e.g. `router.replace` after resume):
 * avoids `replace('/')`, which sends authenticated users back into onboarding via AuthGuard.
 */
export function useOnboardingBackHandler(): () => void {
  const navigation = useNavigation();
  const pathname = usePathname();

  return useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    const previous = getOnboardingPreviousHref(pathname);
    if (previous) {
      router.replace(previous as Href);
      return;
    }
    router.replace('/(tabs)/home' as Href);
  }, [navigation, pathname]);
}

export type OnboardingBackButtonProps = Omit<BackButtonProps, 'onPress'>;

export function OnboardingBackButton(props: OnboardingBackButtonProps) {
  const onBack = useOnboardingBackHandler();
  return (
    <BackButton
      {...props}
      onPress={onBack}
    />
  );
}
