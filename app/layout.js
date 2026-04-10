import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { AuthProviders } from "@/components/auth-providers"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
})

export const metadata = {
  title: "CabxCabs - Reliable Car Rental Services Across India",
  description: "CabxCabs offers a wide range of car rental services across major Indian cities. Whether you need an airport pickup, outstation travel, or hourly rental, we have you covered with our fleet of well-maintained vehicles and trusted drivers.",
  keywords: "CabxCabs, car rental, airport pickup, outstation travel, hourly rental, corporate transportation, reliable car service, trusted drivers, affordable fares",
}

export default function RootLayout({ children }) {

  return (

    <html lang="en" suppressHydrationWarning>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProviders>
            {children}
          </AuthProviders>

          {/* Global Toast */}
          <Toaster richColors position="top-right" />

        </ThemeProvider>

      </body>

    </html>

  )
}