import type { Module } from '@/lib/services/onboardingService';
import { OperationType } from '@/lib/services/operationService';

export interface OperationOption {
  id: string;
  icon: string;
  labelKey: string;
  route: string;
}

/** Map API module keys (UPPER_SNAKE_CASE) to icon names for tabs/operations */
export const MODULE_ICON_MAP: Record<string, string> = {
  [OperationType.LOAN]: 'user-dollar',
  [OperationType.INSTALLMENTS]: 'receipt-2',
  [OperationType.RENT_HOUSE]: 'home',
  [OperationType.RENT_ROOM]: 'door-outline',
  [OperationType.RENT_VEHICLE]: 'car',
  default: 'ellipse-outline',
};

/** Map API module keys to translation keys used under tabs.* (e.g. tabs.lendMoney) */
export const MODULE_LABEL_KEY_MAP: Record<string, string> = {
  [OperationType.LOAN]: 'lendMoney',
  [OperationType.INSTALLMENTS]: 'installments',
  [OperationType.RENT_HOUSE]: 'rentProperties',
  [OperationType.RENT_ROOM]: 'rentRooms',
  [OperationType.RENT_VEHICLE]: 'rentVehicles',
};

/** Map API module keys to operation routes */
export const MODULE_ROUTE_MAP: Record<string, string> = {
  [OperationType.LOAN]: '/operations/loan',
  [OperationType.INSTALLMENTS]: '/operations/installments',
  [OperationType.RENT_HOUSE]: '/operations/rent-property',
  [OperationType.RENT_ROOM]: '/operations/rent-room',
  [OperationType.RENT_VEHICLE]: '/operations/rentVehicle',
};

/** Map API module keys to onboarding translation keys (e.g. onboarding.optionLendMoney) */
export const MODULE_TRANSLATION_MAP: Record<string, string> = {
  [OperationType.LOAN]: 'optionLendMoney',
  [OperationType.INSTALLMENTS]: 'optionInstallments',
  [OperationType.RENT_HOUSE]: 'optionRentProperties',
  [OperationType.RENT_ROOM]: 'optionRentRooms',
  [OperationType.RENT_VEHICLE]: 'optionRentVehicles',
};

export function mapModulesToOperationOptions(
  modules: Module[] | undefined
): OperationOption[] {
  if (!modules?.length) return [];

  return modules
    .filter((m) => m.isActive !== false)
    .map((module) => ({
      id: module.key,
      icon: MODULE_ICON_MAP[module.key] ?? MODULE_ICON_MAP.default,
      labelKey: MODULE_LABEL_KEY_MAP[module.key] ?? module.key,
      route: MODULE_ROUTE_MAP[module.key] ?? '/(tabs)',
    }));
}
