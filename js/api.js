import { CONFIG } from "./config.js";
import { MOCK_PRODUCTS } from "./mock-data.js";

const sleep = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

function getAccessToken() {
  return localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
}

function saveSession(data) {
  if (data?.accessToken) {
    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, data.accessToken);
  }

  if (data?.user) {
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
  }
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
  localStorage.removeItem(CONFIG.USER_KEY);
}

/*
 * Convert MongoDB's _id into the frontend's expected id.
 * This keeps the rest of the UI independent from MongoDB.
 */
function normalizeProduct(product) {
  if (!product) return product;

  return {
    ...product,
    id: product.id || product._id,
  };
}

function normalizeProducts(products = []) {
  return products.map(normalizeProduct);
}

async function request(path, options = {}) {
  const { skipAuthRefresh = false, ...fetchOptions } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  };

  const token = getAccessToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  const payload = await response.json().catch(() => ({}));

  /*
   * If the short-lived access token expires,
   * automatically use the refresh-token cookie.
   */
  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    path !== "/auth/refresh-token"
  ) {
    try {
      const refreshData = await request("/auth/refresh-token", {
        method: "POST",
        skipAuthRefresh: true,
      });

      saveSession(refreshData);

      return request(path, {
        ...fetchOptions,
        skipAuthRefresh: true,
      });
    } catch (refreshError) {
      clearSession();
      throw refreshError;
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.message || "Request failed.");

    error.status = response.status;
    error.errors = payload?.errors || [];

    throw error;
  }

  return payload;
}

export const authApi = {
  async register(body) {
    if (CONFIG.USE_MOCK_DATA) {
      await sleep();

      const user = {
        id: `mock-${Date.now()}`,
        name: body.name,
        email: body.email,
      };

      return {
        user,
        message: "Mock registration successful.",
      };
    }

    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async login(body) {
    if (CONFIG.USE_MOCK_DATA) {
      await sleep();

      const user = {
        id: "mock-user-01",
        name: "ReliveRealm Member",
        email: body.email,
      };

      const data = {
        user,
        accessToken: "phase1-mock-access-token",
        message: "Mock login successful.",
      };

      saveSession(data);

      return data;
    }

    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    saveSession(data);

    return data;
  },

  async me() {
    if (CONFIG.USE_MOCK_DATA) {
      return getStoredUser();
    }

    const data = await request("/auth/me");

    return data.user;
  },

  async logout() {
    if (!CONFIG.USE_MOCK_DATA) {
      await request("/auth/logout", {
        method: "POST",
      });
    }

    clearSession();
  },

  async refresh() {
    if (CONFIG.USE_MOCK_DATA) {
      return {
        accessToken: "phase1-mock-access-token",
      };
    }

    const data = await request("/auth/refresh-token", {
      method: "POST",
      skipAuthRefresh: true,
    });

    saveSession(data);

    return data;
  },
};

export const productApi = {
  async list() {
    if (CONFIG.USE_MOCK_DATA) {
      await sleep(180);

      return structuredClone(MOCK_PRODUCTS);
    }

    const data = await request("/products");

    return normalizeProducts(data.products || []);
  },

  async get(id) {
    if (CONFIG.USE_MOCK_DATA) {
      return MOCK_PRODUCTS.find((product) => product.id === id);
    }

    const data = await request(`/products/${encodeURIComponent(id)}`);

    return normalizeProduct(data.product);
  },

  async create(body) {
    if (CONFIG.USE_MOCK_DATA) {
      await sleep();

      return {
        ...body,
        id: `mock-${Date.now()}`,
      };
    }

    const data = await request("/products", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return normalizeProduct(data.product);
  },

  async update(id, body) {
    if (CONFIG.USE_MOCK_DATA) {
      await sleep();

      return {
        ...body,
        id,
      };
    }

    const data = await request(`/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return normalizeProduct(data.product);
  },

  async remove(id) {
    if (CONFIG.USE_MOCK_DATA) {
      await sleep();

      return { id };
    }

    return request(`/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

export function isMockMode() {
  return CONFIG.USE_MOCK_DATA;
}
