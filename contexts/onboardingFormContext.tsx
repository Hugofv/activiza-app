import { isStepCompleted as checkStepCompleted, isOnboardingCompleted, OnboardingStepKey } from '@/lib/config/onboardingSteps';
import { isOfflineError } from '@/lib/hooks/useMutation';
import { saveOnboardingData, submitOnboarding, updateOnboardingStep } from '@/lib/services/onboardingService';
import { useMutation } from '@tanstack/react-query';
import React, { createContext, ReactNode, useContext, useState } from 'react';

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
  } | null;
  code?: string;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  activeCustomers?: number; // Max number of active customers
  financialOperations?: number; // Max operations per month
  workingCapital?: number; // Working capital in thousands (e.g., 5 = 5k, 100 = 100k)
  businessDuration?: number; // Business duration in months
  businessOptions?: string | string[];
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
  updateFormData: (data: Partial<OnboardingFormData>, step?: OnboardingStepKey) => Promise<void>;
  updateStep: (step: OnboardingStepKey) => Promise<void>; // Para steps de verificação
  submitFormData: () => Promise<void>;
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
  const [currentStep, setCurrentStep] = useState<OnboardingStepKey | null>(null);
  const [clientStatus, setClientStatus] = useState<'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | null>(null);

  const resetFormData = () => {
    setFormData({});
    setCurrentStep(null);
    setClientStatus(null);
  };

  // Mutation for saving onboarding data (intermediate saves)
  const saveMutation = useMutation({
    mutationFn: ({ data, step }: { data: Partial<OnboardingFormData>; step?: OnboardingStepKey }) => 
      saveOnboardingData(data, step),
    onError: (error: any) => {
      if (isOfflineError(error)) {
        console.log('Offline: data will be saved when connection is restored');
      } else {
        console.error('Error saving onboarding data:', error);
      }
    },
    onSuccess: (response) => {
      // Update current step from API response (next step to complete)
      if (response.onboardingStep) {
        setCurrentStep(response.onboardingStep as OnboardingStepKey);
      }
      // Update client status
      if (response.clientStatus) {
        setClientStatus(response.clientStatus);
      }
    },
  });

  // Mutation for updating step only (for verification steps)
  const updateStepMutation = useMutation({
    mutationFn: (step: OnboardingStepKey) => updateOnboardingStep(step),
    onError: (error: any) => {
      if (isOfflineError(error)) {
        console.log('Offline: step update will be saved when connection is restored');
      } else {
        console.error('Error updating onboarding step:', error);
      }
    },
    onSuccess: (response) => {
      // Update to next step after verification
      if (response.onboardingStep) {
        setCurrentStep(response.onboardingStep as OnboardingStepKey);
      }
      if (response.clientStatus) {
        setClientStatus(response.clientStatus);
      }
    },
  });

  // Mutation for submitting final onboarding data
  const submitMutation = useMutation({
    mutationFn: (data: OnboardingFormData) => submitOnboarding(data),
    onError: (error: any) => {
      if (isOfflineError(error)) {
        console.log('Offline: submission will be queued for when connection is restored');
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
  const updateFormData = async (data: Partial<OnboardingFormData>, step?: OnboardingStepKey) => {
    // Merge data with current formData for API call
    const mergedData = { ...formData, ...data };
    
    // Update local state first
    setFormData((prev) => ({ ...prev, ...data }));
    
    // If step is provided, save to API immediately with merged data
    if (step) {
      await saveMutation.mutateAsync({ data: mergedData, step });
    }
  };

  const updateStep = async (step: OnboardingStepKey) => {
    setCurrentStep(step);
    await updateStepMutation.mutateAsync(step);
  };

  const submitFormData = async () => {
    // Ensure we have all required data before submitting
    // Email é obrigatório (identificador primário)
    // Documento é opcional (informação de identificação)
    if (!formData.email || !formData.password || !formData.name) {
      throw new Error('Missing required fields for submission: email, password, and name are required');
    }
    await submitMutation.mutateAsync(formData as OnboardingFormData);
  };

  // Helper: Check if a step is completed
  const isStepCompletedHelper = (step: OnboardingStepKey): boolean => {
    return checkStepCompleted(step, currentStep);
  };

  // Helper: Check if onboarding is fully completed
  const isOnboardingFullyCompletedHelper = (): boolean => {
    // Filter out PENDING status as it's not part of the completion check
    const status = clientStatus === 'PENDING' ? undefined : (clientStatus || undefined);
    return isOnboardingCompleted(status as 'IN_PROGRESS' | 'COMPLETED' | undefined);
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
