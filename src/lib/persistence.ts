import { AppData, createEmptyAppData, normalizeAppData } from './appData';
import { apiBasePath } from './paths';

const STORAGE_KEYS = {
  agencies: 'logistics_agencies',
  drivers: 'logistics_drivers',
  internals: 'logistics_internals',
  routeSheets: 'logistics_routes',
  zones: 'logistics_zones',
} as const;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || apiBasePath();
const STATE_ENDPOINT = `${API_BASE_URL.replace(/\/$/, '')}/state.php`;

const canUseLocalStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readLocalState = (): AppData => {
  if (!canUseLocalStorage()) {
    return createEmptyAppData();
  }

  try {
    const agencies = JSON.parse(localStorage.getItem(STORAGE_KEYS.agencies) || '[]');
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const internals = JSON.parse(localStorage.getItem(STORAGE_KEYS.internals) || '[]');
    const routeSheets = JSON.parse(localStorage.getItem(STORAGE_KEYS.routeSheets) || '[]');
    const zones = JSON.parse(localStorage.getItem(STORAGE_KEYS.zones) || '[]');

    return normalizeAppData({ agencies, drivers, internals, routeSheets, zones });
  } catch {
    return createEmptyAppData();
  }
};

const requestJson = async (url: string, init?: RequestInit): Promise<any> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const loadAppState = async (): Promise<AppData> => {
  const local = readLocalState();
  if (
    local.agencies.length > 0 ||
    local.drivers.length > 0 ||
    local.internals.length > 0 ||
    local.routeSheets.length > 0 ||
    local.zones.length > 0
  ) {
    return local;
  }

  try {
    const remote = await requestJson(STATE_ENDPOINT, { method: 'GET' });
    const normalized = normalizeAppData(remote?.data ?? remote);
    if (
    normalized.agencies.length > 0 ||
    normalized.drivers.length > 0 ||
    normalized.internals.length > 0 ||
    normalized.routeSheets.length > 0 ||
    normalized.zones.length > 0
    ) {
      return normalized;
    }
  } catch {
    // Fallback to local browser storage when the PHP API is not available yet.
  }

  return local;
};

export const saveAppState = async (state: AppData): Promise<void> => {
  const normalized = normalizeAppData(state);
  try {
    await requestJson(STATE_ENDPOINT, {
      method: 'PUT',
      body: JSON.stringify(normalized),
    });
  } catch {
    // Keep the local copy so the app still works during development or if the backend is down.
  }
};
