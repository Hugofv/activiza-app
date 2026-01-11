/**
 * Onboarding service
 */
import { OnboardingFormData } from '@/contexts/onboardingFormContext';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { OnboardingStepKey } from '../config/onboardingSteps';

export interface OnboardingResponse {
  success: boolean;
  userId?: string;
  message?: string;
  onboardingStep?: string; // Próximo step a completar (retornado pela API)
  clientStatus?: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING'; // Status geral
}

/**
 * Save onboarding form data with current step
 * When step is saved, it's considered completed
 * API will return the next step to complete
 */
export async function saveOnboardingData(
  data: Partial<OnboardingFormData>,
  currentStep?: OnboardingStepKey
): Promise<OnboardingResponse> {
  try {
    const payload = {
      ...data,
      // Include current step if provided
      // When API receives this, it marks the step as completed
      // and returns the next step in onboardingStep
      ...(currentStep && { onboardingStep: currentStep }),
    };

    const response = await apiClient.post<OnboardingResponse>(
      ENDPOINTS.ONBOARDING.SAVE,
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error('Save onboarding data error:', error);
    throw error;
  }
}

/**
 * Update onboarding step (for verification steps that use different endpoints)
 * Marks the verification step as completed
 */
export async function updateOnboardingStep(
  step: OnboardingStepKey
): Promise<OnboardingResponse> {
  try {
    const response = await apiClient.post<OnboardingResponse>(
      ENDPOINTS.ONBOARDING.SAVE,
      { onboardingStep: step }
    );

    return response.data;
  } catch (error: any) {
    console.error('Update onboarding step error:', error);
    throw error;
  }
}

/**
 * Submit final onboarding form (complete registration)
 * This marks the entire onboarding as COMPLETED
 */
export async function submitOnboarding(data: OnboardingFormData): Promise<OnboardingResponse> {
  try {
    const response = await apiClient.post<OnboardingResponse>(
      ENDPOINTS.ONBOARDING.SUBMIT,
      data
    );

    // After submit, onboarding should be COMPLETED
    // API should return clientStatus: 'COMPLETED'
    return response.data;
  } catch (error: any) {
    console.error('Submit onboarding error:', error);
    throw error;
  }
}
