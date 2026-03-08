import { format } from 'date-fns';

export type CurrencyCode = 'BRL' | 'USD' | 'GBP' | 'EUR';

export type MaintenanceType =
  | 'OIL_CHANGE'
  | 'TIRE_PRESSURE'
  | 'FILTER_CHANGE'
  | 'BATTERY_CHECK'
  | 'OTHER';

export interface VehicleMaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  currency: CurrencyCode;
  amount: number;
  mileage?: number;
  maintenanceDate: string;
  note?: string;
  receiptPhotoUri?: string;
  createdAt: string;
}

export interface CreateVehicleMaintenanceData {
  type: MaintenanceType;
  currency: CurrencyCode;
  amount: number;
  mileage?: number;
  maintenanceDate: string;
  note?: string;
  receiptPhotoUri?: string;
}

export interface VehicleMileageRecord {
  id: string;
  vehicleId: string;
  mileage: number;
  recordDate: string;
  note?: string;
  receiptPhotoUri?: string;
  createdAt: string;
}

export interface CreateVehicleMileageData {
  mileage: number;
  recordDate: string;
  note?: string;
  receiptPhotoUri?: string;
}

export interface HistoryMonthGroup<T> {
  key: string;
  monthLabel: string;
  records: T[];
}

const wait = (ms = 250) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const maintenanceStore: Record<string, VehicleMaintenanceRecord[]> = {
  '1': [
    {
      id: 'm-1',
      vehicleId: '1',
      type: 'OIL_CHANGE',
      currency: 'BRL',
      amount: 350,
      mileage: 5600,
      maintenanceDate: '2026-02-28T10:00:00.000Z',
      createdAt: '2026-02-28T10:10:00.000Z',
    },
    {
      id: 'm-2',
      vehicleId: '1',
      type: 'TIRE_PRESSURE',
      currency: 'BRL',
      amount: 120,
      mileage: 4100,
      maintenanceDate: '2026-02-16T12:00:00.000Z',
      createdAt: '2026-02-16T12:10:00.000Z',
    },
    {
      id: 'm-3',
      vehicleId: '1',
      type: 'FILTER_CHANGE',
      currency: 'BRL',
      amount: 220,
      mileage: 3800,
      maintenanceDate: '2026-02-12T08:00:00.000Z',
      createdAt: '2026-02-12T08:10:00.000Z',
    },
  ],
};

const mileageStore: Record<string, VehicleMileageRecord[]> = {
  '1': [
    {
      id: 'km-1',
      vehicleId: '1',
      mileage: 5600,
      recordDate: '2026-02-28T10:00:00.000Z',
      createdAt: '2026-02-28T10:00:00.000Z',
    },
    {
      id: 'km-2',
      vehicleId: '1',
      mileage: 4100,
      recordDate: '2026-02-16T10:00:00.000Z',
      createdAt: '2026-02-16T10:00:00.000Z',
    },
    {
      id: 'km-3',
      vehicleId: '1',
      mileage: 3800,
      recordDate: '2026-02-12T10:00:00.000Z',
      createdAt: '2026-02-12T10:00:00.000Z',
    },
    {
      id: 'km-4',
      vehicleId: '1',
      mileage: 2300,
      recordDate: '2026-01-12T10:00:00.000Z',
      createdAt: '2026-01-12T10:00:00.000Z',
    },
  ],
};

function sortByDateDesc<T>(list: T[], dateField: keyof T): T[] {
  return [...list].sort(
    (a, b) =>
      new Date(String(b[dateField])).getTime() -
      new Date(String(a[dateField])).getTime()
  );
}

export function groupHistoryByMonth<T>(
  list: T[],
  dateField: keyof T,
  locale = 'pt-BR'
): HistoryMonthGroup<T>[] {
  const groups = new Map<string, T[]>();

  for (const record of list) {
    const date = new Date(String(record[dateField]));
    const key = format(date, 'yyyy-MM');
    const current = groups.get(key) ?? [];
    current.push(record);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, records]) => ({
      key,
      monthLabel: new Intl.DateTimeFormat(locale, {
        month: 'long',
      }).format(new Date(`${key}-01T00:00:00.000Z`)),
      records: sortByDateDesc(records, dateField),
    }));
}

export async function getVehicleMaintenances(
  vehicleId: string
): Promise<VehicleMaintenanceRecord[]> {
  await wait();
  return sortByDateDesc(maintenanceStore[vehicleId] ?? [], 'maintenanceDate');
}

export async function createVehicleMaintenance(
  vehicleId: string,
  payload: CreateVehicleMaintenanceData
): Promise<VehicleMaintenanceRecord> {
  await wait();
  const next: VehicleMaintenanceRecord = {
    id: `m-${Date.now()}`,
    vehicleId,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  const list = maintenanceStore[vehicleId] ?? [];
  maintenanceStore[vehicleId] = [next, ...list];
  return next;
}

export async function getVehicleMileageHistory(
  vehicleId: string
): Promise<VehicleMileageRecord[]> {
  await wait();
  return sortByDateDesc(mileageStore[vehicleId] ?? [], 'recordDate');
}

export async function createVehicleMileageRecord(
  vehicleId: string,
  payload: CreateVehicleMileageData
): Promise<VehicleMileageRecord> {
  await wait();
  const next: VehicleMileageRecord = {
    id: `km-${Date.now()}`,
    vehicleId,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  const list = mileageStore[vehicleId] ?? [];
  mileageStore[vehicleId] = [next, ...list];
  return next;
}
