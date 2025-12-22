"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { SUPPORTED_CHAINS } from "@/lib/wallet/chain-config"
import { Network, CheckCircle2 } from "lucide-react"

export function ChainSelector() {
  const { chainId, switchChain } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const handleChainChange = async (value: string) => {
    setIsLoading(true)
    await switchChain(Number.parseInt(value))
    setTimeout(() => setIsLoading(false), 500)
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-extrabold flex items-center gap-2 uppercase">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-black shadow-sm animate-pulse">
          <Network className="h-4 w-4 text-primary-foreground" />
        </div>
        Network Selection
      </Label>
      <Select value={chainId.toString()} onValueChange={handleChainChange} disabled={isLoading}>
        <SelectTrigger className="h-12 brutalist-border font-mono font-semibold hover:border-primary hover:shadow-lg transition-all duration-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="brutalist-border shadow-2xl">
          {SUPPORTED_CHAINS.map((chain) => (
            <SelectItem key={chain.chainId} value={chain.chainId.toString()} className="font-mono">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{chain.name}</span>
                  {chain.chainId === chainId && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <span className="text-xs font-bold text-muted-foreground">{chain.nativeCurrency.symbol}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs font-mono font-medium text-muted-foreground">Switch between networks to test your dApp compatibility</p>
    </div>
  )
}
