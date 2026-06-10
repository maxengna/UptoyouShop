'use client'

import { HeroBanner } from '@/components/shop/hero-banner'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProductStore } from '@/store/product-store'
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { productApi } from '@/lib/api'
import { Product } from '@/types/product'

const mapApiProduct = (p: any): Product => ({
  id: String(p.id ?? ''),
  name: p.name,
  description: p.description || '',
  price: parseFloat(p.price) || 0,
  originalPrice: p.comparePrice ? parseFloat(p.comparePrice) : undefined,
  images: p.images?.map((img: any) => img.url) || [],
  category: p.category,
  slug: p.slug || p.name?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
  stock: parseInt(p.stock || '0', 10),
  sku: p.sku,
  rating: p.rating || undefined,
  reviews: p.reviews || undefined,
  isNew: p.isNew || undefined,
  isOnSale: p.isOnSale || undefined,
  variants: p.variants || undefined,
})

export default function HomePage() {
  const { products, setProducts, setFeaturedProducts, setCategories, categories } = useProductStore()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll()
        if (response.success && response.data) {
          const mapped = response.data.products.map(mapApiProduct)
          setProducts(mapped)
          setFeaturedProducts(mapped.slice(0, 4))

          const categoryMap = new Map<string, { name: string; slug: string }>()
          mapped.forEach(p => {
            if (!categoryMap.has(p.category)) {
              categoryMap.set(p.category, {
                name: p.category.charAt(0).toUpperCase() + p.category.slice(1),
                slug: p.category,
              })
            }
          })
          const categories = Array.from(categoryMap.entries()).map(([slug, cat], idx) => ({
            id: String(idx + 1),
            name: cat.name,
            slug: cat.slug,
            image: `/categories/${cat.slug}.jpg`,
            productCount: mapped.filter(p => p.category === cat.slug).length,
          }))
          setCategories(categories)
        }
      } catch (err) {
        console.error('Failed to fetch products:', err)
      }
    }
    fetchProducts()
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
          {products.slice(0, 4).map((product) => (
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
          {categories.map((category) => (
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
