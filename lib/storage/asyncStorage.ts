/**
 * Wrapper for AsyncStorage with type safety and error handling
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@ativiza:';

/**
 * Get value from AsyncStorage with automatic JSON parsing
 */
export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error getting storage item ${key}:`, error);
    return null;
  }
}

/**
 * Set value in AsyncStorage with automatic JSON stringification
 */
export async function setStorageItem<T>(
  key: string,
  value: T
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(value)
    );
    return true;
  } catch (error) {
    console.error(`Error setting storage item ${key}:`, error);
    return false;
  }
}

/**
 * Remove value from AsyncStorage
 */
export async function removeStorageItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error(`Error removing storage item ${key}:`, error);
    return false;
  }
}

/**
 * Clear all storage items with the prefix
 */
export async function clearStorage(): Promise<boolean> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prefixedKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
    await AsyncStorage.multiRemove(prefixedKeys);
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

/**
 * Get multiple storage items at once
 */
export async function getMultipleStorageItems<T>(
  keys: string[]
): Promise<Record<string, T | null>> {
  try {
    const prefixedKeys = keys.map((key) => `${STORAGE_PREFIX}${key}`);
    const items = await AsyncStorage.multiGet(prefixedKeys);
    const result: Record<string, T | null> = {};

    items.forEach(([key, value]) => {
      const originalKey = key.replace(STORAGE_PREFIX, '');
      result[originalKey] = value ? (JSON.parse(value) as T) : null;
    });

    return result;
  } catch (error) {
    console.error('Error getting multiple storage items:', error);
    return {};
  }
}
