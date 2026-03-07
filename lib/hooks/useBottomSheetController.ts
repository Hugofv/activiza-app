import { useCallback, useMemo, useState } from 'react';

export interface BottomSheetController<TSheetId extends string = string> {
  openedIds: TSheetId[];
  hasOpenSheets: boolean;
  isOpen: (id: TSheetId) => boolean;
  open: (id: TSheetId) => void;
  close: (id: TSheetId) => void;
  closeTop: () => void;
  closeAll: () => void;
}

/**
 * Local bottom sheet controller for a single screen.
 * Supports multiple open sheets and stack ordering.
 */
export function useBottomSheetController<
  TSheetId extends string = string,
>(): BottomSheetController<TSheetId> {
  const [openedIds, setOpenedIds] = useState<TSheetId[]>([]);

  const isOpen = useCallback(
    (id: TSheetId) => openedIds.includes(id),
    [openedIds]
  );

  const open = useCallback((id: TSheetId) => {
    setOpenedIds((prev) => {
      // Re-opened sheet should move to top.
      const next = prev.filter((item) => item !== id);
      next.push(id);
      return next;
    });
  }, []);

  const close = useCallback((id: TSheetId) => {
    setOpenedIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const closeTop = useCallback(() => {
    setOpenedIds((prev) => prev.slice(0, -1));
  }, []);

  const closeAll = useCallback(() => {
    setOpenedIds([]);
  }, []);

  return useMemo(
    () => ({
      openedIds,
      hasOpenSheets: openedIds.length > 0,
      isOpen,
      open,
      close,
      closeTop,
      closeAll,
    }),
    [openedIds, isOpen, open, close, closeTop, closeAll]
  );
}
