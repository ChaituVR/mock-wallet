"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletManager } from "@/lib/wallet/wallet-manager"
import { getChainById } from "@/lib/wallet/chain-config"
import {
  Wallet,
  Copy,
  RefreshCw,
  LogOut,
  Send,
  History,
  Network,
  Key,
  ExternalLink,
  Link2,
  Sparkles,
} from "lucide-react"
import { WalletHeader } from "./wallet-header"
import { AccountDetails } from "./account-details"
import { ChainSelector } from "./chain-selector"
import { SendTransaction } from "./send-transaction"
import { TransactionHistory } from "./transaction-history"
import { NetworkManager } from "./network-manager"
import { ChainInfo } from "./chain-info"
import { WalletConnectConnector } from "./walletconnect-connector"

export function WalletDashboard() {
  const { account, balance, chainId, refreshBalance, disconnectWallet } = useWallet()
  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSendTx, setShowSendTx] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const chain = getChainById(chainId)

  const copyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshBalance()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const openExplorer = () => {
    if (chain && account) {
      window.open(`${chain.blockExplorers.default.url}/address/${account.address}`, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <WalletHeader />

        <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          <Card className="brutalist-border bg-card overflow-hidden rotate-slight">
            <CardHeader className="pb-3 relative border-b-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary flex items-center justify-center border-2 border-black">
                    <Wallet className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-black uppercase">Total Balance</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-2 border-black font-black uppercase">
                        {chain?.name || "Unknown"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-2 border-black font-black uppercase bg-warning"
                      >
                        Testnet
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-9 w-9 border-2 border-black"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={disconnectWallet}
                    className="h-9 w-9 border-2 border-black text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 relative pt-4">
              <div className="space-y-3">
                <div className="text-6xl md:text-7xl font-black tracking-tighter">
                  {balance}
                  <span className="text-2xl md:text-3xl font-black ml-2">{chain?.nativeCurrency.symbol}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-sm bg-accent px-3 py-2 font-mono border-2 border-black font-bold">
                    {account?.address && WalletManager.formatAddress(account.address)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-8 px-2 border-2 border-black font-black"
                  >
                    {copied ? (
                      <span className="text-xs font-black uppercase">Copied!</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={openExplorer} className="h-8 px-2 border-2 border-black">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  className="h-12 font-black uppercase border-2 border-black brutalist-shadow"
                  size="lg"
                  onClick={() => setShowSendTx(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
                <Button
                  variant="outline"
                  className="h-12 font-black uppercase border-2 border-black bg-transparent hover:bg-muted brutalist-shadow"
                  size="lg"
                  onClick={() => setShowHistory(true)}
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="actions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 h-12 p-0 bg-muted border-2 border-black">
              <TabsTrigger value="actions" className="font-black uppercase data-[state=active]:bg-card">
                <Sparkles className="w-4 h-4 mr-2 hidden sm:block" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="walletconnect" className="font-black uppercase data-[state=active]:bg-card">
                <Link2 className="w-4 h-4 mr-2 hidden sm:block" />
                Connect
              </TabsTrigger>
              <TabsTrigger value="networks" className="font-black uppercase data-[state=active]:bg-card">
                <Network className="w-4 h-4 mr-2 hidden sm:block" />
                Networks
              </TabsTrigger>
              <TabsTrigger value="account" className="font-black uppercase data-[state=active]:bg-card">
                <Key className="w-4 h-4 mr-2 hidden sm:block" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                  className="brutalist-border hover:border-primary transition-all cursor-pointer group bg-card rotate-slight"
                  onClick={() => setShowSendTx(true)}
                >
                  <CardHeader className="pb-2 border-b-2 border-black">
                    <CardTitle className="flex items-center gap-3 text-base font-black uppercase">
                      <div className="w-10 h-10 bg-warning flex items-center justify-center border-2 border-black">
                        <Send className="h-5 w-5 text-warning-foreground" />
                      </div>
                      Send TX
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <p className="text-sm font-mono font-bold">Test sending tokens to any address</p>
                  </CardContent>
                </Card>

                <Card
                  className="brutalist-border hover:border-primary transition-all cursor-pointer group bg-card -rotate-1"
                  onClick={() => {
                    const tab = document.querySelector('[data-state="inactive"][value="networks"]') as HTMLElement
                    tab?.click()
                  }}
                >
                  <CardHeader className="pb-2 border-b-2 border-black">
                    <CardTitle className="flex items-center gap-3 text-base font-black uppercase">
                      <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-black">
                        <Network className="h-5 w-5 text-primary-foreground" />
                      </div>
                      Networks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <p className="text-sm font-mono font-bold">Test across multiple testnets</p>
                  </CardContent>
                </Card>

                <Card
                  className="brutalist-border hover:border-primary transition-all cursor-pointer group bg-card rotate-1"
                  onClick={() => setShowHistory(true)}
                >
                  <CardHeader className="pb-2 border-b-2 border-black">
                    <CardTitle className="flex items-center gap-3 text-base font-black uppercase">
                      <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black">
                        <History className="h-5 w-5 text-white" />
                      </div>
                      History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <p className="text-sm font-mono font-bold">View all test transactions</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="brutalist-border bg-accent">
                <CardHeader className="pb-3 border-b-2 border-black">
                  <CardTitle className="text-sm flex items-center gap-2 font-black uppercase">
                    <Key className="h-4 w-4" />
                    Network Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="grid grid-cols-3 gap-4 font-mono font-bold">
                    <div className="space-y-1">
                      <p className="text-xs uppercase">Network</p>
                      <p className="text-sm font-black">{chain?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase">Chain ID</p>
                      <p className="text-sm font-black">{chainId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase">Type</p>
                      <Badge variant="outline" className="text-xs border-2 border-black font-black bg-warning">
                        Testnet
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="walletconnect">
              <WalletConnectConnector />
            </TabsContent>

            <TabsContent value="networks" className="space-y-4">
              <ChainSelector />
              <NetworkManager />
              <ChainInfo />
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <AccountDetails />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Transaction Dialogs */}
      <SendTransaction open={showSendTx} onOpenChange={setShowSendTx} />
      <TransactionHistory open={showHistory} onOpenChange={setShowHistory} />
    </div>
  )
}
