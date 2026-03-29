import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - UpToYouShop',
  description: 'Sign in or create your UpToYouShop account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}