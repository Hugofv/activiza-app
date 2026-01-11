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
 * Get complete onboarding data for authenticated user
 * Returns all onboarding data to populate the form
 */
export async function getOnboardingData(): Promise<Partial<OnboardingFormData> & { onboardingStep?: string; clientStatus?: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' }> {
  try {
    const response = await apiClient.get<Partial<OnboardingFormData> & { onboardingStep?: string; clientStatus?: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' }>(
      ENDPOINTS.ONBOARDING.GET
    );

    return response.data;
  } catch (error: any) {
    console.error('Get onboarding data error:', error);
    throw error;
  }
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

    console.log(`📤 PUT ${ENDPOINTS.ONBOARDING.SAVE}`);
    console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
    console.log(`📤 Current Step:`, currentStep);

    const response = await apiClient.put<OnboardingResponse>(
      ENDPOINTS.ONBOARDING.SAVE,
      payload
    );

    console.log(`📥 Response:`, JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error: any) {
    console.error('Save onboarding data error:', error);
    if (error?.response) {
      console.error('Error response:', JSON.stringify(error.response.data, null, 2));
      console.error('Error status:', error.response.status);
    }
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
    console.log(`📤 Calling API to update onboarding step: ${step}`);
    console.log(`📤 Endpoint: ${ENDPOINTS.ONBOARDING.SAVE}`);
    console.log(`📤 Payload:`, { onboardingStep: step });
    
    const response = await apiClient.put<OnboardingResponse>(
      ENDPOINTS.ONBOARDING.SAVE,
      { onboardingStep: step }
    );

    console.log(`📥 API Response:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('❌ Update onboarding step error:', error);
    throw error;
  }
}

/**
 * Submit final onboarding form (complete registration)
 * This marks the entire onboarding as COMPLETED
 * API expects userId of authenticated user
 */
export async function submitOnboarding(
  data: OnboardingFormData,
  userId: string
): Promise<OnboardingResponse> {
  try {
    const payload = {
      ...data,
      userId, // Pass authenticated user ID to API
    };

    console.log(`📤 POST ${ENDPOINTS.ONBOARDING.SUBMIT}`);
    console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
    console.log(`📤 UserId:`, userId);

    const response = await apiClient.post<OnboardingResponse>(
      ENDPOINTS.ONBOARDING.SUBMIT,
      payload
    );

    console.log(`📥 Submit response:`, JSON.stringify(response.data, null, 2));

    // After submit, onboarding should be COMPLETED
    // API should return clientStatus: 'COMPLETED'
    return response.data;
  } catch (error: any) {
    console.error('Submit onboarding error:', error);
    if (error?.response) {
      console.error('Error response:', JSON.stringify(error.response.data, null, 2));
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
}
