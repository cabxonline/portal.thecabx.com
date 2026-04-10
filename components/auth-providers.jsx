"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"

export function AuthProviders({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
