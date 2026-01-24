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

export interface Module {
  id: number;
  key: string;
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ModulesResponse {
  success: boolean;
  results: Module[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlanFeature {
  id?: number;
  planId?: number;
  featureId?: number;
  isEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  operationLimit?: number | null;
  resetPeriod?: string | null;
  feature?: {
    id?: number;
    name?: string;
    description?: string;
    key?: string;
  };
  prices?: any[];
  [key: string]: any;
}

export interface PlanPrice {
  id?: number;
  planId?: number;
  amount?: number;
  currency?: string;
  billingPeriod?: string;
  [key: string]: any;
}

export interface SuggestedPlan {
  id: number;
  name: string;
  description?: string;
  totalPrice?: number;
  billingPeriod?: string;
  isActive?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
  maxClients?: number | null;
  maxOperations?: number | null;
  maxStorage?: number | null;
  maxUsers?: number | null;
  matchScore?: number;
  priceScore?: number;
  features?: PlanFeature[];
  prices?: PlanPrice[];
  meta?: any;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for additional fields from API
}

export interface SuggestedPlansResponse {
  success?: boolean;
  plans?: SuggestedPlan[];
  [key: string]: any; // Allow for flexible response structure
}

/**
 * Get available modules from API
 * Returns list of modules that can be selected during onboarding
 */
export async function getModules(): Promise<Module[]> {
  try {
    const response = await apiClient.get<ModulesResponse>(ENDPOINTS.MODULES.GET);
    console.log(response.data);
    return response.data.results || [];
  } catch (error: any) {
    console.error('Get modules error:', error);
    throw error;
  }
}

/**
 * Get suggested plans from API
 * Returns list of suggested plans based on user's onboarding data
 */
export async function getSuggestedPlans(): Promise<SuggestedPlan[]> {
  try {
    const response = await apiClient.get<SuggestedPlansResponse>(ENDPOINTS.ONBOARDING.SUGGESTED_PLANS);
    console.log('Suggested plans response:', response.data);

    return response.data?.data || [];
  } catch (error: any) {
    console.error('Get suggested plans error:', error);
    throw error;
  }
}

/**
 * Get complete onboarding data for authenticated user
 * Returns all onboarding data to populate the form
 */
export async function getOnboardingData(): Promise<Partial<OnboardingFormData> & { onboardingStep?: string; clientStatus?: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' } | undefined> {
  try {
    const response = await apiClient.get<Partial<OnboardingFormData> & { onboardingStep?: string; clientStatus?: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' }>(
      ENDPOINTS.ONBOARDING.GET
    );

    return response.data;
  } catch (error: any) {
    console.log('Get onboarding data error:', error);
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
