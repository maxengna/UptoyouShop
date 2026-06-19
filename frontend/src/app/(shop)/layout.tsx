import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { StickyCartBar } from '@/components/shop/sticky-cart-bar'
import { HydrationGate } from '@/lib/hydrated'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HydrationGate>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <StickyCartBar />
      </HydrationGate>
    </>
  )
}
