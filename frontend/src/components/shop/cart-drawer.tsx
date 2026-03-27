'use client'

import Image from 'next/image'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { CartItem } from '@/types/order'

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore()

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  if (items.length === 0) {
    return (
      <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={toggleCart}
        />
        
        {/* Drawer */}
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <Button variant="ghost" size="icon" onClick={toggleCart}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Empty Cart */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add some products to your cart to see them here
              </p>
              <Button onClick={toggleCart} className="w-full">
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              Shopping Cart ({totalItems} items)
            </h2>
            <Button variant="ghost" size="icon" onClick={toggleCart}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden">
                        <Image
                          src={item.productImage || '/images/product-placeholder.jpg'}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatPrice(item.price)}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-auto text-red-500 hover:text-red-600"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="border-t p-4 space-y-4">
            {/* Promo Code */}
            <div className="flex gap-2">
              <Input
                placeholder="Promo code"
                className="flex-1"
              />
              <Button variant="outline">
                Apply
              </Button>
            </div>
            
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <a href="/checkout">Proceed to Checkout</a>
              </Button>
              <Button variant="outline" className="w-full" onClick={toggleCart}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
