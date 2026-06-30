import { AppData, createSeedAppData } from './appData';
import { loadAppState, saveAppState } from './persistence';

const STORAGE_KEYS = {
  agencies: 'logistics_agencies',
  drivers: 'logistics_drivers',
  routeSheets: 'logistics_routes',
  zones: 'logistics_zones',
} as const;

let isInitialized = false;
let pendingSave: number | null = null;
let currentSnapshot: AppData = createSeedAppData();

const canUseLocalStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const originalSetItem = typeof Storage !== 'undefined' ? Storage.prototype.setItem : undefined;
const originalRemoveItem = typeof Storage !== 'undefined' ? Storage.prototype.removeItem : undefined;
const originalClear = typeof Storage !== 'undefined' ? Storage.prototype.clear : undefined;

const hasAnyData = (state: AppData): boolean =>
  state.agencies.length > 0 ||
  state.drivers.length > 0 ||
  state.routeSheets.length > 0 ||
  state.zones.length > 0;

const writeSnapshotToLocalStorage = (state: AppData): void => {
  if (!canUseLocalStorage() || !originalSetItem) {
    return;
  }

  if (!hasAnyData(state)) {
    if (originalRemoveItem) {
      originalRemoveItem.call(localStorage, STORAGE_KEYS.agencies);
      originalRemoveItem.call(localStorage, STORAGE_KEYS.drivers);
      originalRemoveItem.call(localStorage, STORAGE_KEYS.routeSheets);
      originalRemoveItem.call(localStorage, STORAGE_KEYS.zones);
    }
    return;
  }

  originalSetItem.call(localStorage, STORAGE_KEYS.agencies, JSON.stringify(state.agencies));
  originalSetItem.call(localStorage, STORAGE_KEYS.drivers, JSON.stringify(state.drivers));
  originalSetItem.call(localStorage, STORAGE_KEYS.routeSheets, JSON.stringify(state.routeSheets));
  originalSetItem.call(localStorage, STORAGE_KEYS.zones, JSON.stringify(state.zones));
};

const scheduleRemoteSave = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (pendingSave !== null) {
    window.clearTimeout(pendingSave);
  }

  pendingSave = window.setTimeout(() => {
    pendingSave = null;
    void saveAppState(currentSnapshot);
  }, 120);
};

const snapshotFromLocalStorage = (): AppData => ({
  agencies: JSON.parse(localStorage.getItem(STORAGE_KEYS.agencies) || '[]'),
  drivers: JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]'),
  routeSheets: JSON.parse(localStorage.getItem(STORAGE_KEYS.routeSheets) || '[]'),
  zones: JSON.parse(localStorage.getItem(STORAGE_KEYS.zones) || '[]'),
});

const updateSnapshotForKey = (key: string, value: string | null): void => {
  if (key === STORAGE_KEYS.agencies) {
    currentSnapshot.agencies = value ? JSON.parse(value) : [];
  } else if (key === STORAGE_KEYS.drivers) {
    currentSnapshot.drivers = value ? JSON.parse(value) : [];
  } else if (key === STORAGE_KEYS.routeSheets) {
    currentSnapshot.routeSheets = value ? JSON.parse(value) : [];
  } else if (key === STORAGE_KEYS.zones) {
    currentSnapshot.zones = value ? JSON.parse(value) : [];
  }
};

export const bootstrapStorageBridge = async (): Promise<void> => {
  if (isInitialized || !canUseLocalStorage() || !originalSetItem || !originalRemoveItem || !originalClear) {
    return;
  }

  isInitialized = true;

  try {
    currentSnapshot = await loadAppState();
  } catch {
    currentSnapshot = snapshotFromLocalStorage();
  }

  writeSnapshotToLocalStorage(currentSnapshot);
  if (hasAnyData(currentSnapshot)) {
    scheduleRemoteSave();
  }

  Storage.prototype.setItem = function patchedSetItem(key: string, value: string) {
    originalSetItem.call(this, key, value);
    updateSnapshotForKey(key, value);
    if (key === STORAGE_KEYS.agencies || key === STORAGE_KEYS.drivers || key === STORAGE_KEYS.routeSheets || key === STORAGE_KEYS.zones) {
      scheduleRemoteSave();
    }
  };

  Storage.prototype.removeItem = function patchedRemoveItem(key: string) {
    originalRemoveItem.call(this, key);
    updateSnapshotForKey(key, null);
    if (key === STORAGE_KEYS.agencies || key === STORAGE_KEYS.drivers || key === STORAGE_KEYS.routeSheets || key === STORAGE_KEYS.zones) {
      scheduleRemoteSave();
    }
  };

  Storage.prototype.clear = function patchedClear() {
    originalClear.call(this);
    currentSnapshot = {
      agencies: [],
      drivers: [],
      routeSheets: [],
      zones: [],
    };
    scheduleRemoteSave();
  };
};
