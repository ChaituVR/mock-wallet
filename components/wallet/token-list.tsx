"use client"

import { useWallet } from "@/lib/wallet/wallet-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Plus, ExternalLink, Trash2, Loader2, Copy, RefreshCcw } from "lucide-react"
import { useState } from "react"
import { AddTokenDialog } from "./add-token-dialog"
import { SUPPORTED_CHAINS } from "@/lib/wallet/chain-config"

export function TokenList() {
  const { tokens, chainId, removeToken, refreshTokenBalances } = useWallet()
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const chain = SUPPORTED_CHAINS.find((c) => c.chainId === chainId)
  const explorerUrl = chain?.blockExplorers?.default?.url || ""

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshTokenBalances()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRemoveToken = (tokenAddress: string) => {
    if (confirm("Remove this token from your list?")) {
      removeToken(tokenAddress)
    }
  }

  const copyTokenAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const getTokenExplorerUrl = (tokenAddress: string) => {
    if (!explorerUrl) return ""
    return `${explorerUrl}/token/${tokenAddress}`
  }

  return (
    <>
      <Card className="brutalist-border shadow-2xl bg-gradient-to-br from-card to-primary/5 border-[3px] border-black">
        <CardHeader className="border-b-2 border-black dark:border-white bg-gradient-to-r from-muted/50 via-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-black shadow-md">
                <Coins className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase">Tokens</CardTitle>
                <CardDescription className="font-mono text-xs mt-1 font-semibold">
                  ERC20 token balances
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-2 border-black dark:border-white font-extrabold text-xs sm:text-sm hover:bg-primary/10 transition-colors"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    <span className="hidden sm:inline">Refreshing</span>
                  </>
                ) : (
                  <span className="hidden sm:inline">Refresh</span>
                )}
                {!isRefreshing && <RefreshCcw className="w-4 h-4 sm:hidden" />}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAddTokenOpen(true)}
                className="border-2 border-black font-extrabold text-xs sm:text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md transition-all"
              >
                <Plus className="w-4 h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Add Token</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {tokens.length === 0 ? (
            <div className="p-8 text-center">
              <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-mono text-muted-foreground mb-4">
                No tokens found for this network
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddTokenOpen(true)}
                className="border-2 border-black dark:border-white font-bold"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Custom Token
              </Button>
            </div>
          ) : (
            <div className="divide-y-2 divide-border">
              {tokens.map((token) => (
                <div
                  key={`${token.chainId}-${token.address}`}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {token.logoURI ? (
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          className="w-8 h-8 rounded-full border-2 border-black dark:border-white"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-black dark:border-white bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black uppercase text-base">{token.symbol}</span>
                          {token.isCustom && (
                            <Badge variant="outline" className="text-xs font-bold">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-mono text-muted-foreground">{token.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <code className="text-[10px] font-mono text-muted-foreground">
                            {token.address.slice(0, 6)}...{token.address.slice(-4)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => copyTokenAddress(token.address)}
                            title="Copy address"
                          >
                            {copiedAddress === token.address ? (
                              <span className="text-[10px] font-bold text-green-600">✓</span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                          {explorerUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => window.open(getTokenExplorerUrl(token.address), "_blank")}
                              title="View on explorer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        {token.isLoading ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-mono">Loading...</span>
                          </div>
                        ) : (
                          <>
                            <div className="font-black text-lg font-mono">{token.balanceFormatted}</div>
                            <div className="text-xs font-mono text-muted-foreground">{token.symbol}</div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {token.isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveToken(token.address)}
                            title="Remove token"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTokenDialog open={isAddTokenOpen} onOpenChange={setIsAddTokenOpen} />
    </>
  )
}
