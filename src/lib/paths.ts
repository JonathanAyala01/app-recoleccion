const BASE_URL = import.meta.env.BASE_URL || '/';

const normalizeBase = (value: string): string => {
  if (!value || value === '/') return '/';
  return value.endsWith('/') ? value : `${value}/`;
};

export const APP_BASE_URL = normalizeBase(BASE_URL);

export const publicAssetPath = (fileName: string): string => {
  const cleanFileName = fileName.replace(/^\/+/, '');
  return `${APP_BASE_URL}${cleanFileName}`;
};

export const apiBasePath = (): string => {
  const base = APP_BASE_URL === '/' ? '/' : APP_BASE_URL;
  return `${base}api`;
};
