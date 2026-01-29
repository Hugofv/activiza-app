import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface NewClientFormData {
  name?: string;
  avatar?: string; // Avatar image URI
  whatsapp?: {
    countryCode: string;
    phoneNumber: string;
    formattedPhoneNumber: string;
  };
  email?: string;
  document?: string;
  documentType?: string;
  documentImages?: string[]; // Array of image URIs
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
  };
  observation?: string;
  guarantor?: {
    id: string;
    name: string;
    rating?: number;
  };
  reliability?: number; // 1-5 stars
}

interface NewClientFormContextType {
  formData: NewClientFormData;
  updateFormData: (data: Partial<NewClientFormData>) => void;
  resetFormData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const NewClientFormContext = createContext<NewClientFormContextType | undefined>(undefined);

export const useNewClientForm = () => {
  const context = useContext(NewClientFormContext);
  if (!context) {
    throw new Error('useNewClientForm must be used within NewClientFormProvider');
  }
  return context;
};

interface NewClientFormProviderProps {
  children: ReactNode;
}

export const NewClientFormProvider: React.FC<NewClientFormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<NewClientFormData>({});
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 10; // Nome, Avatar, WhatsApp, E-mail, Documento, Documentos, Endereço, Observação, Avalista, Confiabilidade, Resumo

  const updateFormData = (data: Partial<NewClientFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData({});
    setCurrentStep(0);
  };

  return (
    <NewClientFormContext.Provider
      value={{
        formData,
        updateFormData,
        resetFormData,
        currentStep,
        setCurrentStep,
        totalSteps,
      }}
    >
      {children}
    </NewClientFormContext.Provider>
  );
};
