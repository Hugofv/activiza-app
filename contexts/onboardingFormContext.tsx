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
}

interface OnboardingFormContextType {
  formData: Partial<OnboardingFormData>;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  resetFormData: () => void;
}

const OnboardingFormContext = createContext<OnboardingFormContextType | undefined>(undefined);

export const useOnboardingForm = () => {
  const context = useContext(OnboardingFormContext);
  if (!context) {
    throw new Error('useOnboardingForm must be used within OnboardingFormProvider');
  }
  return context;
};

interface OnboardingFormProviderProps {
  children: ReactNode;
}

export const OnboardingFormProvider: React.FC<OnboardingFormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>({});

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData({});
  };

  return (
    <OnboardingFormContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </OnboardingFormContext.Provider>
  );
};

