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
  resetFormData: () => void;
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

  const saveFormData = async () => {
    try {
      console.log('saveFormData', formData);
      // const response = await api.post('/onboarding/save', formData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <OnboardingFormContext.Provider
      value={{ formData, updateFormData, saveFormData, resetFormData }}
    >
      {children}
    </OnboardingFormContext.Provider>
  );
};
