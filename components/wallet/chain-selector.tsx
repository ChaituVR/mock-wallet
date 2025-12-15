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
      <Label className="text-base font-semibold flex items-center gap-2">
        <Network className="h-4 w-4" />
        Network Selection
      </Label>
      <Select value={chainId.toString()} onValueChange={handleChainChange} disabled={isLoading}>
        <SelectTrigger className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CHAINS.map((chain) => (
            <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-2">
                  <span>{chain.name}</span>
                  {chain.chainId === chainId && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">{chain.nativeCurrency.symbol}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">Switch between different testnets to test your dApp compatibility</p>
    </div>
  )
}
