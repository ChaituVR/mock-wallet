"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletManager } from "@/lib/wallet/wallet-manager"
import { Check, Plus, Eye, Wallet, Download, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AccountSwitcher() {
  const { accounts, activeAccountIndex, switchAccount, addAccountFromSeed, addWallet, getAccountBalance } =
    useWallet()
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importValue, setImportValue] = useState("")
  const [importError, setImportError] = useState("")

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

  const handleImportWallet = () => {
    try {
      setImportError("")
      addWallet(importValue)
      setImportValue("")
      setShowImportDialog(false)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to import wallet")
    }
  }

  // Show import button if no accounts
  if (!activeAccount) {
    return (
      <>
        <Button
          onClick={() => setShowImportDialog(true)}
          variant="outline"
          className="gap-2 border-[3px] border-foreground font-black uppercase brutalist-shadow hover:bg-accent h-11 bg-transparent"
        >
          <Download className="w-4 h-4" />
          Import Wallet
        </Button>

        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="border-4 border-foreground bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">Import Wallet</DialogTitle>
              <DialogDescription className="font-mono font-bold">
                Import using private key, mnemonic phrase, or Ethereum address (watch-only).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Private key, mnemonic phrase, or 0x address..."
                value={importValue}
                onChange={(e) => {
                  setImportValue(e.target.value)
                  setImportError("")
                }}
                className="font-mono text-sm border-2 border-foreground"
              />
              {importError && (
                <Alert className="border-2 border-foreground bg-destructive">
                  <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                  <AlertDescription className="text-xs font-mono font-bold text-destructive-foreground">
                    {importError}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleImportWallet}
                size="lg"
                className="w-full h-12 font-black uppercase border-2 border-foreground brutalist-shadow"
                disabled={!importValue.trim()}
              >
                <Download className="w-4 h-4 mr-2" />
                Import Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

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
          onClick={() => setShowImportDialog(true)}
          className="flex items-center gap-2 p-3 font-black uppercase text-xs cursor-pointer border-2 border-foreground hover:bg-secondary hover:text-secondary-foreground"
        >
          <Download className="w-4 h-4" />
          Import New Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="border-4 border-foreground bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Import Wallet</DialogTitle>
            <DialogDescription className="font-mono font-bold">
              Import using private key, mnemonic phrase, or Ethereum address (watch-only).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Private key, mnemonic phrase, or 0x address..."
              value={importValue}
              onChange={(e) => {
                setImportValue(e.target.value)
                setImportError("")
              }}
              className="font-mono text-sm border-2 border-foreground"
            />
            {importError && (
              <Alert className="border-2 border-foreground bg-destructive">
                <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                <AlertDescription className="text-xs font-mono font-bold text-destructive-foreground">
                  {importError}
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleImportWallet}
              size="lg"
              className="w-full h-12 font-black uppercase border-2 border-foreground brutalist-shadow"
              disabled={!importValue.trim()}
            >
              <Download className="w-4 h-4 mr-2" />
              Import Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
