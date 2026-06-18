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
  };

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
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified?: boolean;
    createdAt?: string;
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

// Export API error class for error handling
export { ApiError };
