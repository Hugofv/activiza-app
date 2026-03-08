import React from 'react';

import { BottomSheet } from './BottomSheet';

export interface BottomSheetHostItem<TSheetId extends string = string> {
  id: TSheetId;
  title?: string;
  content: React.ReactNode | ((id: TSheetId) => React.ReactNode);
  onClose?: () => void;
  minHeight?: number;
  maxHeightRatio?: number;
}

interface BottomSheetHostProps<TSheetId extends string = string> {
  openedIds: TSheetId[];
  close: (id: TSheetId) => void;
  sheets: BottomSheetHostItem<TSheetId>[];
}

/**
 * Renders all opened bottom sheets based on controller stack state.
 */
export function BottomSheetHost<TSheetId extends string = string>({
  openedIds,
  close,
  sheets,
}: BottomSheetHostProps<TSheetId>) {
  const sheetById = React.useMemo(
    () => new Map(sheets.map((sheet) => [sheet.id, sheet])),
    [sheets]
  );

  return (
    <>
      {openedIds.map((id) => {
        const sheet = sheetById.get(id);
        if (!sheet) return null;

        const handleClose = () => {
          close(id);
          sheet.onClose?.();
        };

        const content =
          typeof sheet.content === 'function' ? sheet.content(id) : sheet.content;

        return (
          <BottomSheet
            key={id}
            visible
            onClose={handleClose}
            title={sheet.title}
            minHeight={sheet.minHeight}
            maxHeightRatio={sheet.maxHeightRatio}
          >
            {content}
          </BottomSheet>
        );
      })}
    </>
  );
}
