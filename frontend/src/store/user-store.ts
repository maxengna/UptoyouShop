import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState } from '@/types/user'
import { authApi } from '@/lib/api'

interface UserStore extends AuthState {
  accessToken: string | null
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
      accessToken: null,

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
          const response = await authApi.login({ email, password })

          if (!response.success || !response.data) {
            set({ isLoading: false })
            return false
          }

          const user: User = {
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            role: response.data.role as User['role'],
            emailVerified: response.data.emailVerified,
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })

          return true
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
        })
      },

      register: async (userData: {
        name: string
        email: string
        password: string
      }) => {
        set({ isLoading: true })

        try {
          const response = await authApi.register(userData)

          if (!response.success) {
            set({ isLoading: false })
            return false
          }

          set({
            isLoading: false,
          })

          return true
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
)
