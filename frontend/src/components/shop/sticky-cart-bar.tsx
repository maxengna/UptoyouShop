"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, ChevronUp } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function StickyCartBar() {
  const { items, getTotalPrice, getTotalItems, toggleCart } = useCartStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Show/hide based on scroll position and cart items
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 200 && totalItems > 0;
      setIsVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalItems]);

  if (!isVisible || totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Main Bar */}
      <div className="bg-background border-t shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Cart Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(totalPrice)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2"
              >
                <ChevronUp
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
              <Button size="sm" onClick={toggleCart} className="min-w-[100px]">
                View Cart
              </Button>
            </div>
          </div>

          {/* Expanded View */}
          {isExpanded && (
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="max-h-48 overflow-y-auto space-y-2">
                {items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-muted rounded flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.productImage || '/images/product-placeholder.jpg'}
                          alt={item.productName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="truncate">{item.productName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-muted-foreground">
                        x{item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Total</span>
                <span className="font-bold">{formatPrice(totalPrice)}</span>
              </div>

              <Button className="w-full" asChild>
                <a href="/checkout">Proceed to Checkout</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
