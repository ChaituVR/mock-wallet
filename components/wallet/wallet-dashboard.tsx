"use client"

import { useState, useEffect } from "react"
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
  Users,
} from "lucide-react"
import { WalletHeader } from "./wallet-header"
import { AccountDetails } from "./account-details"
import { ChainSelector } from "./chain-selector"
import { SendTransaction } from "./send-transaction"
import { TransactionHistory } from "./transaction-history"
import { NetworkManager } from "./network-manager"
import { ChainInfo } from "./chain-info"
import { WalletConnectConnector } from "./walletconnect-connector"
import { AccountsManager } from "./accounts-manager"
import { TokenList } from "./token-list"

export function WalletDashboard() {
  const { activeAccount: account, balance, chainId, refreshBalance, disconnectWallet, refreshTokenBalances } = useWallet()
  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSendTx, setShowSendTx] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("actions")

  const chain = getChainById(chainId)

  // Expose setActiveTab for external components
  if (typeof window !== 'undefined') {
    (window as any).setActiveTab = setActiveTab
  }

  // Load token balances when switching to tokens tab or when chain/account changes
  useEffect(() => {
    if (activeTab === "tokens" && account) {
      refreshTokenBalances()
    }
  }, [activeTab, chainId, account?.address])


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
          <Card className="brutalist-border bg-card overflow-hidden">
            <CardHeader className="pb-3 relative border-b-2 border-black">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary flex items-center justify-center border-2 border-black shrink-0">
                    <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base font-black uppercase truncate">Total Balance</CardTitle>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] sm:text-xs border-2 border-black font-black uppercase">
                        {chain?.name || "Unknown"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs border-2 border-black font-black uppercase bg-secondary"
                      >
                        Testnet
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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
            <CardContent className="space-y-6 relative pt-6">
              <div className="space-y-4">
                <div className="text-7xl md:text-8xl font-extrabold tracking-tight leading-none">
                  {balance}
                  <span className="text-3xl md:text-4xl font-extrabold ml-3">{chain?.nativeCurrency.symbol}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {account?.ensName && (
                    <code className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3.5 py-2.5 font-mono border-2 border-blue-500 font-bold">
                      {account.ensName}
                    </code>
                  )}
                  <code className="text-sm bg-accent px-3.5 py-2.5 font-mono border-2 border-black font-semibold">
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

              <div className="grid grid-cols-2 gap-4 pt-3">
                <Button
                  className="h-14 font-extrabold uppercase text-base border-2 border-black brutalist-shadow"
                  size="lg"
                  onClick={() => setShowSendTx(true)}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send
                </Button>
                <Button
                  variant="outline"
                  className="h-14 font-extrabold uppercase text-base border-2 border-black bg-transparent hover:bg-muted brutalist-shadow"
                  size="lg"
                  onClick={() => setShowHistory(true)}
                >
                  <History className="h-5 w-5 mr-2" />
                  History
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="w-full h-14 p-1 bg-muted border-2 border-black overflow-x-auto flex sm:grid sm:grid-cols-6">
              <TabsTrigger value="actions" className="font-extrabold text-xs sm:text-sm uppercase data-[state=active]:bg-card shrink-0 px-3 sm:px-4 h-full">
                <Sparkles className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="tokens" className="font-extrabold text-xs sm:text-sm uppercase data-[state=active]:bg-card shrink-0 px-3 sm:px-4 h-full">
                <Wallet className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Tokens
              </TabsTrigger>
              <TabsTrigger value="walletconnect" className="font-extrabold text-xs sm:text-sm uppercase data-[state=active]:bg-card shrink-0 px-3 sm:px-4 h-full">
                <Link2 className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Connect
              </TabsTrigger>
              <TabsTrigger value="networks" className="font-extrabold text-xs sm:text-sm uppercase data-[state=active]:bg-card shrink-0 px-3 sm:px-4 h-full">
                <Network className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Networks
              </TabsTrigger>
              <TabsTrigger value="accounts" className="font-black text-xs sm:text-sm uppercase data-[state=active]:bg-card shrink-0 px-3 sm:px-4">
                <Users className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Accounts
              </TabsTrigger>
              <TabsTrigger value="account" className="font-black text-xs sm:text-sm uppercase data-[state=active]:bg-card shrink-0 px-3 sm:px-4">
                <Key className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-5">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card
                  className="brutalist-border hover:border-primary transition-all cursor-pointer group bg-card"
                  onClick={() => setShowSendTx(true)}
                >
                  <CardHeader className="pb-3 border-b-2 border-black">
                    <CardTitle className="flex items-center gap-3 text-lg font-extrabold uppercase">
                      <div className="w-11 h-11 bg-primary flex items-center justify-center border-2 border-black">
                        <Send className="h-5 w-5 text-primary-foreground" />
                      </div>
                      Send TX
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm font-mono font-medium leading-relaxed">Test sending tokens to any address</p>
                  </CardContent>
                </Card>

                <Card
                  className="brutalist-border hover:border-primary transition-all cursor-pointer group bg-card"
                  onClick={() => {
                    const tab = document.querySelector('[data-state="inactive"][value="networks"]') as HTMLElement
                    tab?.click()
                  }}
                >
                  <CardHeader className="pb-3 border-b-2 border-black">
                    <CardTitle className="flex items-center gap-3 text-lg font-extrabold uppercase">
                      <div className="w-11 h-11 bg-primary flex items-center justify-center border-2 border-black">
                        <Network className="h-5 w-5 text-primary-foreground" />
                      </div>
                      Networks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm font-mono font-medium leading-relaxed">Test across multiple testnets</p>
                  </CardContent>
                </Card>

                <Card
                  className="brutalist-border hover:border-primary transition-all cursor-pointer group bg-card"
                  onClick={() => setShowHistory(true)}
                >
                  <CardHeader className="pb-3 border-b-2 border-black">
                    <CardTitle className="flex items-center gap-3 text-lg font-extrabold uppercase">
                      <div className="w-11 h-11 bg-black flex items-center justify-center border-2 border-black">
                        <History className="h-5 w-5 text-white" />
                      </div>
                      History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm font-mono font-medium leading-relaxed">View all test transactions</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="brutalist-border bg-accent">
                <CardHeader className="pb-4 border-b-2 border-black">
                  <CardTitle className="text-base flex items-center gap-2 font-extrabold uppercase">
                    <Key className="h-5 w-5" />
                    Network Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-5 font-mono">
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase font-semibold text-muted-foreground">Network</p>
                      <p className="text-base font-extrabold">{chain?.name}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase font-semibold text-muted-foreground">Chain ID</p>
                      <p className="text-base font-extrabold">{chainId}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase font-semibold text-muted-foreground">Type</p>
                      <Badge variant="outline" className="text-xs border-2 border-black font-extrabold bg-secondary">
                        Testnet
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-4">
              <TokenList />
            </TabsContent>

            <TabsContent value="walletconnect">
              <WalletConnectConnector />
            </TabsContent>

            <TabsContent value="networks" className="space-y-4">
              <ChainSelector />
              <NetworkManager />
              <ChainInfo />
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <AccountsManager />
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
