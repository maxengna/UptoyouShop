'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Grid, List, ChevronDown, Package, Loader2, ArrowLeft, PackageX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/shop/product-card'
import { useProductStore } from '@/store/product-store'
import { debounce } from '@/lib/utils'
import { useCategoryStore } from '@/store/category-store'
import { productApi } from '@/lib/api'
import { Product } from '@/types/product'

interface CategoryNav {
  id: string;
  name: string;
  slug: string;
}

const mapApiProduct = (p: any): Product => ({
  id: String(p.id ?? ''),
  name: p.name,
  description: p.description || '',
  price: parseFloat(p.price) || 0,
  originalPrice: p.comparePrice ? parseFloat(p.comparePrice) : undefined,
  images: p.images?.map((img: any) => img.url).filter(Boolean) || [],
  category: typeof p.category === 'string' ? p.category : (p.category?.slug || ''),
  slug: p.slug || '',
  stock: parseInt(p.stock ?? '0', 10),
  sku: p.sku || '',
  rating: p.averageRating ?? p.rating ?? undefined,
  reviews: p.reviewCount ?? p.reviews ?? undefined,
  isNew: p.isNew ?? undefined,
  isOnSale: p.comparePrice ? parseFloat(p.comparePrice) > parseFloat(p.price) : undefined,
  variants: p.variants?.map((v: any) => ({ id: v.id, name: v.name, value: v.value, price: v.price ? parseFloat(v.price) : undefined })) || undefined,
})

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.slug as string
  
  const { 
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { categories: storeCategories, fetchCategories } = useCategoryStore()
  const fetchedCategories: CategoryNav[] = [
    { id: 'all', name: 'All Products', slug: 'all' },
    ...storeCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  ]
  const productsPerPage = 12

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    setSelectedCategory(categorySlug === 'all' ? '' : categorySlug)
    fetchProducts()
  }, [categorySlug, setSelectedCategory])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = { category: categorySlug === 'all' ? undefined : categorySlug, limit: 200 }
      const response = await productApi.getAll(params)
      if (response.success) {
        const mapped = (response.data?.products || []).map(mapApiProduct)
        setProducts(mapped)
      } else {
        setProducts([])
        setError('Failed to fetch products')
      }
    } catch {
      setProducts([])
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

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

  const currentCategory = fetchedCategories.find(cat => cat.slug === categorySlug)
  const filteredProducts = getFilteredProducts()
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button onClick={fetchProducts}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {currentCategory?.name || 'Products'}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} products found
          </p>
        </div>
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
                {fetchedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug === 'all' ? '' : cat.slug)
                      setCurrentPage(1)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      (cat.slug === 'all' && !selectedCategory) || selectedCategory === cat.slug
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {cat.name}
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
                ) : (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">${product.price.toFixed(2)}</span>
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
              <PackageX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
