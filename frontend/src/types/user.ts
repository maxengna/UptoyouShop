export interface User {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'
  avatar?: string
  phone?: string
  emailVerified?: boolean
  addresses?: Address[]
}

export interface Address {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
