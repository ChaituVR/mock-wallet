"use client"

import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletSetup } from "@/components/wallet/wallet-setup"
import { WalletDashboard } from "@/components/wallet/wallet-dashboard"
import { StatusBar } from "@/components/wallet/status-bar"
import { KeyboardShortcutsHelp } from "@/components/wallet/keyboard-shortcuts-help"

export default function Home() {
  const { isConnected } = useWallet()

  if (!isConnected) {
    return <WalletSetup />
  }

  return (
    <>
      <StatusBar />
      <div className="pt-14">
        <WalletDashboard />
      </div>
      <KeyboardShortcutsHelp />
    </>
  )
}
