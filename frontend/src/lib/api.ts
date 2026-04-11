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
        data.message || `HTTP error! status: ${response.status}`,
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

// Upload API
export const uploadApi = {
  // Upload a single file
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest<{
      success: boolean;
      data: {
        url: string;
        filename: string;
        originalName: string;
        size: number;
        type: string;
      };
    }>(
      "/api/upload",
      {
        method: "POST",
        body: formData,
      },
      true, // Skip Content-Type for FormData
    );
  },

  // Delete a file
  deleteFile: async (filePath: string) => {
    return apiRequest<{ success: boolean; message: string }>(
      `/api/upload?path=${encodeURIComponent(filePath)}`,
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
    }>("/products", {
      method: "POST",
      body: productData, // Don't stringify here, apiRequest will do it
    });
  },

  // Get all products
  getAll: async () => {
    return apiRequest<{ success: boolean; data: { products: Product[] } }>(
      "/products",
    );
  },

  // Get a single product
  getById: async (id: string) => {
    return apiRequest<{ success: boolean; data: { product: Product } }>(
      `/products/${id}`,
    );
  },

  // Update a product
  update: async (id: string, productData: Record<string, any>) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: { product: Product };
    }>(`/products/${id}`, {
      method: "PUT",
      body: productData, // Don't stringify here, apiRequest will do it
    });
  },

  // Delete a product
  delete: async (id: number) => {
    return apiRequest<{ success: boolean; message: string }>(
      `/products/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};

// Export API error class for error handling
export { ApiError };
