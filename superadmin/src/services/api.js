// ==============================================================================
// GAON SE SUPER ADMIN API CONFIGURATION
// ==============================================================================
// Configurable via EXPO_PUBLIC_API_URL (defaults to production if not set)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://superadmin.gaonse.in/api/v1/master";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "x-master-key": "SUPER_SECRET_KEY",
};

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...DEFAULT_HEADERS,
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(
        (data && (data.message || data.error)) || `Request failed with status ${response.status}`
      );
      error.response = {
        status: response.status,
        data: data,
      };
      throw error;
    }

    return { data, status: response.status };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

const API = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
};

export default API;
