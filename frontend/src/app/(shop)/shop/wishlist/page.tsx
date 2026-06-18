"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, HeartOff } from "lucide-react"
import { toast } from "sonner"

interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  inStock: boolean
  discount?: number
}

const mockWishlist: WishlistItem[] = [
  {
    id: "1",
    name: "Wireless Noise-Cancelling Headphones",
    price: 79.99,
    originalPrice: 129.99,
    image: "/placeholder.svg?height=200&width=200",
    inStock: true,
    discount: 38,
  },
  {
    id: "2",
    name: "Mechanical Gaming Keyboard RGB",
    price: 149.99,
    image: "/placeholder.svg?height=200&width=200",
    inStock: true,
  },
  {
    id: "3",
    name: "Ultra HD Webcam 4K",
    price: 89.99,
    originalPrice: 119.99,
    image: "/placeholder.svg?height=200&width=200",
    inStock: false,
    discount: 25,
  },
  {
    id: "4",
    name: "Ergonomic office chair",
    price: 299.99,
    image: "/placeholder.svg?height=200&width=200",
    inStock: true,
  },
  {
    id: "5",
    name: "USB-C Hub 7-in-1",
    price: 45.99,
    image: "/placeholder.svg?height=200&width=200",
    inStock: true,
  },
  {
    id: "6",
    name: "Portable Bluetooth Speaker",
    price: 199.99,
    originalPrice: 249.99,
    image: "/placeholder.svg?height=200&width=200",
    inStock: true,
    discount: 20,
  },
]

export default function WishlistPage() {
  const [items, setItems] = useState(mockWishlist)

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    toast.success("Removed from wishlist")
  }

  const addToCart = (item: WishlistItem) => {
    toast.success(`${item.name} added to cart`)
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
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setItems([])
                toast.success("Wishlist cleared")
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
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
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.discount && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">
                        -{item.discount}%
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </Button>
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <Badge variant="secondary" className="text-sm">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <Link
                      href={`/product/${item.id}`}
                      className="block font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      className="w-full gap-2"
                      size="sm"
                      disabled={!item.inStock}
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {item.inStock ? "Add to Cart" : "Out of Stock"}
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
