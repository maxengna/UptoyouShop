'use client'

import { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''

  useEffect(() => {
    if (!facebookAppId) return

    // Load Facebook SDK
    const fbScript = document.createElement('script')
    fbScript.src = 'https://connect.facebook.net/en_US/sdk.js'
    fbScript.async = true
    fbScript.defer = true
    fbScript.crossOrigin = 'anonymous'
    fbScript.onload = () => {
      ;(window as any).FB.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      })
    }
    document.body.appendChild(fbScript)

    return () => {
      if (document.body.contains(fbScript)) {
        document.body.removeChild(fbScript)
      }
    }
  }, [facebookAppId])

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
