import {
  getStatusFromProduct,
  getStatusColor,
} from '@/app/(admin)/products/page';
import type { Product } from '@/app/(admin)/products/page';

const createProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Product 1',
  slug: 'product-1',
  price: 100,
  originalPrice: 100,
  sku: 'sku-1',
  stock: 10,
  category: {
    id: '1',
    name: 'category-1',
    slug: 'category-1',
  },
  categoryId: 'category-1',
  isActive: true,
  isNew: true,
  isOnSale: true,
  tags: ['tag-1'],
  images: [
    {
      id: '1',
      url: 'https://example.com/product-1',
      sortOrder: 1,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  reviewCount: '0',
  ...overrides,
});

describe('getStatusFromProduct', () => {
  it('return out-of-stock when stock is 0', () => {
    const product = createProduct({ stock: 0 });
    expect(getStatusFromProduct(product)).toBe('out-of-stock');
  });

  it('return draft when product is inactive', () => {
    const product = createProduct({ isActive: false });
    expect(getStatusFromProduct(product)).toBe('draft');
  });

  it('return active when product is active and in stock', () => {
    const product = createProduct({ isActive: true, stock: 10 });
    expect(getStatusFromProduct(product)).toBe('active');
  });
});

describe('getStatusColor', () => {
  it('return bg-green-100 text-green-800 when status active', () => {
    expect(getStatusColor('active')).toBe('bg-green-100 text-green-800');
  });

  it('return bg-red-100 text-red-800 when status out-of-stock', () => {
    expect(getStatusColor('out-of-stock')).toBe('bg-red-100 text-red-800');
  });

  it('return bg-yellow-100 text-yellow-800 when status draft', () => {
    expect(getStatusColor('draft')).toBe('bg-yellow-100 text-yellow-800');
  });

  it('return bg-gray-100 text-gray-800 when status archived', () => {
    expect(getStatusColor('archived')).toBe('bg-gray-100 text-gray-800');
  });

  it('return bg-gray-100 text-gray-800 when status all', () => {
    expect(getStatusColor('all')).toBe('bg-gray-100 text-gray-800');
  });
});
