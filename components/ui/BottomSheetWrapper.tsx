/**
 * Bottom Sheet Wrapper
 * A generic controlled wrapper around BottomSheet.
 */
import React from 'react';

import { BottomSheet } from './BottomSheet';

interface BottomSheetWrapperProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

/**
 * Generic Bottom Sheet Wrapper Component
 *
 * Use this when you want a small abstraction over BottomSheet
 * with explicit visibility and close handlers.
 */
export function BottomSheetWrapper({
  visible,
  onClose,
  children,
  title,
}: BottomSheetWrapperProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
    >
      {children}
    </BottomSheet>
  );
}
