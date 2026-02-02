import type { Module } from '@/lib/services/onboardingService';

export interface OperationOption {
  id: string;
  icon: string;
  labelKey: string;
  route: string;
}

/** Map API module keys (UPPER_SNAKE_CASE) to icon names for tabs/operations */
export const MODULE_ICON_MAP: Record<string, string> = {
  LOAN: 'user-dollar',
  INSTALLMENTS: 'receipt-2',
  RENT_HOUSE: 'home',
  RENT_PROPERTY: 'home',
  RENT_ROOM: 'door-outline',
  RENT_VEHICLE: 'car',
  default: 'ellipse-outline',
};

/** Map API module keys to translation keys used under tabs.* (e.g. tabs.lendMoney) */
export const MODULE_LABEL_KEY_MAP: Record<string, string> = {
  LOAN: 'lendMoney',
  INSTALLMENTS: 'installments',
  RENT_HOUSE: 'rentProperties',
  RENT_PROPERTY: 'rentProperties',
  RENT_ROOM: 'rentRooms',
  RENT_VEHICLE: 'rentVehicles',
};

/** Map API module keys to operation routes */
export const MODULE_ROUTE_MAP: Record<string, string> = {
  LOAN: '/operations/loan',
  INSTALLMENTS: '/operations/installments',
  RENT_HOUSE: '/operations/rent-property',
  RENT_PROPERTY: '/operations/rent-property',
  RENT_ROOM: '/operations/rent-room',
  RENT_VEHICLE: '/operations/rent-vehicle',
};

/** Map API module keys to onboarding translation keys (e.g. onboarding.optionLendMoney) */
export const MODULE_TRANSLATION_MAP: Record<string, string> = {
  LOAN: 'optionLendMoney',
  INSTALLMENTS: 'optionInstallments',
  RENT_HOUSE: 'optionRentProperties',
  RENT_PROPERTY: 'optionRentProperties',
  RENT_ROOM: 'optionRentRooms',
  RENT_VEHICLE: 'optionRentVehicles',
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
