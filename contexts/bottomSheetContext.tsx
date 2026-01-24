/**
 * Bottom Sheet Context
 * Provides global bottom sheet functionality that can be used anywhere in the app
 */
import React, { createContext, useCallback, useContext, useState } from 'react';

interface BottomSheetContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

interface BottomSheetProviderProps {
  children: React.ReactNode;
}

export function BottomSheetProvider({ children }: BottomSheetProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value: BottomSheetContextType = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <BottomSheetContext.Provider value={value}>
      {children}
    </BottomSheetContext.Provider>
  );
}

/**
 * Hook to use bottom sheet
 * @throws Error if used outside BottomSheetProvider
 */
export function useBottomSheet(): BottomSheetContextType {
  const context = useContext(BottomSheetContext);
  
  if (context === undefined) {
    throw new Error('useBottomSheet must be used within BottomSheetProvider');
  }
  
  return context;
}
