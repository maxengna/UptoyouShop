export interface SocialAuthResult {
  success: boolean
  accessToken?: string
  error?: string
}

export const googleAuth = (): Promise<SocialAuthResult> => {
  return new Promise((resolve) => {
    try {
      const google = (window as any).google
      if (!google?.accounts?.oauth2) {
        resolve({ success: false, error: 'Google Sign-In is not loaded yet. Please try again.' })
        return
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'openid email profile',
        callback: (response: any) => {
          if (response.access_token) {
            resolve({ success: true, accessToken: response.access_token })
          } else {
            resolve({ success: false, error: 'Google authentication failed' })
          }
        },
        error_callback: (error: any) => {
          resolve({ success: false, error: error?.message || 'Google authentication failed' })
        },
      })
      client.requestAccessToken()
    } catch (error: any) {
      resolve({ success: false, error: error?.message || 'Failed to authenticate with Google' })
    }
  })
}

export const facebookAuth = (): Promise<SocialAuthResult> => {
  return new Promise((resolve) => {
    try {
      const fb = (window as any).FB
      if (!fb) {
        resolve({ success: false, error: 'Facebook SDK is not loaded yet. Please try again.' })
        return
      }

      fb.login(
        (response: any) => {
          if (response.authResponse) {
            resolve({ success: true, accessToken: response.authResponse.accessToken })
          } else {
            resolve({ success: false, error: 'Facebook authentication cancelled' })
          }
        },
        { scope: 'email,public_profile' },
      )
    } catch (error: any) {
      resolve({ success: false, error: error?.message || 'Failed to authenticate with Facebook' })
    }
  })
}
