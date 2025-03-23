import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

export const metadata = {
  title: "OTC Exchange - Secure Cryptocurrency Trading",
  description: "Trade stablecoins with fiat currency through our automated platform with smart contract escrow.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} tracking-tight`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'