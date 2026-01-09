"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletManager } from "@/lib/wallet/wallet-manager"
import { getChainById } from "@/lib/wallet/chain-config"
import { toast } from "@/components/ui/use-toast"
import {
  Wallet,
  Copy,
  RefreshCw,
  LogOut,
  Send,
  Download,
  History,
  Network,
  ExternalLink,
  Link2,
  Sparkles,
  Users,
  Loader2,
  Check,
  Command,
} from "lucide-react"
import { WalletHeader } from "./wallet-header"
import { ChainSelector } from "./chain-selector"
import { SendTransaction } from "./send-transaction"
import { ReceiveDialog } from "./receive-dialog"
import { TransactionHistory } from "./transaction-history"
import { NetworkManager } from "./network-manager"
import { ChainInfo } from "./chain-info"
import { WalletConnectConnector } from "./walletconnect-connector"
import { AccountsManager } from "./accounts-manager"
import { TokenList } from "./token-list"
import { CommandPalette } from "./command-palette"

export function WalletDashboard() {
  const { activeAccount: account, balance, balanceLoading, chainId, refreshBalance, disconnectWallet, refreshTokenBalances, accounts, switchAccount } = useWallet()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSendTx, setShowSendTx] = useState(false)
  const [showReceive, setShowReceive] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("actions")

  const chain = getChainById(chainId)

  // Expose setActiveTab for external components
  if (typeof window !== 'undefined') {
    (window as any).setActiveTab = setActiveTab;
    (window as any).openReceiveDialog = () => setShowReceive(true)
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      const isMod = e.metaKey || e.ctrlKey

      // ⌘S - Send
      if (isMod && e.key === 's') {
        e.preventDefault()
        setShowSendTx(true)
      }
      // ⌘H - Receive (Here)
      else if (isMod && e.key === 'h') {
        e.preventDefault()
        setShowReceive(true)
      }
      // ⌘C - Copy address
      else if (isMod && e.key === 'c') {
        e.preventDefault()
        copyAddress()
      }
      // ⌘R - Refresh
      else if (isMod && e.key === 'r') {
        e.preventDefault()
        handleRefresh()
      }
      // ⌘1-9 - Switch accounts
      else if (isMod && e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        if (accounts && accounts[index]) {
          switchAccount(index)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [account, accounts, switchAccount])

  // Load token balances when switching to tokens tab or when chain/account changes
  useEffect(() => {
    if (activeTab === "tokens" && account) {
      refreshTokenBalances()
    }
  }, [activeTab, chainId, account?.address])


  const copyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address)
      toast({
        title: "✓ Address Copied",
        description: `${account.address.slice(0, 10)}...${account.address.slice(-8)}`,
        variant: "success",
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([refreshBalance(), refreshTokenBalances()])
      toast({
        title: "✓ Balance Refreshed",
        description: "All balances updated successfully",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "✗ Refresh Failed",
        description: "Could not refresh balances",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const openExplorer = () => {
    if (chain && account) {
      window.open(`${chain.blockExplorers.default.url}/address/${account.address}`, "_blank")
    }
  }

  return (
    <>
      <CommandPalette />
      <div className="min-h-screen bg-background relative">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'linear-gradient(var(--primary) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--primary) 1.5px, transparent 1.5px)',
          backgroundSize: '50px 50px'
        }} />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-gradient-to-br from-primary/15 via-primary/10 to-transparent rounded-full blur-3xl opacity-80 animate-pulse" style={{animationDuration: '4s'}} />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-gradient-to-tr from-accent/15 via-accent/10 to-transparent rounded-full blur-3xl opacity-70 animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-secondary/20 to-transparent rounded-full blur-3xl opacity-60 animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}} />
        
      <div className="relative z-10">
        <WalletHeader />

        <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          <Card className="brutalist-border bg-card overflow-hidden shadow-2xl relative hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-5 relative border-b-3 border-border bg-gradient-to-br from-primary/8 via-accent/5 to-transparent">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center border-3 border-border shrink-0 brutalist-shadow hover:scale-110 hover:rotate-6 transition-all duration-300 animate-pulse" style={{animationDuration: '3s'}}>
                    <Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg font-black uppercase truncate tracking-wide">Total Balance</CardTitle>
                    <div className="flex items-center gap-2 sm:gap-2.5 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] sm:text-xs border-2 border-border font-black uppercase bg-background shadow-sm">
                        {chain?.name || "Unknown"}
                      </Badge>
                      {chain?.testnet ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] sm:text-xs border-2 border-warning font-black uppercase bg-gradient-to-br from-warning/20 to-warning/10 shadow-sm"
                        >
                          ⚡ Testnet
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] sm:text-xs border-2 border-primary font-black uppercase bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm"
                        >
                          ✓ Mainnet
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing || balanceLoading}
                    className="h-9 w-9 border-2 border-border hover:bg-muted transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing || balanceLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={disconnectWallet}
                    className="h-9 w-9 border-2 border-border text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-10 relative pt-10 pb-12">
              <div className="space-y-6">
                <div className="text-7xl md:text-8xl font-black tracking-tighter leading-none">
                  {balanceLoading ? (
                    <div className="flex items-center gap-4">
                      <Loader2 className="h-14 w-14 animate-spin text-primary" />
                      <span className="text-4xl text-muted-foreground font-bold">Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-4">
                      <span className="bg-gradient-to-br from-foreground via-primary to-accent bg-clip-text text-transparent drop-shadow-sm">
                        {balance}
                      </span>
                      <span className="text-3xl md:text-4xl font-black text-primary/80">{chain?.nativeCurrency.symbol}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {account?.ensName && (
                    <code className="text-sm bg-primary/10 text-primary px-4 py-2.5 font-mono border-2 border-primary/30 font-bold hover:bg-primary/15 transition-colors">
                      {account.ensName}
                    </code>
                  )}
                  <code className="text-sm bg-muted px-4 py-2.5 font-mono border-2 border-border font-bold">
                    {account?.address && WalletManager.formatAddress(account.address)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-9 px-2.5 border-2 border-border hover:bg-muted transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={openExplorer} 
                    className="h-9 px-2.5 border-2 border-border hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <Button
                  data-action="send"
                  className="h-18 font-black uppercase text-lg border-3 brutalist-shadow bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary hover:to-primary/90 hover:brutalist-shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                  onClick={() => setShowSendTx(true)}
                >
                  <Send className="h-6 w-6 mr-2" />
                  Send
                </Button>
                <Button
                  data-action="receive"
                  variant="outline"
                  className="h-18 font-black uppercase text-lg border-3 border-primary brutalist-shadow bg-card hover:bg-primary/10 hover:border-primary hover:brutalist-shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                  onClick={() => setShowReceive(true)}
                >
                  <Download className="h-6 w-6 mr-2 rotate-180" />
                  Receive
                </Button>
                <Button
                  data-action="walletconnect"
                  variant="outline"
                  className="h-18 font-black uppercase text-lg border-3 border-primary brutalist-shadow bg-gradient-to-br from-primary/5 to-primary/10 hover:bg-primary/20 hover:border-primary hover:brutalist-shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                  onClick={() => {
                    setActiveTab("walletconnect")
                    setTimeout(() => {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                    }, 100)
                  }}
                >
                  <Link2 className="h-6 w-6 mr-2" />
                  Connect
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button
                  data-action="history"
                  variant="outline"
                  className="h-14 font-black uppercase text-base border-2 border-border brutalist-shadow-sm bg-card hover:bg-accent/30 hover:border-accent transition-all duration-300 hover:scale-[1.01]"
                  size="lg"
                  onClick={() => setShowHistory(true)}
                >
                  <History className="h-5 w-5 mr-2.5" />
                  History
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="w-full h-14 p-1.5 bg-gradient-to-br from-muted to-muted/80 border-3 border-border overflow-x-auto flex sm:grid sm:grid-cols-5 brutalist-shadow">
              <TabsTrigger 
                value="actions" 
                className="font-black text-xs sm:text-sm uppercase data-[state=active]:bg-gradient-to-br data-[state=active]:from-card data-[state=active]:to-card/90 data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-border data-[state=active]:scale-105 shrink-0 px-4 sm:px-5 h-full transition-all duration-300 hover:bg-card/50"
              >
                <Sparkles className="w-4 h-4 mr-2 sm:mr-2.5 hidden sm:block" />
                Actions
              </TabsTrigger>
              <TabsTrigger 
                value="walletconnect" 
                className="font-black text-xs sm:text-sm uppercase data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:scale-105 bg-primary/8 border-2 border-primary/25 shrink-0 px-4 sm:px-5 h-full transition-all duration-300 hover:bg-primary/15 hover:border-primary/40 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent animate-shimmer opacity-0 hover:opacity-100 transition-opacity" />
                <Link2 className="w-4 h-4 mr-1.5 sm:mr-2 relative z-10" />
                <span className="relative z-10 hidden sm:inline">WalletConnect</span>
                <span className="relative z-10 sm:hidden">WC</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tokens" 
                className="font-black text-xs sm:text-sm uppercase data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border-2 data-[state=active]:border-border shrink-0 px-3 sm:px-4 h-full transition-all"
              >
                <Wallet className="w-4 h-4 mr-1.5 sm:mr-2 hidden sm:block" />
                Tokens
              </TabsTrigger>
              <TabsTrigger 
                value="networks" 
                className="font-black text-xs sm:text-sm uppercase data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border-2 data-[state=active]:border-border shrink-0 px-3 sm:px-4 h-full transition-all"
              >
                <Network className="w-4 h-4 mr-1.5 sm:mr-2 hidden sm:block" />
                Networks
              </TabsTrigger>
              <TabsTrigger 
                value="accounts" 
                className="font-black text-xs sm:text-sm uppercase data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border-2 data-[state=active]:border-border shrink-0 px-3 sm:px-4 h-full transition-all"
              >
                <Users className="w-4 h-4 mr-1.5 sm:mr-2 hidden sm:block" />
                Accounts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                  className="brutalist-border hover:brutalist-shadow-lg cursor-pointer group bg-gradient-to-br from-card to-primary/5 relative transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 overflow-hidden"
                  onClick={() => setShowSendTx(true)}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-4 border-b-2 border-border relative">
                    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center border-2 border-border brutalist-shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Send className="h-6 w-6 text-primary-foreground" />
                      </div>
                      Send TX
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 relative">
                    <p className="text-sm font-mono font-semibold leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">Test sending tokens to any address with custom parameters</p>
                  </CardContent>
                </Card>

                <Card
                  className="brutalist-border hover:brutalist-shadow-lg cursor-pointer group bg-gradient-to-br from-card to-secondary/10 relative transition-all duration-300 hover:scale-[1.02] hover:border-accent/50 overflow-hidden"
                  onClick={() => {
                    const tab = document.querySelector('[data-state="inactive"][value="networks"]') as HTMLElement
                    tab?.click()
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-accent to-secondary" />
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 via-secondary/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-4 border-b-2 border-border relative">
                    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase">
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary via-secondary/80 to-accent/60 flex items-center justify-center border-2 border-border brutalist-shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Network className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      Networks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 relative">
                    <p className="text-sm font-mono font-semibold leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">Switch and manage multiple blockchain networks</p>
                  </CardContent>
                </Card>

                <Card
                  className="brutalist-border hover:brutalist-shadow-lg cursor-pointer group bg-gradient-to-br from-card to-accent/10 relative transition-all duration-300 hover:scale-[1.02] hover:border-accent overflow-hidden"
                  onClick={() => setShowHistory(true)}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-primary/50 to-accent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-accent/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-4 border-b-2 border-border relative">
                    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase">
                      <div className="w-12 h-12 bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 flex items-center justify-center border-2 border-border brutalist-shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <History className="h-6 w-6 text-background" />
                      </div>
                      History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 relative">
                    <p className="text-sm font-mono font-semibold leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">View and track all transaction history</p>
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
      <ReceiveDialog open={showReceive} onOpenChange={setShowReceive} />
      <TransactionHistory open={showHistory} onOpenChange={setShowHistory} />

      {/* Mobile Command Palette Button */}
      <Button
        onClick={() => {
          if (typeof window !== 'undefined') {
            (window as any).openCommandPalette?.()
          }
        }}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full shadow-brutal border-[3px] border-foreground bg-primary hover:bg-primary/90 z-50 p-0"
        title="Open command palette"
      >
        <Command className="w-6 h-6 text-primary-foreground" />
      </Button>
    </div>
    </>
  )
}
