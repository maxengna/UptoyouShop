'use client'

import { useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useState, useRef, useEffect } from 'react'

export function Topbar() {
  const router = useRouter()
  const { user, logout } = useUserStore()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/signin')
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background">
      <div className="flex items-center justify-between h-full px-6">
        <div>
          <h1 className="text-lg font-semibold">
            {user?.name ? `Welcome, ${user.name}` : 'Admin Panel'}
          </h1>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.role || ''}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-md shadow-lg py-1">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
