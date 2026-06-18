import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState } from '@/types/user'
import { authApi, setAccessToken } from '@/lib/api'
import { setAuthCookie, clearAuthCookie } from '@/lib/auth-cookie'

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

          const userData = response.data.user
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role as User['role'],
            phone: userData.phone,
          }

          setAuthCookie({
            authenticated: true,
            role: user.role,
            name: user.name,
          })

          setAccessToken(response.data.accessToken)

          set({
            user,
            isAuthenticated: true,
            accessToken: response.data.accessToken,
            isLoading: false,
          })

          return true
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        clearAuthCookie()
        setAccessToken(null)
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
