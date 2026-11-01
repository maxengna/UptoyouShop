export interface Product {
  id: any;
  name: string;
  slug: string;
  description?: string;
  price: any;
  originalPrice?: any;
  sku: string;
  stock: any;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  categoryId: string;
  isActive: boolean;
  isNew: boolean;
  isOnSale: boolean;
  tags: string[];
  images: Array<{
    id: string;
    url: string;
    sortOrder: number;
  }>;
  createdAt: string;
  updatedAt: string;
  inventory?: {
    quantity: string;
    reorderLevel: string;
  };
  averageRating?: string | null;
  reviewCount: string;
}

export const getStatusFromProduct = (product: Pick<Product, 'stock' | 'isActive'>): string => {
  if (product.stock === 0) return 'out-of-stock';
  if (!product.isActive) return 'draft';
  return 'active';
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(price);
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'out-of-stock':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};