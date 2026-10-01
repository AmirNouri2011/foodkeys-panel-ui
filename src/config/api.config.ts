/**
 * Centralized API Configuration
 * All API and external service URLs should be imported from this file.
 */

const DEFAULT_ORIGIN = 'http://localhost:8080';
const API_PANEL_PATH = '/api/v1/client/panel';

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

function normalizeApiBaseUrl(envValue?: string | null): string {
  const raw = envValue?.trim() || `${DEFAULT_ORIGIN}${API_PANEL_PATH}`;
  const withoutTrailing = trimTrailingSlashes(raw);

  if (withoutTrailing.endsWith(API_PANEL_PATH)) {
    return withoutTrailing;
  }

  if (!withoutTrailing.includes('/api/')) {
    return `${withoutTrailing}${API_PANEL_PATH}`;
  }

  return withoutTrailing;
}

function normalizeOriginUrl(
  envValue: string | undefined | null,
  defaultOrigin: string
): string {
  return trimTrailingSlashes(envValue?.trim() || defaultOrigin);
}

/** Client panel API base URL — always ends with /api/v1/client/panel */
export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL
);

/** Server origin without the panel API path */
export const BASE_URL = API_BASE_URL.replace(/\/api\/v1\/client\/panel$/, '');

/** Categorized products use the public API path, with the authenticated client. */
export const PRODUCT_API_URL = `${BASE_URL}/api/v1/product`;

/** Static files origin (images, documents, etc.) */
export const STATIC_FILES_URL = normalizeOriginUrl(
  process.env.NEXT_PUBLIC_STATIC_FILES_URL,
  DEFAULT_ORIGIN
);

/** Public client website URL */
export const CLIENT_WEBSITE_URL = normalizeOriginUrl(
  process.env.NEXT_PUBLIC_CLIENT_WEBSITE_URL,
  'https://web.agfo.ir'
);

/** Client news / weblog URL */
export const CLIENT_NEWS_WEBLOG_URL = normalizeOriginUrl(
  process.env.NEXT_PUBLIC_CLIENT_NEWS_WEBLOG_URL,
  'https://news.agfo.ir'
);

/** Payment service API URL */
export const PAYMENT_API_URL = normalizeOriginUrl(
  process.env.NEXT_PUBLIC_PAYMENT_API_URL,
  'https://payment.agfo.ir'
);

/**
 * Notification system API base URL.
 * The redesigned notification endpoints live at the server root
 * (`/api/v1/notifications`), NOT under the client panel path.
 * Always ends without a trailing slash.
 */
export const NOTIFICATIONS_API_URL = normalizeOriginUrl(
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL,
  `${BASE_URL}/api/v1/notifications`
);

export const API_ENDPOINTS = {
  subscription: `${API_BASE_URL}/subscription`,
  discount: (code: string) =>
    `${API_BASE_URL}/discount/${encodeURIComponent(code)}/use`,

  company: {
    list: (pageNumber: number, pageSize: number, categoryId?: number) =>
      `${API_BASE_URL}/company/?pageNumber=${pageNumber}&pageSize=${pageSize}${categoryId ? `&categoryId=${categoryId}` : ''}`,
    search: (query: string, page: number, size: number) =>
      `${API_BASE_URL}/search/company?query=${query}&page=${page}&size=${size}`,
    detail: (id: string | number) => `${API_BASE_URL}/company/${id}`,
  },

  files: {
    temp: `${API_BASE_URL}/company/file/temp`,
    tempGeneric: `${API_BASE_URL}/file/temp`,
    serviceTemp: `${API_BASE_URL}/service/file/temp`,
  },
};

const apiConfig = {
  API_BASE_URL,
  PRODUCT_API_URL,
  BASE_URL,
  STATIC_FILES_URL,
  CLIENT_WEBSITE_URL,
  CLIENT_NEWS_WEBLOG_URL,
  PAYMENT_API_URL,
  NOTIFICATIONS_API_URL,
  API_ENDPOINTS,
};

export default apiConfig;
