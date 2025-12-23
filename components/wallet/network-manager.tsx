"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { SUPPORTED_CHAINS, type ChainConfig } from "@/lib/wallet/chain-config"
import { Network, CheckCircle2, ExternalLink, Loader2, Plus } from "lucide-react"
import { useState, useEffect } from "react"

export function NetworkManager() {
  const { chainId, switchChain } = useWallet()
  const [switchingTo, setSwitchingTo] = useState<number | null>(null)
  const [customNetworks, setCustomNetworks] = useState<ChainConfig[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newNetwork, setNewNetwork] = useState({
    chainId: "",
    name: "",
    symbol: "",
    rpcUrl: "",
    explorerUrl: "",
    isTestnet: true,
  })

  // Load custom networks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customNetworks")
    if (saved) {
      try {
        setCustomNetworks(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load custom networks:", e)
      }
    }
  }, [])

  const handleSwitch = async (targetChainId: number) => {
    setSwitchingTo(targetChainId)
    await switchChain(targetChainId)
    setTimeout(() => setSwitchingTo(null), 500)
  }

  const handleAddNetwork = () => {
    const chainId = Number.parseInt(newNetwork.chainId)
    if (!chainId || !newNetwork.name || !newNetwork.symbol || !newNetwork.rpcUrl) {
      return
    }

    const network: ChainConfig = {
      chainId,
      name: newNetwork.name,
      network: newNetwork.name.toLowerCase().replace(/\s+/g, "-"),
      nativeCurrency: {
        name: newNetwork.symbol,
        symbol: newNetwork.symbol,
        decimals: 18,
      },
      rpcUrls: {
        default: { http: [newNetwork.rpcUrl] },
        public: { http: [newNetwork.rpcUrl] },
      },
      blockExplorers: {
        default: { 
          name: "Explorer", 
          url: newNetwork.explorerUrl || `https://explorer.chain${chainId}.com` 
        },
      },
      testnet: newNetwork.isTestnet,
    }

    const updated = [...customNetworks, network]
    setCustomNetworks(updated)
    localStorage.setItem("customNetworks", JSON.stringify(updated))
    
    // Also add to SUPPORTED_CHAINS dynamically
    if (!SUPPORTED_CHAINS.find(c => c.chainId === chainId)) {
      SUPPORTED_CHAINS.push(network)
    }
    
    setShowAddDialog(false)
    setNewNetwork({
      chainId: "",
      name: "",
      symbol: "",
      rpcUrl: "",
      explorerUrl: "",
      isTestnet: true,
    })
  }

  const allChains = [...SUPPORTED_CHAINS]

  return (
    <Card className="brutalist-border shadow-2xl bg-gradient-to-br from-card to-primary/5 border-[3px]">
      <CardHeader className="border-b-2 border-foreground bg-gradient-to-r from-muted/50 via-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 font-mono uppercase font-black text-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-black shadow-md">
                <Network className="h-5 w-5 text-primary-foreground" />
              </div>
              Network Management
            </CardTitle>
            <CardDescription className="font-mono text-xs font-semibold mt-2">SWITCH BETWEEN NETWORKS OR ADD CUSTOM ONES</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="font-extrabold uppercase border-2 border-black">
                <Plus className="h-4 w-4 mr-1" />
                Add Network
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-2 border-black">
              <DialogHeader>
                <DialogTitle className="font-extrabold uppercase">Add Custom Network</DialogTitle>
                <DialogDescription className="font-mono font-medium">
                  Add any EVM-compatible network
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-mono uppercase text-xs font-semibold">Chain ID</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    value={newNetwork.chainId}
                    onChange={(e) => setNewNetwork({ ...newNetwork, chainId: e.target.value })}
                    className="border-2 border-black font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono uppercase text-xs font-semibold">Network Name</Label>
                  <Input
                    placeholder="e.g., Ethereum"
                    value={newNetwork.name}
                    onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
                    className="border-2 border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono uppercase text-xs font-semibold">Currency Symbol</Label>
                  <Input
                    placeholder="e.g., ETH"
                    value={newNetwork.symbol}
                    onChange={(e) => setNewNetwork({ ...newNetwork, symbol: e.target.value })}
                    className="border-2 border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono uppercase text-xs font-semibold">RPC URL</Label>
                  <Input
                    placeholder="https://..."
                    value={newNetwork.rpcUrl}
                    onChange={(e) => setNewNetwork({ ...newNetwork, rpcUrl: e.target.value })}
                    className="border-2 border-black font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono uppercase text-xs font-semibold">Block Explorer URL (Optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={newNetwork.explorerUrl}
                    onChange={(e) => setNewNetwork({ ...newNetwork, explorerUrl: e.target.value })}
                    className="border-2 border-black font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="testnet"
                    checked={newNetwork.isTestnet}
                    onChange={(e) => setNewNetwork({ ...newNetwork, isTestnet: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="testnet" className="font-mono text-sm cursor-pointer">
                    This is a testnet
                  </Label>
                </div>
                <Button
                  onClick={handleAddNetwork}
                  className="w-full h-12 font-extrabold uppercase border-2 border-black"
                  disabled={!newNetwork.chainId || !newNetwork.name || !newNetwork.symbol || !newNetwork.rpcUrl}
                >
                  Add Network
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {allChains.map((chain) => {
            const isActive = chain.chainId === chainId
            const isSwitching = switchingTo === chain.chainId
            const isCustom = customNetworks.some(c => c.chainId === chain.chainId)

            return (
              <div
                key={chain.chainId}
                className={`flex items-center justify-between p-4 border-2 border-black transition-all ${
                  isActive ? "bg-primary/10" : "bg-card hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 flex items-center justify-center border-2 border-black ${
                      isActive ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <Network className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="font-extrabold flex items-center gap-2">
                      {chain.name}
                      {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      {isCustom && <Badge variant="outline" className="text-xs border-2 border-black">Custom</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono font-medium">
                      Chain ID: {chain.chainId} • {chain.nativeCurrency.symbol}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-2 border-black font-extrabold">
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
