import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HydrationGate } from '@/lib/hydrated'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HydrationGate>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </HydrationGate>
  )
}
