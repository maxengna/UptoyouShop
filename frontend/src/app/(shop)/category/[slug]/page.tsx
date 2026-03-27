'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/shop/product-card'
import { useProductStore } from '@/store/product-store'
import { debounce } from '@/lib/utils'
import { Product } from '@/types/product'

// Mock products data - in real app this would come from API
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones',
    price: 299.99,
    originalPrice: 399.99,
    images: ['/headphones.jpg'],
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
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health tracking',
    price: 199.99,
    originalPrice: 249.99,
    images: ['/smartwatch.jpg'],
    category: 'electronics',
    slug: 'smart-watch',
    stock: 8,
    sku: 'SW-003',
    rating: 4.7,
    reviews: 203,
    isOnSale: true,
  },
  {
    id: '3',
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand',
    price: 49.99,
    images: ['/laptop-stand.jpg'],
    category: 'electronics',
    slug: 'laptop-stand',
    stock: 25,
    sku: 'LS-004',
    rating: 4.3,
    reviews: 67,
  },
  {
    id: '4',
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with multiple ports',
    price: 39.99,
    images: ['/usb-hub.jpg'],
    category: 'electronics',
    slug: 'usb-c-hub',
    stock: 30,
    sku: 'UH-005',
    rating: 4.1,
    reviews: 45,
  },
  {
    id: '5',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 29.99,
    images: ['/mouse.jpg'],
    category: 'electronics',
    slug: 'wireless-mouse',
    stock: 40,
    sku: 'WM-006',
    rating: 4.4,
    reviews: 89,
  },
  {
    id: '6',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 89.99,
    images: ['/keyboard.jpg'],
    category: 'electronics',
    slug: 'mechanical-keyboard',
    stock: 12,
    sku: 'MK-007',
    rating: 4.6,
    reviews: 156,
    isNew: true,
  },
]

const categories = [
  { id: 'all', name: 'All Products', slug: 'all' },
  { id: 'electronics', name: 'Electronics', slug: 'electronics' },
  { id: 'clothing', name: 'Clothing', slug: 'clothing' },
  { id: 'home', name: 'Home & Garden', slug: 'home' },
  { id: 'sports', name: 'Sports', slug: 'sports' },
]

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.slug as string
  
  const { 
    products, 
    setProducts, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    sortBy, 
    setSortBy, 
    priceRange, 
    setPriceRange, 
    getFilteredProducts 
  } = useProductStore()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  // Initialize products on mount
  useEffect(() => {
    setProducts(mockProducts)
    setSelectedCategory(categorySlug === 'all' ? '' : categorySlug)
  }, [categorySlug, setProducts, setSelectedCategory])

  // Get filtered products
  const filteredProducts = getFilteredProducts()
  
  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value as any)
    setCurrentPage(1)
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max])
    setCurrentPage(1)
  }

  const currentCategory = categories.find(cat => cat.slug === categorySlug)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {currentCategory?.name || 'Products'}
        </h1>
        <p className="text-muted-foreground">
          {filteredProducts.length} products found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 space-y-6">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
            {/* Search */}
            <div>
              <h3 className="font-medium mb-3">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.slug === 'all' ? '' : category.slug)
                      setCurrentPage(1)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      (category.slug === 'all' && !selectedCategory) || selectedCategory === category.slug
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(Number(e.target.value), priceRange[1])}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(priceRange[0], Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceRangeChange(0, 100)}
                  >
                    Under $100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceRangeChange(100, 500)}
                  >
                    $100-$500
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceRangeChange(500, 10000)}
                  >
                    Over $500
                  </Button>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-medium mb-3">Rating</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted"
                  >
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span>& Up</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="popularity">Sort by: Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {paginatedProducts.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {paginatedProducts.map((product) => (
                viewMode === 'grid' ? (
                  <ProductCard key={product.id} product={product} />
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{product.price}</span>
                            <Button size="sm">Add to Cart</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
                setPriceRange([0, 10000])
                setCurrentPage(1)
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
