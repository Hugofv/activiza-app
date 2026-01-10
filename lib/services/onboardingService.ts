/**
 * Onboarding service
 */
import { OnboardingFormData } from '@/contexts/onboardingFormContext';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface OnboardingResponse {
  success: boolean;
  userId?: string;
  message?: string;
}

/**
 * Save onboarding form data (can be called multiple times during the flow)
 */
export async function saveOnboardingData(data: Partial<OnboardingFormData>): Promise<OnboardingResponse> {
  try {
    const response = await apiClient.post<OnboardingResponse>(
      ENDPOINTS.ONBOARDING.SAVE,
      data
    );

    return response.data;
  } catch (error: any) {
    console.error('Save onboarding data error:', error);
    throw error;
  }
}

/**
 * Submit final onboarding form (complete registration)
 */
export async function submitOnboarding(data: OnboardingFormData): Promise<OnboardingResponse> {
  try {
    const response = await apiClient.post<OnboardingResponse>(
      ENDPOINTS.ONBOARDING.SUBMIT,
      data
    );

    return response.data;
  } catch (error: any) {
    console.error('Submit onboarding error:', error);
    throw error;
  }
}
