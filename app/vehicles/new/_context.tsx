import React, { ReactNode, createContext, useContext, useState } from 'react';

import type { VehicleSubtype } from '@/lib/services/vehicleService';

export interface NewVehicleFormData {
  subtype: VehicleSubtype;
  brand: string;
  model: string;
  year: string;
  plate: string;
  value: string;
  currency: string;
  mileage: string;
  photos: string[];
  observation: string;
}

interface NewVehicleFormContextType {
  formData: NewVehicleFormData;
  updateFormData: (data: Partial<NewVehicleFormData>) => void;
  resetFormData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const initialFormData: NewVehicleFormData = {
  subtype: 'CAR',
  brand: '',
  model: '',
  year: '',
  plate: '',
  value: '',
  currency: 'GBP',
  mileage: '',
  photos: [],
  observation: '',
};

const NewVehicleFormContext = createContext<
  NewVehicleFormContextType | undefined
>(undefined);

export function useNewVehicleForm(): NewVehicleFormContextType {
  const context = useContext(NewVehicleFormContext);
  if (!context) {
    throw new Error(
      'useNewVehicleForm must be used within NewVehicleFormProvider'
    );
  }
  return context;
}

interface NewVehicleFormProviderProps {
  children: ReactNode;
}

export function NewVehicleFormProvider({ children }: NewVehicleFormProviderProps) {
  const [formData, setFormData] = useState<NewVehicleFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;

  const updateFormData = (data: Partial<NewVehicleFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
    setCurrentStep(0);
  };

  return (
    <NewVehicleFormContext.Provider
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
    </NewVehicleFormContext.Provider>
  );
}
