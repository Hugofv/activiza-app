import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

export type OperationType =
  | 'loan'
  | 'installments'
  | 'rent-property'
  | 'rent-room'
  | 'rent-vehicle'
  | null;

export type FrequencyType = 'weekly' | 'biweekly' | 'monthly';

export interface OperationFormData {
  selectedClientId: string | null;
  selectedClientName: string | null;
  amount: string;
  currency: string;
  interest: string;
  dueDate: string;
  frequency: FrequencyType;
  observation: string;
}

interface OperationsContextType {
  operationType: OperationType;
  setOperationType: (type: OperationType) => void;
  formData: OperationFormData;
  updateFormData: (data: Partial<OperationFormData>) => void;
  resetOperation: () => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(
  undefined
);

export function useOperations(): OperationsContextType {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within OperationsProvider');
  }
  return context;
}

interface OperationsProviderProps {
  children: ReactNode;
}

const initialFormData: OperationFormData = {
  selectedClientId: null,
  selectedClientName: null,
  amount: '',
  currency: 'GBP',
  interest: '',
  dueDate: '',
  frequency: 'weekly',
  observation: '',
};

export function OperationsProvider({ children }: OperationsProviderProps) {
  const [operationType, setOperationType] = useState<OperationType>(null);
  const [formData, setFormData] = useState<OperationFormData>(initialFormData);

  const updateFormData = useCallback((data: Partial<OperationFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  const resetOperation = useCallback(() => {
    setFormData(initialFormData);
    setOperationType(null);
  }, []);

  const value: OperationsContextType = {
    operationType,
    setOperationType,
    formData,
    updateFormData,
    resetOperation,
  };

  return (
    <OperationsContext.Provider value={value}>
      {children}
    </OperationsContext.Provider>
  );
}
