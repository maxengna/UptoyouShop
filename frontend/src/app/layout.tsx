import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { StickyCartBar } from '@/components/shop/sticky-cart-bar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UpToYouShop - Modern E-Commerce',
  description: 'A modern, scalable e-commerce platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <StickyCartBar />
        </div>
      </body>
    </html>
  )
}
