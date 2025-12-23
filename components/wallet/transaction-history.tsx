"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletManager } from "@/lib/wallet/wallet-manager"
import { getChainById } from "@/lib/wallet/chain-config"
import { History, ExternalLink, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle, Copy, Check, Filter, Search, Clock, Fuel } from "lucide-react"
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
  gasUsed?: string
  gasPrice?: string
  gasCost?: string
}

export function TransactionHistory({ open, onOpenChange }: TransactionHistoryProps) {
  const { activeAccount: account, getProvider, chainId } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "sent" | "received">("all")
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

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
                
                // Calculate gas cost
                let gasCost = "0"
                let gasUsed = "0"
                let gasPrice = "0"
                
                if (receipt) {
                  gasUsed = receipt.gasUsed.toString()
                  gasPrice = tx.gasPrice?.toString() || "0"
                  const cost = receipt.gasUsed * (tx.gasPrice || BigInt(0))
                  gasCost = ethers.formatEther(cost)
                }

                txs.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: ethers.formatEther(tx.value),
                  blockNumber: tx.blockNumber || 0,
                  timestamp: block.timestamp,
                  status: receipt?.status === 1 ? "success" : "failed",
                  type: isFrom ? "sent" : "received",
                  gasUsed,
                  gasPrice,
                  gasCost,
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

  const getTimeElapsed = (timestamp?: number) => {
    if (!timestamp) return ""
    const now = Math.floor(Date.now() / 1000)
    const elapsed = now - timestamp
    
    if (elapsed < 60) return `${elapsed}s ago`
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`
    return `${Math.floor(elapsed / 86400)}d ago`
  }

  const copyToClipboard = (text: string, hash: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Status filter
      if (statusFilter !== "all" && tx.status !== statusFilter) return false
      
      // Type filter
      if (typeFilter !== "all" && tx.type !== typeFilter) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          tx.hash.toLowerCase().includes(query) ||
          tx.from.toLowerCase().includes(query) ||
          tx.to?.toLowerCase().includes(query)
        )
      }
      
      return true
    })
  }, [transactions, statusFilter, typeFilter, searchQuery])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] border-[3px] border-foreground shadow-2xl bg-gradient-to-br from-background via-primary/5 to-background">
        <DialogHeader className="border-b-2 border-foreground pb-4">
          <DialogTitle className="flex items-center gap-3 font-mono uppercase font-black text-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center border-2 border-black shadow-md">
              <History className="h-5 w-5 text-background" />
            </div>
            Transaction History
          </DialogTitle>
          <DialogDescription className="font-mono text-xs font-semibold mt-2 uppercase">
            {filteredTransactions.length} of {transactions.length} transactions on {chain?.name}
          </DialogDescription>
        </DialogHeader>

        {/* Filters and Search */}
        <div className="space-y-3 border-b-2 border-border pb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by hash or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 border-2 font-mono text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setTypeFilter("all")
              }}
              className="h-9 border-2"
            >
              <Filter className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="h-8 border-2 font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2">
                <SelectItem value="all" className="font-mono text-xs">All Status</SelectItem>
                <SelectItem value="success" className="font-mono text-xs">✓ Success</SelectItem>
                <SelectItem value="failed" className="font-mono text-xs">✗ Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <SelectTrigger className="h-8 border-2 font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2">
                <SelectItem value="all" className="font-mono text-xs">All Types</SelectItem>
                <SelectItem value="sent" className="font-mono text-xs">↗ Sent</SelectItem>
                <SelectItem value="received" className="font-mono text-xs">↙ Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex items-start gap-3 p-4 brutalist-border bg-card hover:border-primary hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
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

                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm capitalize">{tx.type}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeElapsed(tx.timestamp)}</span>
                            <span className="text-muted-foreground/50">·</span>
                            <span>{formatDate(tx.timestamp)}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-semibold text-sm font-mono">
                            {tx.type === "sent" ? "-" : "+"}
                            {Number.parseFloat(tx.value).toFixed(4)} {chain?.nativeCurrency.symbol}
                          </div>
                          <Badge variant={tx.status === "success" ? "default" : "destructive"} className="text-xs font-mono">
                            {tx.status === "success" ? "✓ Success" : "✗ Failed"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1.5">
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
                        
                        {/* Gas Cost */}
                        {tx.gasCost && tx.type === "sent" && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Fuel className="h-3 w-3" />
                            <span>Gas: {parseFloat(tx.gasCost).toFixed(6)} {chain?.nativeCurrency.symbol}</span>
                            <span className="text-muted-foreground/50">·</span>
                            <span>{parseInt(tx.gasUsed || "0").toLocaleString()} units</span>
                          </div>
                        )}

                        {/* Transaction Hash */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-muted-foreground">Hash:</span>
                          <code className="text-xs flex-1 truncate">{tx.hash.slice(0, 20)}...</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(tx.hash, tx.hash)}
                          >
                            {copiedHash === tx.hash ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openExplorer(tx.hash)} 
                          className="h-7 text-xs border-2"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Explorer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(tx.from, `from-${tx.hash}`)}
                          className="h-7 text-xs"
                        >
                          {copiedHash === `from-${tx.hash}` ? (
                            <Check className="h-3 w-3 mr-1 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          From
                        </Button>
                        {tx.to && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.to!, `to-${tx.hash}`)}
                            className="h-7 text-xs"
                          >
                            {copiedHash === `to-${tx.hash}` ? (
                              <Check className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 mr-1" />
                            )}
                            To
                          </Button>
                        )}
                      </div>
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
