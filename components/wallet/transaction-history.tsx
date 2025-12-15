"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletManager } from "@/lib/wallet/wallet-manager"
import { getChainById } from "@/lib/wallet/chain-config"
import { History, ExternalLink, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle } from "lucide-react"
import { ethers } from "ethers"

interface TransactionHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string
  blockNumber: number
  timestamp?: number
  status: "success" | "failed" | "pending"
  type: "sent" | "received"
}

export function TransactionHistory({ open, onOpenChange }: TransactionHistoryProps) {
  const { account, getProvider, chainId } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const chain = getChainById(chainId)

  useEffect(() => {
    if (open && account) {
      fetchTransactions()
    }
  }, [open, account, chainId])

  const fetchTransactions = async () => {
    if (!account) return

    setIsLoading(true)
    setError("")

    try {
      const provider = getProvider()
      if (!provider) {
        throw new Error("Provider not available")
      }

      // Get recent blocks to check for transactions
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - 10000) // Last ~10k blocks

      console.log("[v0] Fetching transaction history from block", fromBlock, "to", currentBlock)

      // Note: This is a simplified version. In production, you'd use an indexer or API
      const txs: Transaction[] = []

      // Check recent blocks (limited for performance)
      const blocksToCheck = Math.min(100, currentBlock - fromBlock)

      for (let i = 0; i < blocksToCheck; i++) {
        const blockNum = currentBlock - i
        try {
          const block = await provider.getBlock(blockNum, true)

          if (block && block.transactions) {
            for (const tx of block.transactions) {
              if (typeof tx === "string") continue

              const isFrom = tx.from.toLowerCase() === account.address.toLowerCase()
              const isTo = tx.to?.toLowerCase() === account.address.toLowerCase()

              if (isFrom || isTo) {
                const receipt = await provider.getTransactionReceipt(tx.hash)

                txs.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: ethers.formatEther(tx.value),
                  blockNumber: tx.blockNumber || 0,
                  timestamp: block.timestamp,
                  status: receipt?.status === 1 ? "success" : "failed",
                  type: isFrom ? "sent" : "received",
                })
              }
            }
          }
        } catch (err) {
          console.error("[v0] Error fetching block:", blockNum, err)
        }
      }

      setTransactions(txs.sort((a, b) => b.blockNumber - a.blockNumber))

      if (txs.length === 0) {
        setError("No transactions found in recent blocks")
      }
    } catch (err) {
      console.error("[v0] Error fetching transactions:", err)
      setError("Failed to fetch transaction history")
    } finally {
      setIsLoading(false)
    }
  }

  const openExplorer = (hash: string) => {
    if (chain) {
      window.open(`${chain.blockExplorers.default.url}/tx/${hash}`, "_blank")
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown"
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </DialogTitle>
          <DialogDescription>Recent transactions on {chain?.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Fetching transaction history...</p>
            </div>
          ) : error ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <History className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tx.type === "sent" ? "bg-destructive/10" : "bg-success/10"
                      }`}
                    >
                      {tx.type === "sent" ? (
                        <ArrowUpRight
                          className={`h-5 w-5 ${tx.type === "sent" ? "text-destructive" : "text-success"}`}
                        />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5 text-success" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm capitalize">{tx.type}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            {tx.type === "sent" ? "-" : "+"}
                            {Number.parseFloat(tx.value).toFixed(4)} {chain?.nativeCurrency.symbol}
                          </div>
                          <Badge variant={tx.status === "success" ? "default" : "destructive"} className="text-xs">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-muted-foreground">From: </span>
                          <code className="text-xs">{WalletManager.formatAddress(tx.from)}</code>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">To: </span>
                          <code className="text-xs">
                            {tx.to ? WalletManager.formatAddress(tx.to) : "Contract Creation"}
                          </code>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => openExplorer(tx.hash)} className="h-7 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on Explorer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" size="sm" onClick={fetchTransactions} disabled={isLoading}>
              <History className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
