/**
 * Bottom Sheet Wrapper
 * A generic wrapper component that uses the bottom sheet context
 * Use this component to easily create bottom sheets anywhere in your app
 */
import React from 'react';

import { useBottomSheet } from '@/contexts/bottomSheetContext';

import { BottomSheet } from './BottomSheet';

interface BottomSheetWrapperProps {
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
}

/**
 * Generic Bottom Sheet Wrapper Component
 *
 * This component automatically uses the bottom sheet context to manage visibility.
 * Wrap your content with this component and use the useBottomSheet hook to control it.
 *
 * @example
 * ```tsx
 * import { BottomSheetWrapper } from '@/components/ui/BottomSheetWrapper';
 * import { useBottomSheet } from '@/contexts/bottomSheetContext';
 *
 * function MyComponent() {
 *   const { open, close } = useBottomSheet();
 *
 *   return (
 *     <>
 *       <Button onPress={open}>Open Bottom Sheet</Button>
 *       <BottomSheetWrapper title="My Title">
 *         <Text>Your content here</Text>
 *       </BottomSheetWrapper>
 *     </>
 *   );
 * }
 * ```
 */
export function BottomSheetWrapper({
  children,
  title,
  onClose,
}: BottomSheetWrapperProps) {
  const { isOpen, close } = useBottomSheet();

  const handleClose = () => {
    close();
    onClose?.();
  };

  return (
    <BottomSheet
      visible={isOpen}
      onClose={handleClose}
      title={title}
    >
      {children}
    </BottomSheet>
  );
}
