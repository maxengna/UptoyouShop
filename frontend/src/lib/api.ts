// API utility functions

export const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://your-domain.com"
    : "http://localhost:5000";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  showAll?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Product {
  id?: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  comparePrice?: number;
  category: string;
  status: "active" | "draft" | "archived";
  trackInventory: boolean;
  stock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  images: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Token management
let _accessToken: string | null = null
let _refreshPromise: Promise<boolean> | null = null

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
    if (!res.ok) return false
    const data = await res.json()
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken)
      return true
    }
    return false
  } catch {
    return false
  }
}

async function apiRequest<T>(
  endpoint: string,
  options?: {
    method?: string;
    body?: any;
  },
  skipContentType?: boolean,
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    method: options?.method || "GET",
    headers: {},
    credentials: "include",
  };

  // Attach access token if available
  if (_accessToken) {
    config.headers = {
      ...config.headers,
      "Authorization": `Bearer ${_accessToken}`,
    };
  }

  // Only set Content-Type if not FormData and body exists
  if (!skipContentType && options?.body) {
    config.headers = {
      ...config.headers,
      "Content-Type": "application/json",
    };
    config.body = JSON.stringify(options.body);
  } else if (options?.body) {
    // For FormData, let browser set Content-Type automatically
    config.body = options.body;
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Token expired, try refresh
      if (!_refreshPromise) {
        _refreshPromise = attemptRefresh()
      }
      const refreshed = await _refreshPromise
      _refreshPromise = null
      if (refreshed && _accessToken) {
        config.headers = {
          ...config.headers,
          "Authorization": `Bearer ${_accessToken}`,
        };
        const retryResponse = await fetch(url, config);
        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }
      throw new ApiError("Unauthorized", 401);
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(
        data.message || data.error || `HTTP error! status: ${response.status}`,
        response.status,
        data,
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("API request failed:", error);
    throw new ApiError(
      "Network error. Please check your connection.",
      0,
      error,
    );
  }
}

// Upload API (files stored in AWS S3, imageKey saved in product_images)
export const uploadApi = {
  // Upload a single file to S3
  uploadFile: async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append("file", file);

    const query = folder ? `?folder=${encodeURIComponent(folder)}` : "";

    return apiRequest<{
      success: boolean;
      data: {
        imageKey: string;
        url: string;
        originalName: string;
        size: number;
        type: string;
      };
    }>(
      `/api/upload${query}`,
      {
        method: "POST",
        body: formData,
      },
      true, // Skip Content-Type for FormData
    );
  },

  // Delete a file from S3
  deleteFile: async (imageKey: string, bucket?: "products" | "categories") => {
    let query = `key=${encodeURIComponent(imageKey)}`;
    if (bucket) query += `&bucket=${bucket}`;
    return apiRequest<{ success: boolean; message: string }>(
      `/api/upload?${query}`,
      {
        method: "DELETE",
      },
    );
  },
};

// Product API functions
export const productApi = {
  // Create a new product
  create: async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: { product: Product };
    }>("/api/products", {
      method: "POST",
      body: productData, // Don't stringify here, apiRequest will do it
    });
  },

  // Get all products (with optional pagination/filter params)
  getAll: async (params?: ProductQueryParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.showAll) query.set("showAll", "true");
    const qs = query.toString();
    return apiRequest<{
      success: boolean;
      message: string;
      data: { products: Product[]; pagination: PaginationMeta };
    }>(`/api/products${qs ? `?${qs}` : ""}`);
  },

  // Get a single product
  getById: async (id: string) => {
    return apiRequest<{ success: boolean; data: { product: Product } }>(
      `/api/products/${id}`,
    );
  },

  // Update a product
  update: async (id: string, productData: Record<string, any>) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: { product: Product };
    }>(`/api/products/${id}`, {
      method: "PUT",
      body: productData, // Don't stringify here, apiRequest will do it
    });
  },

  // Delete a product
  delete: async (id: string | number) => {
    return apiRequest<{ success: boolean; message: string }>(
      `/api/products/${id}`,
      {
        method: "DELETE",
      },
    );
  },

  // Get next available SKU
  getNextSku: async (prefix?: string) => {
    const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : "";
    return apiRequest<{ success: boolean; data: { sku: string } }>(
      `/api/products/next-sku${query}`,
    );
  },

  // Health check
  health: async () => {
    return apiRequest<{ status: string }>("/api/health", {
      method: "GET",
    });
  },
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageKey?: string;
  imageUrl?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
}

// Category API functions
export const categoryApi = {
  getAll: async (params?: CategoryQueryParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiRequest<{
      success: boolean;
      data: { categories: Category[]; pagination?: PaginationMeta };
      categories: Category[];
      message: string;
    }>(`/api/categories${qs ? `?${qs}` : ""}`);
  },

  getById: async (id: string) => {
    return apiRequest<{
      success: boolean;
      data: Category;
      message: string;
    }>(`/api/categories/${id}`);
  },

  create: async (data: {
    name: string;
    slug: string;
    description?: string;
    imageKey?: string;
    parentId?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) => {
    return apiRequest<{
      success: boolean;
      data: Category;
      message: string;
    }>("/api/categories", {
      method: "POST",
      body: data,
    });
  },

  update: async (id: string, data: Partial<{
    name: string;
    slug: string;
    description?: string;
    imageKey?: string;
    parentId?: string;
    isActive?: boolean;
    sortOrder?: number;
  }>) => {
    return apiRequest<{
      success: boolean;
      data: Category;
      message: string;
    }>(`/api/categories/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  delete: async (id: string) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/api/categories/${id}`, {
      method: "DELETE",
    });
  },
};

// Auth API functions
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      phone?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
  error?: string;
  details?: any;
  status?: number;
}

export const authApi = {
  register: async (data: RegisterData) => {
    return apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: data,
    });
  },

  login: async (data: LoginData) => {
    return apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: data,
    });
  },
};

// User API functions
export const userApi = {
  getProfile: async () => {
    return apiRequest<{
      success: boolean;
      data: {
        id: string;
        name: string;
        email: string;
        role: string;
        phone?: string;
        avatar?: string;
        createdAt: string;
      };
    }>("/api/users");
  },

  updateProfile: async (data: { name?: string; phone?: string; avatar?: string }) => {
    return apiRequest<{ success: boolean; message: string; data: any }>(
      "/api/users",
      { method: "PUT", body: data },
    );
  },

  getOrders: async (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return apiRequest<{ success: boolean; data: { orders: any[]; pagination: any } }>(
      `/api/users/orders${qs ? `?${qs}` : ""}`,
    );
  },

  getWishlist: async () => {
    return apiRequest<{ success: boolean; data: { items: any[] } }>("/api/wishlist");
  },

  addToWishlist: async (productId: string) => {
    return apiRequest<{ success: boolean; message: string }>("/api/wishlist", {
      method: "POST",
      body: { productId },
    });
  },

  removeFromWishlist: async (productId: string) => {
    return apiRequest<{ success: boolean; message: string }>(
      `/api/wishlist/${productId}`,
      { method: "DELETE" },
    );
  },
};

// Admin API functions
export const adminApi = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.role) query.set("role", params.role);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return apiRequest<{
      success: boolean;
      message?: string;
      data: {
        users: Array<{
          id: string;
          email: string;
          name: string | null;
          role: string;
          emailVerified: boolean;
          createdAt: string;
          updatedAt: string;
          _count: { orders: number };
        }>;
        pagination: PaginationMeta;
      };
    }>(`/api/admin/users${qs ? `?${qs}` : ""}`);
  },

  getUserById: async (id: string) => {
    return apiRequest<{
      success: boolean;
      message?: string;
      data: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        emailVerified: boolean;
        avatar: string | null;
        phone: string | null;
        createdAt: string;
        updatedAt: string;
        _count: { orders: number };
        addresses: Array<{
          id: string;
          type: string;
          firstName: string;
          lastName: string;
          address1: string;
          address2?: string;
          city: string;
          state: string;
          zipCode: string;
          country: string;
          phone?: string;
          isDefault: boolean;
        }>;
        recentOrders: Array<{
          id: string;
          status: string;
          total: number;
          createdAt: string;
          items: Array<{
            product: { id: string; name: string };
          }>;
        }>;
        totalSpent: number;
      };
    }>(`/api/admin/users/${id}`);
  },

  updateUserRole: async (id: string, role: string) => {
    return apiRequest<{
      success: boolean;
      message?: string;
      data: { id: string; email: string; name: string; role: string };
    }>(`/api/admin/users/${id}/role`, {
      method: "PUT",
      body: { role },
    });
  },
};

// Export API error class for error handling
export { ApiError };
