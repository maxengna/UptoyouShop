import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState } from '@/types/user'

interface UserStore extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: {
    name: string
    email: string
    password: string
  }) => Promise<boolean>
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          // TODO: Implement actual API call
          // Mock login for now
          const mockUser: User = {
            id: '1',
            email,
            name: 'John Doe',
            role: 'user',
          }
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
          })
          
          return true
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      register: async (userData: {
        name: string
        email: string
        password: string
      }) => {
        set({ isLoading: true })
        
        try {
          // TODO: Implement actual API call
          // Mock registration for now
          const mockUser: User = {
            id: '1',
            email: userData.email,
            name: userData.name,
            role: 'user',
          }
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
          })
          
          return true
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
