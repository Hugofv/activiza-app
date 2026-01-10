import { isOfflineError } from '@/lib/hooks/useMutation';
import { saveOnboardingData, submitOnboarding } from '@/lib/services/onboardingService';
import { useMutation } from '@tanstack/react-query';
import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface OnboardingFormData {
  document: string;
  name: string;
  phone: {
    country: string | null;
    countryCode: string;
    phoneNumber: string;
    formattedPhoneNumber: string;
  } | null;
  email: string;
  code?: string;
  emailCode?: string;
  password?: string;
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
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  saveFormData: () => Promise<void>;
  submitFormData: () => Promise<void>;
  resetFormData: () => void;
  isSaving: boolean;
  isSubmitting: boolean;
  saveError: Error | null;
  submitError: Error | null;
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

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData({});
  };

  // Mutation for saving onboarding data (intermediate saves)
  const saveMutation = useMutation({
    mutationFn: (data: Partial<OnboardingFormData>) => saveOnboardingData(data),
    onError: (error: any) => {
      if (isOfflineError(error)) {
        console.log('Offline: data will be saved when connection is restored');
      } else {
        console.error('Error saving onboarding data:', error);
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
  });

  const saveFormData = async () => {
    await saveMutation.mutateAsync(formData);
  };

  const submitFormData = async () => {
    // Ensure we have all required data before submitting
    if (!formData.document || !formData.name || !formData.email || !formData.password) {
      throw new Error('Missing required fields for submission');
    }
    await submitMutation.mutateAsync(formData as OnboardingFormData);
  };

  return (
    <OnboardingFormContext.Provider
      value={{
        formData,
        updateFormData,
        saveFormData,
        submitFormData,
        resetFormData,
        isSaving: saveMutation.isPending,
        isSubmitting: submitMutation.isPending,
        saveError: saveMutation.error as Error | null,
        submitError: submitMutation.error as Error | null,
      }}
    >
      {children}
    </OnboardingFormContext.Provider>
  );
};
