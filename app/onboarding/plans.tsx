import { router } from 'expo-router';
import { useState } from 'react';
import {
   Alert,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
   StyleSheet,
   View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Progress } from '@/components/ui/progress';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

type PlanId = 'free' | 'basic' | 'premium';

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  description: string;
  features: string[];
}

// TODO: Replace with actual plans from API or configuration
const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$ 0',
    description: 'Perfeito para começar',
    features: ['Até 10 clientes', 'Funcionalidades básicas'],
  },
  {
    id: 'basic',
    name: 'Básico',
    price: 'R$ 99/mês',
    description: 'Para pequenos negócios',
    features: ['Até 100 clientes', 'Funcionalidades avançadas', 'Suporte por email'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 299/mês',
    description: 'Para grandes negócios',
    features: ['Clientes ilimitados', 'Todas as funcionalidades', 'Suporte prioritário'],
  },
];

/**
 * Plans selection screen for onboarding
 * This is the final step before completing onboarding
 */
const PlansScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { submitFormData } = useOnboardingForm();
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleFinish = async () => {
    if (!selectedPlan) return;

    setIsSubmitting(true);
    try {
      // Submit the complete onboarding (this creates/updates the account with userId)
      // This is the final step - API will mark onboarding as COMPLETED
      await submitFormData();
      
      // TODO: Save selected plan to API (separate call or included in submitFormData)
      // For now, we'll just complete the onboarding
      
      router.push('/onboarding/registerFinished');
    } catch (error: any) {
      console.error('Failed to finish onboarding:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error?.response?.data?.message || error?.message || t('onboarding.submitError') || 'Failed to complete registration. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedView style={styles.content}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Progress value={100} />
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
              <Typography variant='h4' style={styles.title}>
                {t('onboarding.choosePlan') || 'Escolha seu plano'}
              </Typography>

              {/* Description */}
              <Typography variant='body2' style={[styles.description, { color: colors.icon }]}>
                {t('onboarding.planDescription') || 'Selecione o plano que melhor se adapta ao seu negócio'}
              </Typography>

              {/* Plans List */}
              <View style={styles.plansList}>
                {PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <View
                      key={plan.id}
                      style={[
                        styles.planCard,
                        {
                          borderColor: isSelected ? colors.primary : colors.icon + '33',
                          backgroundColor: isSelected ? colors.primary + '10' : 'transparent',
                        },
                      ]}
                    >
                      <Button
                        variant='ghost'
                        size='full'
                        onPress={() => setSelectedPlan(plan.id)}
                        style={styles.planButton}
                      >
                        <View style={styles.planContent}>
                          <View style={styles.planHeader}>
                            <Typography variant='h5' style={styles.planName}>
                              {plan.name}
                            </Typography>
                            <Typography variant='h4' style={[styles.planPrice, { color: colors.primary }]}>
                              {plan.price}
                            </Typography>
                          </View>
                          <Typography variant='body2' style={[styles.planDescription, { color: colors.icon }]}>
                            {plan.description}
                          </Typography>
                          <View style={styles.planFeatures}>
                            {plan.features.map((feature, index) => (
                              <View key={index} style={styles.planFeature}>
                                <Typography variant='body2' style={[styles.featureText, { color: colors.text }]}>
                                  • {feature}
                                </Typography>
                              </View>
                            ))}
                          </View>
                        </View>
                      </Button>
                    </View>
                  );
                })}
              </View>
            </ThemedView>
          </ScrollView>

          {/* Finish Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant='primary'
              size='full'
              onPress={handleFinish}
              disabled={!selectedPlan || isSubmitting}
            >
              {isSubmitting ? (t('common.loading') || 'Carregando...') : (t('onboarding.finish') || 'Finalizar')}
            </Button>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PlansScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  title: {
    marginTop: 8,
  },
  description: {
    marginTop: -8,
    opacity: 0.7,
  },
  plansList: {
    marginTop: 8,
    gap: 16,
  },
  planCard: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  planButton: {
    padding: 0,
  },
  planContent: {
    padding: 20,
    gap: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    flex: 1,
  },
  planPrice: {
    fontWeight: '600',
  },
  planDescription: {
    opacity: 0.7,
  },
  planFeatures: {
    marginTop: 4,
    gap: 4,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
