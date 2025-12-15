"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletManager } from "@/lib/wallet/wallet-manager"
import { Check, Plus, Eye, Wallet, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AccountSwitcher() {
  const router = useRouter()
  const { accounts, activeAccountIndex, switchAccount, addAccountFromSeed, disconnectWallet, getAccountBalance } =
    useWallet()
  const [balances, setBalances] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const newBalances: Record<string, string> = {}
        for (const account of accounts) {
          try {
            const balance = await getAccountBalance(account.address)
            newBalances[account.address] = balance
          } catch (error) {
            console.error(`[v0] Error fetching balance for ${account.address}:`, error)
            newBalances[account.address] = "0.0"
          }
        }
        setBalances(newBalances)
      } catch (error) {
        console.error("[v0] Error in fetchBalances:", error)
      }
    }

    if (accounts.length > 0) {
      fetchBalances()
    }
  }, [accounts, getAccountBalance])

  const activeAccount = accounts[activeAccountIndex]
  const canAddAccount = activeAccount?.mnemonic

  const handleAddAccount = () => {
    try {
      addAccountFromSeed()
    } catch (error) {
      console.error("[v0] Failed to add account:", error)
    }
  }

  const handleGoHome = () => {
    disconnectWallet()
    router.push("/")
  }

  if (!activeAccount) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-[3px] border-foreground font-black uppercase brutalist-shadow hover:bg-accent h-11 bg-transparent"
        >
          <div className="flex items-center gap-2 min-w-0">
            {activeAccount.isWatchOnly ? (
              <Eye className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Wallet className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="truncate">{WalletManager.formatAddress(activeAccount.address)}</span>
            <span className="text-xs font-mono text-muted-foreground">
              {balances[activeAccount.address] || "0.0"} ETH
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 border-[3px] border-foreground bg-card p-2">
        <div className="px-2 py-1.5 text-xs font-black uppercase text-muted-foreground">Accounts</div>
        {accounts.map((account, index) => (
          <DropdownMenuItem
            key={account.address}
            onClick={() => switchAccount(index)}
            className="flex items-center gap-3 p-3 font-mono cursor-pointer border-2 border-transparent hover:border-foreground hover:bg-accent mb-1"
          >
            <div className="flex-shrink-0">
              {account.isWatchOnly ? <Eye className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs truncate">{account.label || "Account"}</span>
                {account.isWatchOnly && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-muted border border-foreground">WATCH</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">{account.address}</div>
              <div className="text-xs font-bold mt-0.5">{balances[account.address] || "..."} ETH</div>
            </div>
            {index === activeAccountIndex && <Check className="w-4 h-4 flex-shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-2 bg-foreground h-[2px]" />

        {canAddAccount && (
          <DropdownMenuItem
            onClick={handleAddAccount}
            className="flex items-center gap-2 p-3 font-black uppercase text-xs cursor-pointer border-2 border-foreground hover:bg-primary hover:text-primary-foreground mb-1"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleGoHome}
          className="flex items-center gap-2 p-3 font-black uppercase text-xs cursor-pointer border-2 border-foreground hover:bg-secondary hover:text-secondary-foreground"
        >
          <Home className="w-4 h-4" />
          Import New Wallet
        </DropdownMenuItem>
        {/* </CHANGE> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
