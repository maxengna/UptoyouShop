'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Minus, Plus, Star, Truck, Shield, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart-store'
import { useProductStore } from '@/store/product-store'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types/product'

// Mock product data - in real app this would come from API
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality. Experience crystal-clear audio with active noise cancellation technology.',
    price: 299.99,
    originalPrice: 399.99,
    images: ['/headphones-1.jpg', '/headphones-2.jpg', '/headphones-3.jpg'],
    category: 'electronics',
    slug: 'wireless-headphones',
    stock: 15,
    sku: 'WH-001',
    rating: 4.5,
    reviews: 128,
    isNew: true,
    isOnSale: true,
    variants: [
      { id: 'v1', name: 'Color', value: 'Black' },
      { id: 'v2', name: 'Color', value: 'Silver' },
      { id: 'v3', name: 'Color', value: 'Blue' },
    ]
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt made from 100% certified organic cotton. Perfect for everyday wear.',
    price: 29.99,
    images: ['/tshirt-1.jpg', '/tshirt-2.jpg'],
    category: 'clothing',
    slug: 'organic-cotton-tshirt',
    stock: 50,
    sku: 'CT-002',
    rating: 4.2,
    reviews: 89,
  },
]

// Mock reviews data
const mockReviews = [
  {
    id: '1',
    author: 'John D.',
    rating: 5,
    date: '2024-01-15',
    title: 'Excellent sound quality!',
    content: 'These headphones exceeded my expectations. The noise cancellation is incredible and the battery life is amazing.',
    verified: true,
  },
  {
    id: '2',
    author: 'Sarah M.',
    rating: 4,
    date: '2024-01-10',
    title: 'Great value for money',
    content: 'Really good headphones for the price. Comfortable to wear for long periods.',
    verified: true,
  },
  {
    id: '3',
    author: 'Mike R.',
    rating: 3,
    date: '2024-01-05',
    title: 'Good but not perfect',
    content: 'Sound quality is good but the build quality could be better. Still happy with the purchase.',
    verified: true,
  },
]

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { addItem } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState('')
  
  // Find product by slug
  const product = mockProducts.find(p => p.slug === slug)
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      quantity,
      price: product.price,
      product,
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          Home
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/category/${product.category}`} className="text-muted-foreground hover:text-primary capitalize">
          {product.category}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage] || '/images/product-placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                New
              </span>
            )}
            {product.isOnSale && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Sale
              </span>
            )}
          </div>
          
          {/* Thumbnail Images */}
          <div className="flex gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square w-20 bg-muted rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image
                  src={image || '/images/product-placeholder.jpg'}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {renderStars(product.rating || 0)}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating || 0} ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* SKU and Stock */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.value)}
                      className={`px-4 py-2 border rounded-md ${
                        selectedVariant === variant.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {variant.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1"
                size="lg"
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>2 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            
            {/* Review Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{product.rating || 0}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(product.rating || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {product.reviews || 0} reviews
                </p>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-8">{stars}★</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : stars === 2 ? 3 : 2}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : stars === 2 ? 3 : 2}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{review.author}</h4>
                          {review.verified && (
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span>•</span>
                          <span>{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <h5 className="font-medium mb-2">{review.title}</h5>
                    <p className="text-muted-foreground">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-6">
              Load More Reviews
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
