const normalizeBaseUrl = (value) => {
  if (!value) {
    return null;
  }

  // Remove any trailing slashes to avoid double slashes when constructing URLs
  return value.replace(/\/+$/, '');
};

const envBaseUrl = normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL);

export const API_BASE_URL = envBaseUrl || 'http://localhost:8000';
