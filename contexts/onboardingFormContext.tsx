import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import {
  OnboardingStepKey,
  isStepCompleted as checkStepCompleted,
  getNextStep,
  isOnboardingCompleted,
} from '@/lib/config/onboardingSteps';
import { isOfflineError } from '@/lib/hooks/useMutation';
import { getCurrentUser } from '@/lib/services/authService';
import {
  OnboardingResponse,
  getOnboardingData,
  saveOnboardingData,
  submitOnboarding,
  updateOnboardingStep,
} from '@/lib/services/onboardingService';

export interface OnboardingFormData {
  // Email como identificador primário (obrigatório)
  email: string;
  password?: string;
  emailCode?: string;

  // Documento como informação simples (opcional)
  document?: string; // Valor formatado do documento
  documentType?: string; // Tipo: 'cpf', 'cnpj', 'ssn', 'ein', 'ni', 'crn', etc.

  name: string;
  phone: {
    country: string | null;
    countryCode: string;
    phoneNumber: string;
    formattedPhoneNumber: string;
    meta?: {
      country: string | null;
      countryCode: string;
    };
  } | null;
  code?: string;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  activeCustomers?: number; // Max number of active customers
  financialOperations?: number; // Max operations per month
  workingCapital?: number; // Working capital in thousands (e.g., 5 = 5k, 100 = 100k)
  businessDuration?: number; // Business duration in months
  businessOptions?: string | string[];
  planId?: number; // Selected plan ID
  address?: {
    postalCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    countryCode?: string;
    number: string;
    complement?: string;
    _apiFilled?: {
      postalCode?: boolean;
      street?: boolean;
      neighborhood?: boolean;
      city?: boolean;
      state?: boolean;
      country?: boolean;
    };
  };
}

interface OnboardingFormContextType {
  formData: Partial<OnboardingFormData>;
  currentStep: OnboardingStepKey | null;
  clientStatus: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | null;
  updateFormData: (
    data: Partial<OnboardingFormData>,
    step?: OnboardingStepKey
  ) => Promise<void>;
  updateStep: (step: OnboardingStepKey) => Promise<OnboardingResponse>; // Para steps de verificação
  submitFormData: (
    additionalData?: Partial<OnboardingFormData>
  ) => Promise<void>;
  resetFormData: () => void;
  isSaving: boolean;
  isSubmitting: boolean;
  saveError: Error | null;
  submitError: Error | null;
  // Helper functions
  isStepCompleted: (step: OnboardingStepKey) => boolean;
  isOnboardingFullyCompleted: () => boolean;
}

const OnboardingFormContext = createContext<
  OnboardingFormContextType | undefined
>(undefined);

function isOnboardingServiceUnavailableError(error: any): boolean {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message ?? error?.message ?? ''
  ).toLowerCase();
  const details = JSON.stringify(error?.response?.data?.details ?? '').toLowerCase();

  return (
    status === 500 &&
    (message.includes('onboardingservice') || details.includes('onboardingservice'))
  );
}

export const useOnboardingForm = () => {
  const context = useContext(OnboardingFormContext);
  if (!context) {
    throw new Error(
      'useOnboardingForm must be used within OnboardingFormProvider'
    );
  }
  return context;
};

interface OnboardingFormProviderProps {
  children: ReactNode;
}

export const OnboardingFormProvider: React.FC<OnboardingFormProviderProps> = ({
  children,
}) => {
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>({});
  const [currentStep, setCurrentStep] = useState<OnboardingStepKey | null>(
    null
  );
  const [clientStatus, setClientStatus] = useState<
    'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | null
  >(null);

  // Fetch onboarding data on mount
  const { data: fetchedData } = useQuery({
    queryKey: ['onboarding', 'data'],
    // Wrap service call to ensure we NEVER return undefined to React Query
    queryFn: async () => {
      try {
        const data = await getOnboardingData();
        if (data === undefined) {
          console.log(
            '[OnboardingFormContext] getOnboardingData returned undefined, normalizing to null'
          );
          return null;
        }
        return data;
      } catch (error) {
        console.error(
          '[OnboardingFormContext] getOnboardingData error (ignored, returning null):',
          error
        );
        // Ignore error for this query and avoid crashing/logbox
        return null;
      }
    },
    staleTime: 0, // Always fetch fresh data
    retry: 1, // Only retry once on error
    enabled: !!formData?.email,
  });

  // Update formData when fetched data is available
  useEffect(() => {
    if (fetchedData) {
      const { onboardingStep, clientStatus: status, ...data } = fetchedData;
      setFormData(data);
      if (onboardingStep) {
        setCurrentStep(onboardingStep as OnboardingStepKey);
      }
      if (status) {
        setClientStatus(status);
      }
    }
  }, [fetchedData]);

  const resetFormData = () => {
    setFormData({});
    setCurrentStep(null);
    setClientStatus(null);
  };

  // Mutation for saving onboarding data (intermediate saves)
  const saveMutation = useMutation({
    mutationFn: ({
      data,
      step,
    }: {
      data: Partial<OnboardingFormData>;
      step?: OnboardingStepKey;
    }) => saveOnboardingData(data, step),
    onError: (error: any) => {
      if (isOfflineError(error)) {
        console.log('Offline: data will be saved when connection is restored');
      } else {
        console.error('Error saving onboarding data:', error);
      }
    },
    onSuccess: (response, variables) => {
      // Update client status first
      if (response.clientStatus) {
        setClientStatus(response.clientStatus);
      }

      // API already returns the next step after marking the current step as completed
      // Just update the current step from the API response
      if (response.onboardingStep) {
        setCurrentStep(response.onboardingStep as OnboardingStepKey);
        console.log(
          `✅ Step ${variables.step || 'unknown'} completed. Next step: ${response.onboardingStep}`
        );
      } else if (variables.step) {
        // If API doesn't return next step, calculate it locally
        const nextStep = getNextStep(variables.step);
        if (nextStep) {
          setCurrentStep(nextStep.key);
          console.log(
            `✅ Step ${variables.step} completed. Next step: ${nextStep.key}`
          );
        }
      }
    },
  });

  // Mutation for updating step only (for verification steps)
  const updateStepMutation = useMutation({
    mutationFn: async (step: OnboardingStepKey) => {
      console.log('Updating onboarding step to:', step);
      return updateOnboardingStep(step);
    },
    onError: (error: any) => {
      if (isOfflineError(error)) {
        console.log(
          'Offline: step update will be saved when connection is restored'
        );
      } else {
        console.error('Error updating onboarding step:', error);
      }
    },
    onSuccess: (response, completedStep) => {
      // Update client status first
      if (response.clientStatus) {
        setClientStatus(response.clientStatus);
        console.log('Client status updated to:', response.clientStatus);
      }

      // API marks the verification step as completed and returns the NEXT step
      // Just update the current step from the API response
      if (response.onboardingStep) {
        setCurrentStep(response.onboardingStep as OnboardingStepKey);
        console.log(
          `✅ Verification step ${completedStep} completed. Next step: ${response.onboardingStep}`
        );
      } else {
        // If API doesn't return next step, calculate it locally
        const nextStep = getNextStep(completedStep);
        if (nextStep) {
          setCurrentStep(nextStep.key);
          console.log(
            `✅ Verification step ${completedStep} completed. Next step: ${nextStep.key}`
          );
        } else {
          console.warn(
            '⚠️ No onboardingStep in response, step may already be completed or onboarding is finished'
          );
        }
      }
    },
  });

  // Mutation for submitting final onboarding data
  const submitMutation = useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: OnboardingFormData;
      userId: string;
    }) => submitOnboarding(data, userId),
    onError: (error: any) => {
      if (isOfflineError(error)) {
        console.log(
          'Offline: submission will be queued for when connection is restored'
        );
      } else {
        console.error('Error submitting onboarding data:', error);
      }
    },
    onSuccess: (response) => {
      // After submit, onboarding should be COMPLETED
      if (response.clientStatus) {
        setClientStatus(response.clientStatus);
      }
      // Clear current step as onboarding is complete
      setCurrentStep(null);
    },
  });

  // Unified updateFormData: updates local state and saves to API if step is provided
  const updateFormData = async (
    data: Partial<OnboardingFormData>,
    step?: OnboardingStepKey
  ) => {
    // Merge data with current formData for API call
    const mergedData = {
      ...formData,
      ...data,
    };

    // Update local state first
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));

    // If step is provided, save to API immediately with merged data
    if (step) {
      console.log(JSON.stringify(mergedData, null, 2));
      try {
        await saveMutation.mutateAsync({
          data: mergedData,
          step,
        });
      } catch (error: any) {
        if (isOnboardingServiceUnavailableError(error)) {
          // Temporary fallback: keep onboarding moving locally when backend
          // onboarding service is unavailable in the current environment.
          const nextStep = getNextStep(step);
          if (nextStep) setCurrentStep(nextStep.key);
          console.warn(
            `[OnboardingFormContext] Backend onboarding service unavailable on step "${step}". Continuing locally.`
          );
          return;
        }
        throw error;
      }
    }
  };

  const updateStep = async (step: OnboardingStepKey) => {
    // Update step via API - this marks the step as completed
    // The API will return the next step in the response
    // Don't update local state first, wait for API response
    console.log(`🔄 Updating step: ${step}`);
    try {
      const response = await updateStepMutation.mutateAsync(step);
      console.log(`✅ Step update completed. Response:`, response);
      // Local state will be updated in onSuccess callback from the mutation
      return response;
    } catch (error: any) {
      if (isOnboardingServiceUnavailableError(error)) {
        const nextStep = getNextStep(step);
        if (nextStep) setCurrentStep(nextStep.key);
        console.warn(
          `[OnboardingFormContext] Backend onboarding step update unavailable for "${step}". Continuing locally.`
        );
        return {
          success: false,
          message: 'Local fallback due to onboarding service unavailability',
        };
      }
      throw error;
    }
  };

  const submitFormData = async (
    additionalData?: Partial<OnboardingFormData>
  ) => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      throw new Error(
        'User is not authenticated. Please log in and try again.'
      );
    }

    // Merge formData with any additional data provided (e.g., planId)
    const finalData = {
      ...formData,
      ...additionalData,
    } as OnboardingFormData;

    await submitMutation.mutateAsync({
      data: finalData,
      userId: currentUser.id,
    });
  };

  // Helper: Check if a step is completed
  const isStepCompletedHelper = (step: OnboardingStepKey): boolean => {
    return checkStepCompleted(step, currentStep);
  };

  // Helper: Check if onboarding is fully completed
  const isOnboardingFullyCompletedHelper = (): boolean => {
    // Filter out PENDING status as it's not part of the completion check
    const status =
      clientStatus === 'PENDING' ? undefined : clientStatus || undefined;
    return isOnboardingCompleted(
      status as 'IN_PROGRESS' | 'COMPLETED' | undefined
    );
  };

  return (
    <OnboardingFormContext.Provider
      value={{
        formData,
        currentStep,
        clientStatus,
        updateFormData,
        updateStep,
        submitFormData,
        resetFormData,
        isSaving: saveMutation.isPending,
        isSubmitting: submitMutation.isPending,
        saveError: saveMutation.error as Error | null,
        submitError: submitMutation.error as Error | null,
        isStepCompleted: isStepCompletedHelper,
        isOnboardingFullyCompleted: isOnboardingFullyCompletedHelper,
      }}
    >
      {children}
    </OnboardingFormContext.Provider>
  );
};
