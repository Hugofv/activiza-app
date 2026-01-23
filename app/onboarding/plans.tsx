import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Progress } from '@/components/ui/progress';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSuggestedPlans, SuggestedPlan } from '@/lib/services/onboardingService';
import { useTranslation } from 'react-i18next';

/**
 * Plans selection screen for onboarding
 * This is the final step before completing onboarding
 */
const PlansScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { submitFormData } = useOnboardingForm();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const carouselRef = useRef<ICarouselInstance>(null);
  
  // Calculate card width for carousel
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - 48; // Screen width minus horizontal padding (24 * 2)

  // Fetch suggested plans from API
  const {
    data: plans,
    isLoading: isLoadingPlans,
    error: plansError,
  } = useQuery<SuggestedPlan[]>({
    queryKey: ['suggested-plans'],
    queryFn: getSuggestedPlans,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: true,
    staleTime:0,
    gcTime:0,
    // staleTime: 1000 * 60 * 60, // 1 hour - plans don't change frequently
  });

  const handleBack = () => {
    router.back();
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
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={true}
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

              {/* Plans Carousel */}
              <View style={styles.plansContainer}>
                {isLoadingPlans ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Typography variant='body2' style={[styles.loadingText, { color: colors.icon }]}>
                      {t('common.loading') || 'Carregando planos...'}
                    </Typography>
                  </View>
                ) : plansError ? (
                  <View style={styles.errorContainer}>
                    <Typography variant='body2' style={[styles.errorText, { color: '#ef4444' }]}>
                      {t('common.error') || 'Erro'} ao carregar planos. Tente novamente.
                    </Typography>
                  </View>
                ) : !plans || plans.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Typography variant='body2' style={[styles.emptyText, { color: colors.icon }]}>
                      {t('onboarding.noPlans') || 'Nenhum plano disponível no momento.'}
                    </Typography>
                  </View>
                ) : (
                  <Carousel
                    ref={carouselRef}
                    loop={false}
                    width={cardWidth}
                    autoPlay={false}
                    data={plans}
                    scrollAnimationDuration={500}
                    mode="parallax"
                    modeConfig={{
                      parallaxScrollingScale: 0.9,
                      parallaxScrollingOffset: 50,
                    }}
                    style={styles.carousel}
                    enabled={true}
                    vertical={false}
                    onSnapToItem={(index: number) => {
                      const plan = plans[index];
                      if (plan) {
                        setSelectedPlan(Number(plan.id));
                      }
                    }}
                    renderItem={({ item: plan }: { item: SuggestedPlan; index: number }) => {
                      const isSelected = selectedPlan === Number(plan.id);
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
                          <View style={styles.planContent}>
                              {/* Plan Name */}
                              <Typography variant='h4' style={styles.planName}>
                                {plan.name}
                              </Typography>

                              {/* Price */}
                              <Typography variant='h3' style={[styles.planPrice, { color: colors.primary }]}>
                                {plan.totalPrice !== undefined && plan.totalPrice !== null
                                  ? `R$ ${plan.totalPrice.toFixed(2)}${plan.billingPeriod === 'MONTHLY' ? '/mês' : plan.billingPeriod === 'YEARLY' ? '/ano' : ''}`
                                  : 'Grátis'}
                              </Typography>

                              {/* Description */}
                              {plan.description && (
                                <Typography variant='body2' style={[styles.planDescription, { color: colors.icon }]}>
                                  {plan.description}
                                </Typography>
                              )}

                              {/* Limits Section */}
                              <View style={[styles.planLimits, { borderTopColor: colors.icon + '20' }]}>
                                <Typography variant='body2' style={[styles.limitsTitle, { color: colors.text }]}>
                                  {t('onboarding.planLimits') || 'Limites do Plano'}
                                </Typography>
                                <View style={styles.limitsList}>
                                  <View style={styles.limitItem}>
                                    <Typography variant='body2' style={[styles.limitLabel, { color: colors.icon }]}>
                                      {t('onboarding.maxOperations')}:
                                    </Typography>
                                    <Typography variant='body2' style={[styles.limitValue, { color: colors.text }]}>
                                      {plan.maxOperations === null || plan.maxOperations === undefined
                                        ? t('onboarding.unlimited') || 'Ilimitado'
                                        : plan.maxOperations}
                                    </Typography>
                                  </View>
                                  <View style={styles.limitItem}>
                                    <Typography variant='body2' style={[styles.limitLabel, { color: colors.icon }]}>
                                      {t('onboarding.maxClients')}:
                                    </Typography>
                                    <Typography variant='body2' style={[styles.limitValue, { color: colors.text }]}>
                                      {plan.maxClients === null || plan.maxClients === undefined
                                        ? t('onboarding.unlimited') || 'Ilimitado'
                                        : plan.maxClients}
                                    </Typography>
                                  </View>
                                  <View style={styles.limitItem}>
                                    <Typography variant='body2' style={[styles.limitLabel, { color: colors.icon }]}>
                                      {t('onboarding.maxUsers')}:
                                    </Typography>
                                    <Typography variant='body2' style={[styles.limitValue, { color: colors.text }]}>
                                      {plan.maxUsers === null || plan.maxUsers === undefined
                                        ? t('onboarding.unlimited') || 'Ilimitado'
                                        : plan.maxUsers}
                                    </Typography>
                                  </View>
                                </View>
                              </View>

                              {/* Features Section */}
                              {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                                <View style={[styles.planFeatures, { borderTopColor: colors.icon + '20' }]}>
                                  <Typography variant='body2' style={[styles.featuresTitle, { color: colors.text }]}>
                                    {t('onboarding.planFeatures') || 'Recursos Incluídos'}
                                  </Typography>
                                  {plan.features
                                    .filter((feature: any) => feature?.isEnabled !== false && feature?.feature)
                                    .map((feature: any, featureIndex: number) => {
                                      const featureName = feature?.feature?.name || feature?.feature?.key || `Feature ${featureIndex + 1}`;
                                      return (
                                        <View key={feature?.id || featureIndex} style={styles.planFeature}>
                                          <Typography variant='body2' style={[styles.featureText, { color: colors.text }]}>
                                            • {featureName}
                                          </Typography>
                                        </View>
                                      );
                                    })}
                                </View>
                              )}

                              {/* Select Plan Button */}
                              <View style={styles.planButtonContainer}>
                                <Button
                                  variant='primary'
                                  size='full'
                                  onPress={async () => {
                                    const planId = Number(plan.id);
                                    setSelectedPlan(planId);
                                    setIsSubmitting(true);
                                    try {
                                      // Submit the complete onboarding form with selected plan ID
                                      await submitFormData({ planId });
                                      router.push('/onboarding/registerFinished');
                                    } catch (error: any) {
                                      console.error('Failed to finish onboarding:', error);
                                      // Log detailed error information
                                      if (error?.response?.data?.details) {
                                        console.error('Validation errors:', JSON.stringify(error.response.data.details, null, 2));
                                      }
                                      Alert.alert(
                                        t('common.error') || 'Error',
                                        error?.response?.data?.message || error?.message || t('onboarding.submitError') || 'Failed to complete registration. Please try again.'
                                      );
                                    } finally {
                                      setIsSubmitting(false);
                                    }
                                  }}
                                  loading={isSubmitting && selectedPlan === Number(plan.id)}
                                >
                                  {t('onboarding.wantThisPlan') || 'Quero este'}
                                </Button>
                              </View>
                          </View>
                        </View>
                      );
                    }}
                  />
                )}
              </View>
            </ThemedView>
          </ScrollView>
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
    paddingBottom: 20,
  },
  content: {
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
  plansContainer: {
    marginTop: 8,
    marginHorizontal: -24, // Offset content padding for full-width carousel
    minHeight: Dimensions.get('window').height * 0.6, // Minimum height to ensure visibility
  },
  carousel: {
    width: '100%',
    height: Dimensions.get('window').height * 0.65, // Set explicit height for carousel
  },
  planCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 12, // Horizontal margin for spacing between cards
  },
  planContent: {
    padding: 24,
    gap: 16,
  },
  planName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontWeight: '700',
    marginBottom: 8,
  },
  planDescription: {
    opacity: 0.7,
    marginBottom: 4,
  },
  planLimits: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  limitsTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  limitsList: {
    gap: 8,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  limitValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  planFeatures: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  featuresTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 13,
    lineHeight: 20,
  },
  planButtonContainer: {
    marginTop: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
