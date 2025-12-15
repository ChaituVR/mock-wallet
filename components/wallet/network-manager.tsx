"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { SUPPORTED_CHAINS } from "@/lib/wallet/chain-config"
import { Network, CheckCircle2, ExternalLink, Loader2 } from "lucide-react"
import { useState } from "react"

export function NetworkManager() {
  const { chainId, switchChain } = useWallet()
  const [switchingTo, setSwitchingTo] = useState<number | null>(null)

  const handleSwitch = async (targetChainId: number) => {
    setSwitchingTo(targetChainId)
    await switchChain(targetChainId)
    setTimeout(() => setSwitchingTo(null), 500)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Network Management
        </CardTitle>
        <CardDescription>Switch between different testnets to test cross-chain compatibility</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {SUPPORTED_CHAINS.map((chain) => {
            const isActive = chain.chainId === chainId
            const isSwitching = switchingTo === chain.chainId

            return (
              <div
                key={chain.chainId}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  isActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Network className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {chain.name}
                      {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Chain ID: {chain.chainId} • {chain.nativeCurrency.symbol}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {chain.testnet ? "Testnet" : "Mainnet"}
                  </Badge>
                  {!isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwitch(chain.chainId)}
                      disabled={isSwitching}
                    >
                      {isSwitching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Switching...
                        </>
                      ) : (
                        "Switch"
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(chain.blockExplorers.default.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            All networks use public RPC endpoints. For better performance and rate limits, add your project ID in
            settings.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
