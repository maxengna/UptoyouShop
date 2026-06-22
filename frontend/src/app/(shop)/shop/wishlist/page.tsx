"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, HeartOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useWishlistStore } from "@/store/wishlist-store"
import { useCartStore } from "@/store/cart-store"
import { formatPrice } from "@/lib/utils"

export default function WishlistPage() {
  const { items, loading, fetchWishlist, removeItem } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const handleRemove = async (itemId: string) => {
    setRemoving(itemId)
    try {
      await removeItem(itemId)
      toast.success("Removed from wishlist")
    } catch {
      toast.error("Failed to remove item")
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.product.id,
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image || "/images/product-placeholder.jpg",
      quantity: 1,
      price: item.product.price,
      product: item.product as any,
    })
    toast.success(`${item.product.name} added to cart`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <HeartOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Save items you love to your wishlist and come back anytime
            </p>
            <Button asChild>
              <Link href="/">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={item.product.image || "/images/product-placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.product.originalPrice && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">
                        -{Math.round((1 - item.product.price / item.product.originalPrice) * 100)}%
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                      onClick={() => handleRemove(item.id)}
                      disabled={removing === item.id}
                    >
                      {removing === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      )}
                    </Button>
                    {item.product.stock === 0 && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <Badge variant="secondary" className="text-sm">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="block font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {formatPrice(item.product.price)}
                      </span>
                      {item.product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Button
                      className="w-full gap-2"
                      size="sm"
                      disabled={item.product.stock === 0}
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {item.product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
