"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { getChainById } from "@/lib/wallet/chain-config"
import { Network, ExternalLink, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export function ChainInfo() {
  const { chainId, getProvider } = useWallet()
  const [copiedRpc, setCopiedRpc] = useState(false)
  const chain = getChainById(chainId)

  if (!chain) return null

  const copyRpc = async () => {
    const rpcUrl = chain.rpcUrls.default.http[0]
    await navigator.clipboard.writeText(rpcUrl)
    setCopiedRpc(true)
    setTimeout(() => setCopiedRpc(false), 2000)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="h-5 w-5" />
          Current Network Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network Name</span>
            <span className="font-semibold">{chain.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Chain ID</span>
            <Badge variant="outline">{chain.chainId}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            <Badge variant="outline">{chain.network}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Native Currency</span>
            <span className="font-mono font-semibold">{chain.nativeCurrency.symbol}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Currency Name</span>
            <span className="text-sm">{chain.nativeCurrency.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Decimals</span>
            <span className="text-sm">{chain.nativeCurrency.decimals}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network Type</span>
            <Badge
              variant={chain.testnet ? "secondary" : "default"}
              className={chain.testnet ? "border-warning text-warning" : ""}
            >
              {chain.testnet ? "Testnet" : "Mainnet"}
            </Badge>
          </div>
        </div>

        <div className="pt-4 space-y-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">RPC URL</span>
            <Button variant="ghost" size="sm" onClick={copyRpc}>
              {copiedRpc ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <code className="block text-xs bg-muted/50 p-3 rounded font-mono break-all">
            {chain.rpcUrls.default.http[0]}
          </code>
        </div>

        <div className="pt-2 space-y-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Block Explorer</span>
            <Button variant="ghost" size="sm" onClick={() => window.open(chain.blockExplorers.default.url, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">{chain.blockExplorers.default.name}</div>
        </div>
      </CardContent>
    </Card>
  )
}
