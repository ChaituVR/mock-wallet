"use client"

import { Hexagon, Bot } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccountSwitcher } from "./account-switcher"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/lib/wallet/wallet-provider"

export function WalletHeader() {
  const { agentMode, setAgentMode, activeAccount } = useWallet()

  return (
    <header className="border-b-4 border-border bg-card sticky top-0 z-50 shadow-sm">
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
            {activeAccount && !activeAccount.isWatchOnly && (
              <div className="flex items-center gap-1 sm:gap-2">
                <Bot className={`w-4 h-4 ${agentMode ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label htmlFor="agent-mode" className="font-mono text-xs font-bold cursor-pointer hidden sm:inline">
                  Agent
                </Label>
                <Switch
                  id="agent-mode"
                  checked={agentMode}
                  onCheckedChange={setAgentMode}
                  className={agentMode ? 'data-[state=checked]:bg-primary' : ''}
                />
              </div>
            )}
            <ThemeToggle />
            <AccountSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
