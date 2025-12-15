"use client"

import { Hexagon } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccountSwitcher } from "./account-switcher"

export function WalletHeader() {
  return (
    <header className="border-b-4 border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-border">
              <Hexagon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase">mockwallet.dev</h1>
              <p className="text-xs font-mono font-bold text-muted-foreground">Web3 Testing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AccountSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
