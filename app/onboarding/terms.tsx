import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { Progress } from '@/components/ui/progress';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

/**
 * Terms and conditions screen for onboarding
 */
const TermsScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { updateFormData } = useOnboardingForm();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    if (termsAccepted && privacyAccepted) {
      // Update form data and save to API with step tracking (unified)
      setIsSubmitting(true);
      try {
        await updateFormData({
          termsAccepted: true,
          privacyAccepted: true,
        }, 'terms');
        router.push('/onboarding/customization');
      } catch (error: any) {
        console.error('Failed to save terms step:', error);
        Alert.alert(
          t('common.error') || 'Error',
          error?.response?.data?.message || error?.message || t('onboarding.saveError') || 'Failed to save. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isContinueDisabled = !termsAccepted || !privacyAccepted;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Progress value={97} />
            </View>

            {/* Back Button */}
            <IconButton
              variant='secondary'
              size='sm'
              icon='chevron-back'
              iconSize={32}
              iconColor={colors.primary}
              onPress={handleBack}
            />

            {/* Title */}
            <Typography variant='h4'>{t('onboarding.termsTitle')}</Typography>

            {/* Description */}
            <Typography
              variant='body2'
              style={[styles.description, { color: colors.icon }]}
            >
              {t('onboarding.termsDescription')}
            </Typography>

            {/* Terms and Privacy Checkboxes */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.checkboxesContainer}>
                {/* Terms of Use */}
                <View style={styles.checkboxRow}>
                  <Checkbox
                    checked={termsAccepted}
                    onCheckedChange={setTermsAccepted}
                  />
                  <View style={styles.checkboxLabelContainer}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant='body2'
                        style={[styles.checkboxLabel, { color: colors.text }]}
                      >
                        {t('onboarding.termsAccept')}{' '}
                      </Typography>
                      <Dialog
                        open={termsModalOpen}
                        onOpenChange={setTermsModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Pressable>
                            <Typography
                              variant='body2'
                              style={[styles.link, { color: colors.primary }]}
                            >
                              {t('onboarding.termsOfUse')}
                            </Typography>
                          </Pressable>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {t('onboarding.termsOfUse')}
                            </DialogTitle>
                            <DialogDescription>
                              {t('onboarding.termsLastUpdated')}
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollView style={styles.modalScrollView}>
                            <Typography
                              variant='body2'
                              style={[styles.modalText, { color: colors.text }]}
                            >
                              {t('onboarding.termsContent')}
                            </Typography>
                          </ScrollView>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button size='sm'>{t('common.close')}</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </View>
                  </View>
                </View>

                {/* Privacy Policy */}
                <View style={styles.checkboxRow}>
                  <Checkbox
                    checked={privacyAccepted}
                    onCheckedChange={setPrivacyAccepted}
                  />
                  <View style={styles.checkboxLabelContainer}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant='body2'
                        style={[styles.checkboxLabel, { color: colors.text }]}
                      >
                        {t('onboarding.privacyAccept')}{' '}
                      </Typography>
                      <Dialog
                        open={privacyModalOpen}
                        onOpenChange={setPrivacyModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Pressable>
                            <Typography
                              variant='body2'
                              style={[styles.link, { color: colors.primary }]}
                            >
                              {t('onboarding.privacyPolicy')}
                            </Typography>
                          </Pressable>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {t('onboarding.privacyPolicy')}
                            </DialogTitle>
                            <DialogDescription>
                              {t('onboarding.privacyLastUpdated')}
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollView style={styles.modalScrollView}>
                            <Typography
                              variant='body2'
                              style={[styles.modalText, { color: colors.text }]}
                            >
                              {t('onboarding.privacyContent')}
                            </Typography>
                          </ScrollView>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button size='sm'>{t('common.close')}</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant='primary'
              size='lg'
              icon='arrow-forward'
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleContinue}
              disabled={isContinueDisabled}
              loading={isSubmitting}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TermsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  progressContainer: {
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },
  checkboxesContainer: {
    marginTop: 8,
    gap: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  modalScrollView: {
    maxHeight: 400,
    marginVertical: 16,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
