// API utility functions

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://your-domain.com"
    : "http://localhost:5000";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface Product {
  id?: number;
  name: string;
  sku: string;
  description?: string;
  price: string;
  comparePrice?: string;
  category: string;
  status: "active" | "draft" | "archived";
  trackInventory: boolean;
  stock?: string;
  weight?: string;
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
  };
  tags: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  images: Array<{
    id: number;
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
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data,
      );
    }

    return data;
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

// Product API functions
export const productApi = {
  // Create a new product
  create: async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ) => {
    return apiRequest<{ success: boolean; message: string; product: Product }>(
      "/api/products",
      {
        method: "POST",
        body: JSON.stringify(productData),
      },
    );
  },

  // Get all products
  getAll: async () => {
    return apiRequest<{ success: boolean; products: Product[] }>(
      "/api/products",
    );
  },

  // Get a single product
  getById: async (id: number) => {
    return apiRequest<{ success: boolean; product: Product }>(
      `/api/products/${id}`,
    );
  },

  // Update a product
  update: async (id: number, productData: Partial<Product>) => {
    return apiRequest<{ success: boolean; message: string; product: Product }>(
      `/api/products/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(productData),
      },
    );
  },

  // Delete a product
  delete: async (id: number) => {
    return apiRequest<{ success: boolean; message: string }>(
      `/api/products/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};

// Export API error class for error handling
export { ApiError };
