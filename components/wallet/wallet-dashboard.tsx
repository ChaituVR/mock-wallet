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
  ExternalLink,
  Link2,
  Sparkles,
  Users,
  Loader2,
} from "lucide-react"
import { WalletHeader } from "./wallet-header"
import { ChainSelector } from "./chain-selector"
import { SendTransaction } from "./send-transaction"
import { TransactionHistory } from "./transaction-history"
import { NetworkManager } from "./network-manager"
import { ChainInfo } from "./chain-info"
import { WalletConnectConnector } from "./walletconnect-connector"
import { AccountsManager } from "./accounts-manager"
import { TokenList } from "./token-list"

export function WalletDashboard() {
  const { activeAccount: account, balance, balanceLoading, chainId, refreshBalance, disconnectWallet, refreshTokenBalances } = useWallet()
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`star-lg-${i}`}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: 0.4 + Math.random() * 0.6,
            }}
          />
        ))}
        {/* Medium stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`star-md-${i}`}
            className="absolute w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.5,
            }}
          />
        ))}
        {/* Small stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-sm-${i}`}
            className="absolute w-1 h-1 bg-foreground/10 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              opacity: 0.2 + Math.random() * 0.4,
            }}
          />
        ))}
        {/* Shooting stars */}
        <div className="absolute top-1/4 right-1/4 w-32 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-[shooting-star_3s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/3 w-24 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-[shooting-star_4s_ease-in-out_infinite]" style={{ animationDelay: '5s' }} />
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mb-48 opacity-50" />
      <div className="relative z-10">
        <WalletHeader />

        <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          <Card className="brutalist-border bg-card overflow-hidden shadow-2xl">
            <CardHeader className="pb-3 relative border-b-4 border-primary/20 bg-gradient-to-r from-card via-primary/5 to-card">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-black shrink-0 shadow-md">
                    <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base font-black uppercase truncate">Total Balance</CardTitle>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] sm:text-xs border-2 border-black font-black uppercase">
                        {chain?.name || "Unknown"}
                      </Badge>
                      {chain?.testnet ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] sm:text-xs border-2 border-black font-black uppercase bg-secondary"
                        >
                          Testnet
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] sm:text-xs border-2 border-green-600 font-black uppercase bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm"
                        >
                          Mainnet
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing || balanceLoading}
                    className="h-9 w-9 border-2 border-black hover:bg-primary/10 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing || balanceLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={disconnectWallet}
                    className="h-9 w-9 border-2 border-black text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative pt-6 pb-8">
              <div className="space-y-4">
                <div className="text-7xl md:text-8xl font-extrabold tracking-tight leading-none">
                  {balanceLoading ? (
                    <div className="flex items-center gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <span className="text-3xl text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        {balance}
                      </span>
                      <span className="text-3xl md:text-4xl font-extrabold ml-3 text-muted-foreground">{chain?.nativeCurrency.symbol}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {account?.ensName && (
                    <code className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3.5 py-2.5 font-mono border-2 border-blue-500 font-bold">
                      {account.ensName}
                    </code>
                  )}
                  <code className="text-sm bg-gradient-to-r from-accent to-accent/80 px-3.5 py-2.5 font-mono border-2 border-black font-semibold shadow-sm">
                    {account?.address && WalletManager.formatAddress(account.address)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-8 px-2 border-2 border-black font-black hover:bg-primary/10 transition-colors"
                  >
                    {copied ? (
                      <span className="text-xs font-black uppercase text-green-600">Copied!</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={openExplorer} className="h-8 px-2 border-2 border-black hover:bg-primary/10 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <Button
                  className="h-14 font-extrabold uppercase text-base border-2 border-black brutalist-shadow bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-105 transition-all duration-300 hover:shadow-xl"
                  size="lg"
                  onClick={() => setShowSendTx(true)}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send
                </Button>
                <Button
                  variant="outline"
                  className="h-14 font-extrabold uppercase text-base border-2 border-black bg-transparent hover:bg-gradient-to-r hover:from-muted hover:to-muted/80 hover:scale-105 brutalist-shadow transition-all duration-300 hover:shadow-xl"
                  size="lg"
                  onClick={() => setShowHistory(true)}
                >
                  <History className="h-5 w-5 mr-2" />
                  History
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full h-14 p-1 bg-gradient-to-r from-muted via-muted/90 to-muted/80 border-2 border-black overflow-x-auto flex sm:grid sm:grid-cols-5 shadow-lg">
              <TabsTrigger value="actions" className="font-extrabold text-xs sm:text-sm uppercase data-[state=active]:bg-gradient-to-r data-[state=active]:from-card data-[state=active]:to-primary/5 data-[state=active]:shadow-md shrink-0 px-3 sm:px-4 h-full transition-all">
                <Sparkles className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="walletconnect" className="font-extrabold text-xs sm:text-base uppercase data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:scale-105 bg-gradient-to-r from-primary/10 to-primary/20 border-2 border-primary/30 shrink-0 px-4 sm:px-6 h-full transition-all hover:scale-105 hover:shadow-lg hover:border-primary/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                <Link2 className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10 font-black">WalletConnect</span>
              </TabsTrigger>
              <TabsTrigger value="tokens" className="font-extrabold text-xs sm:text-sm uppercase data-[state=active]:bg-gradient-to-r data-[state=active]:from-card data-[state=active]:to-primary/5 data-[state=active]:shadow-md shrink-0 px-3 sm:px-4 h-full transition-all">
                <Wallet className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Tokens
              </TabsTrigger>
              <TabsTrigger value="networks" className="font-extrabold text-xs sm:text-sm uppercase data-[state=active]:bg-gradient-to-r data-[state=active]:from-card data-[state=active]:to-primary/5 data-[state=active]:shadow-md shrink-0 px-3 sm:px-4 h-full transition-all">
                <Network className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Networks
              </TabsTrigger>
              <TabsTrigger value="accounts" className="font-extrabold text-xs sm:text-sm uppercase data-[state=active]:bg-gradient-to-r data-[state=active]:from-card data-[state=active]:to-primary/5 data-[state=active]:shadow-md shrink-0 px-3 sm:px-4 h-full transition-all">
                <Users className="w-4 h-4 mr-1 sm:mr-2 hidden sm:block" />
                Accounts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className="brutalist-border hover:border-primary hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-card to-primary/5 overflow-hidden relative"
                  onClick={() => setShowSendTx(true)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                  <CardHeader className="pb-3 border-b-2 border-black relative">
                    <CardTitle className="flex items-center gap-3 text-lg font-extrabold uppercase">
                      <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-black shadow-md group-hover:scale-110 transition-transform">
                        <Send className="h-5 w-5 text-primary-foreground" />
                      </div>
                      Send TX
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 relative">
                    <p className="text-sm font-mono font-semibold leading-relaxed text-muted-foreground">Test sending tokens to any address with custom parameters</p>
                  </CardContent>
                </Card>

                <Card
                  className="brutalist-border hover:border-primary hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-card to-secondary/10 overflow-hidden relative"
                  onClick={() => {
                    const tab = document.querySelector('[data-state="inactive"][value="networks"]') as HTMLElement
                    tab?.click()
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                  <CardHeader className="pb-3 border-b-2 border-black relative">
                    <CardTitle className="flex items-center gap-3 text-lg font-extrabold uppercase">
                      <div className="w-11 h-11 bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center border-2 border-black shadow-md group-hover:scale-110 transition-transform">
                        <Network className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      Networks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 relative">
                    <p className="text-sm font-mono font-semibold leading-relaxed text-muted-foreground">Switch and manage multiple blockchain networks</p>
                  </CardContent>
                </Card>

                <Card
                  className="brutalist-border hover:border-primary hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-card to-accent/20 overflow-hidden relative"
                  onClick={() => setShowHistory(true)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                  <CardHeader className="pb-3 border-b-2 border-black relative">
                    <CardTitle className="flex items-center gap-3 text-lg font-extrabold uppercase">
                      <div className="w-11 h-11 bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center border-2 border-black shadow-md group-hover:scale-110 transition-transform">
                        <History className="h-5 w-5 text-background" />
                      </div>
                      History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 relative">
                    <p className="text-sm font-mono font-semibold leading-relaxed text-muted-foreground">View and track all transaction history</p>
                  </CardContent>
                </Card>
              </div>
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
          </Tabs>
        </main>
      </div>

      {/* Transaction Dialogs */}
      <SendTransaction open={showSendTx} onOpenChange={setShowSendTx} />
      <TransactionHistory open={showHistory} onOpenChange={setShowHistory} />
    </div>
  )
}
