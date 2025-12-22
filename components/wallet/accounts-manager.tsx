"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletManager } from "@/lib/wallet/wallet-manager"
import { Wallet, Eye, Copy, Check, Trash2, Download } from "lucide-react"

export function AccountsManager() {
  const { accounts, activeAccountIndex, switchAccount, getAccountBalance } = useWallet()
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const newBalances: Record<string, string> = {}
        for (const account of accounts) {
          try {
            const balance = await getAccountBalance(account.address)
            newBalances[account.address] = balance
          } catch (error) {
            console.error(`Error fetching balance for ${account.address}:`, error)
            newBalances[account.address] = "0.0"
          }
        }
        setBalances(newBalances)
      } catch (error) {
        console.error("Error in fetchBalances:", error)
      }
    }

    if (accounts.length > 0) {
      fetchBalances()
    }
  }, [accounts, getAccountBalance])

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const getTotalBalance = () => {
    return Object.values(balances)
      .reduce((sum, balance) => sum + parseFloat(balance || "0"), 0)
      .toFixed(4)
  }

  const downloadAllWallets = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
    const rows: string[] = []
    
    accounts.forEach(account => {
      if (account.isWatchOnly) {
        rows.push([
          account.address,
          "",
          "",
          account.label || "",
          "Watch Only"
        ].join(","))
      } else if (account.mnemonic) {
        rows.push([
          account.address,
          `"${account.mnemonic}"`,
          account.derivationIndex ?? 0,
          account.label || "",
          "Mnemonic"
        ].join(","))
      } else if (account.privateKey) {
        rows.push([
          account.address,
          account.privateKey,
          "",
          account.label || "",
          "Private Key"
        ].join(","))
      }
    })
    
    const csvContent = [
      ["Address", "Private Key/Mnemonic", "Derivation Index", "Label", "Type"].join(","),
      ...rows
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wallets-backup-${timestamp}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">All Accounts</h2>
          <p className="text-sm font-mono font-bold text-muted-foreground">
            Manage your wallets and view balances
          </p>
        </div>
        <Button
          onClick={downloadAllWallets}
          variant="outline"
          size="sm"
          disabled={accounts.length === 0}
          className="font-black uppercase border-2 border-foreground"
        >
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <Card className="brutalist-border bg-primary/10">
        <CardHeader className="pb-3 border-b-2 border-foreground">
          <CardTitle className="text-lg font-black uppercase">Total Balance</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-4xl font-black font-mono">{getTotalBalance()} ETH</div>
          <p className="text-sm font-mono font-bold text-muted-foreground mt-1">
            Across {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {accounts.map((account, index) => (
          <Card
            key={account.address}
            className={`brutalist-border transition-all ${
              index === activeAccountIndex ? "border-primary border-4" : "border-foreground border-2"
            }`}
          >
            <CardHeader className="pb-3 border-b-2 border-foreground">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-primary flex items-center justify-center border-2 border-foreground shrink-0">
                    {account.isWatchOnly ? (
                      <Eye className="w-6 h-6 text-primary-foreground" />
                    ) : (
                      <Wallet className="w-6 h-6 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-black uppercase text-base truncate">
                        {account.ensName || account.label || `Account ${index + 1}`}
                      </h3>
                      {account.ensName && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 border border-blue-500 text-blue-700 dark:text-blue-300 font-mono"
                        >
                          ENS
                        </Badge>
                      )}
                      {account.isWatchOnly && !account.ensName && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0.5 bg-muted border border-foreground font-mono"
                        >
                          WATCH
                        </Badge>
                      )}
                      {index === activeAccountIndex && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground border border-foreground font-mono"
                        >
                          ACTIVE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground truncate">
                        {account.address}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyAddress(account.address)}
                      >
                        {copiedAddress === account.address ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-bold text-muted-foreground uppercase mb-1">Balance</p>
                  <p className="text-2xl font-black font-mono">{balances[account.address] || "..."} ETH</p>
                </div>
                {index !== activeAccountIndex && (
                  <Button
                    onClick={() => switchAccount(index)}
                    size="sm"
                    className="font-black uppercase border-2 border-foreground"
                  >
                    Switch To
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
