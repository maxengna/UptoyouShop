'use client'

import { HeroBanner } from '@/components/shop/hero-banner'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProductStore } from '@/store/product-store'
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Mock data for demonstration
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
    price: 299.99,
    originalPrice: 399.99,
    images: ['/products/wireless-headphones-1.jpg'],
    category: 'electronics',
    slug: 'wireless-headphones',
    stock: 15,
    sku: 'WH-001',
    rating: 4.5,
    reviews: 128,
    isNew: true,
    isOnSale: true,
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt',
    price: 29.99,
    images: ['/products/organic-cotton-tshirt-1.jpg'],
    category: 'clothing',
    slug: 'organic-cotton-tshirt',
    stock: 50,
    sku: 'CT-002',
    rating: 4.2,
    reviews: 89,
  },
  {
    id: '3',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health tracking and GPS',
    price: 199.99,
    originalPrice: 249.99,
    images: ['/products/smart-watch-1.jpg'],
    category: 'electronics',
    slug: 'smart-watch',
    stock: 8,
    sku: 'SW-003',
    rating: 4.7,
    reviews: 203,
    isOnSale: true,
  },
  {
    id: '4',
    name: 'Yoga Mat',
    description: 'Eco-friendly non-slip yoga mat with carrying strap',
    price: 39.99,
    images: ['/products/yoga-mat-1.jpg'],
    category: 'home',
    slug: 'yoga-mat',
    stock: 25,
    sku: 'YM-004',
    rating: 4.3,
    reviews: 67,
  },
]

const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', image: '/categories/electronics.jpg', productCount: 156 },
  { id: '2', name: 'Clothing', slug: 'clothing', image: '/categories/clothing.jpg', productCount: 234 },
  { id: '3', name: 'Home & Garden', slug: 'home', image: '/categories/home.jpg', productCount: 89 },
  { id: '4', name: 'Sports', slug: 'sports', image: '/categories/sports.jpg', productCount: 112 },
]

export default function HomePage() {
  const { setProducts, setFeaturedProducts, setCategories } = useProductStore()

  useEffect(() => {
    // Initialize store with mock data
    setProducts(mockProducts)
    setFeaturedProducts(mockProducts.slice(0, 4))
    setCategories(mockCategories)
  }, [setProducts, setFeaturedProducts, setCategories])

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground">Check out our hand-picked selection of amazing products</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button size="lg" asChild>
            <a href="/category/all">View All Products</a>
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground">Browse our wide range of product categories</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCategories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="group cursor-pointer transition-transform hover:scale-105">
                <CardHeader className="p-0">
                  <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <CardTitle className="text-lg mb-2">{category.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {category.productCount} products
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotions */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Special Offers</h2>
            <p className="text-muted-foreground mb-8">Limited time deals you don't want to miss</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                <p className="text-muted-foreground">On orders over $50</p>
              </Card>
              <Card className="text-center p-6">
                <h3 className="text-xl font-semibold mb-2">20% Off</h3>
                <p className="text-muted-foreground">First time customers</p>
              </Card>
              <Card className="text-center p-6">
                <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
                <p className="text-muted-foreground">30-day return policy</p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
