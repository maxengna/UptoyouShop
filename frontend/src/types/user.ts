export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  avatar?: string
  phone?: string
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
