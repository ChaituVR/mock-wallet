import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WalletProvider } from "@/lib/wallet/wallet-provider"
import "./globals.css"

const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
})
const _jetbrains = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reown Dev Wallet | Web3 Testing Sandbox",
  description:
    "The ultimate Web3 test wallet for developers. Test transactions on Sepolia and other testnets. Connect to any dApp via WalletConnect. Auto-import via URL for seamless testing.",
  keywords: ["web3", "wallet", "test", "sepolia", "ethereum", "walletconnect", "reown", "developer", "sandbox"],
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <WalletProvider>{children}</WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
