"use client"

import { Hexagon } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccountSwitcher } from "./account-switcher"

export function WalletHeader() {
  return (
    <header className="border-b-4 border-border bg-card z-40 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 bg-primary flex items-center justify-center border-2 border-border shrink-0">
              <Hexagon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase truncate">mockwallet.dev</h1>
              <p className="text-xs font-mono font-semibold text-muted-foreground">Web3 Testing Wallet</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <AccountSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
