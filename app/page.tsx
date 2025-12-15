"use client"

import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletSetup } from "@/components/wallet/wallet-setup"
import { WalletDashboard } from "@/components/wallet/wallet-dashboard"

export default function Home() {
  const { isConnected } = useWallet()

  if (!isConnected) {
    return <WalletSetup />
  }

  return <WalletDashboard />
}
