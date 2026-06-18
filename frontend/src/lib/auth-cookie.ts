const AUTH_COOKIE_NAME = 'auth'
const COOKIE_PATH = '/'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days

export interface AuthCookieData {
  authenticated: boolean
  role: string
  name: string
}

export function setAuthCookie(data: AuthCookieData) {
  const value = JSON.stringify(data)
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(value)}; path=${COOKIE_PATH}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=${COOKIE_PATH}; max-age=0; SameSite=Lax`
}
