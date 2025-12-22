"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { Wallet, AlertCircle, Code, Terminal, Sparkles, Hexagon, Download, UserPlus } from "lucide-react"
import { AccountSwitcher } from "./account-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

export function WalletSetup() {
  const { createNewWallet, importWallet, projectId, setProjectId, isConnected, accounts } = useWallet()
  const [importValue, setImportValue] = useState("")
  const [error, setError] = useState("")
  const [localProjectId, setLocalProjectId] = useState(projectId)
  const [saved, setSaved] = useState(false)
  const [currentDomain, setCurrentDomain] = useState("https://your-app.vercel.app")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDomain(window.location.origin)
    }
  }, [])

  const handleImport = async () => {
    try {
      setError("")
      await importWallet(importValue)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import wallet")
    }
  }

  const handleSaveProjectId = () => {
    setProjectId(localProjectId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="relative flex-1 flex flex-col max-w-6xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8 brutalist-border bg-accent p-3 sm:p-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary flex items-center justify-center border-2 border-black shrink-0">
                <Hexagon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-2xl font-black tracking-tighter uppercase truncate">mockwallet.dev</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <ThemeToggle />
              <AccountSwitcher />
            </div>
          </div>

          <Alert className="mb-6 brutalist-border border-4 border-red-600 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-900 dark:text-red-300 font-bold text-base">
              ⚠️ Security Warning: Use only test seed phrases and private keys. Never use real accounts with actual tokens or value. This wallet is for development and testing purposes only.
            </AlertDescription>
          </Alert>

          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-5 px-4 py-1.5 border-2 border-black font-extrabold uppercase text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Web3 Testing
            </Badge>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-6 text-balance uppercase leading-none">
              The Developer
              <br />
              <span className="text-primary inline-block">Wallet</span> for
              <br />
              Web3 Testing
            </h1>
            <p className="text-base sm:text-xl font-mono max-w-2xl mx-auto text-pretty font-medium px-2 leading-relaxed">
              Test transactions, connect to any dApp via WalletConnect, and debug your Web3 applications. Auto-import
              wallets via URL for seamless CI/CD integration.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 flex-1 items-start">
            <Card className="brutalist-border bg-card">
              <CardHeader className="space-y-1 pb-4 border-b-2 border-black">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-primary flex items-center justify-center border-2 border-black">
                    <Wallet className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black uppercase">Get Started</CardTitle>
                    <CardDescription className="font-mono font-bold">Create or import a test wallet</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 border-2 border-black">
                    <TabsTrigger value="create" className="font-black uppercase">
                      Create
                    </TabsTrigger>
                    <TabsTrigger value="import" className="font-black uppercase">
                      Import
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="create" className="space-y-4">
                    <div className="p-4 bg-secondary border-2 border-black">
                      <p className="text-sm font-mono font-bold">
                        Creates a random private key and mnemonic phrase for testing purposes.
                      </p>
                    </div>
                    <Alert className="border-2 border-black bg-destructive">
                      <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                      <AlertDescription className="text-xs font-mono font-bold text-destructive-foreground">
                        Test wallet only. Never use for real funds or mainnet.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={createNewWallet}
                      size="lg"
                      className="w-full h-14 font-extrabold uppercase text-base border-2 border-black brutalist-shadow"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Create Wallet
                    </Button>
                  </TabsContent>

                  <TabsContent value="import" className="space-y-4">
                    <div className="p-4 bg-secondary border-2 border-black">
                      <p className="text-sm font-mono font-bold">
                        Import using private key, mnemonic phrase, ENS name, or Ethereum address (watch-only).
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Private key, mnemonic, ENS name (e.g. vitalik.eth), or 0x address..."
                        value={importValue}
                        onChange={(e) => {
                          setImportValue(e.target.value)
                          setError("")
                        }}
                        className="font-mono text-sm border-2 border-black"
                      />
                      {error && (
                        <Alert className="border-2 border-black bg-destructive">
                          <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                          <AlertDescription className="text-xs font-mono font-bold text-destructive-foreground">
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <Button
                      onClick={handleImport}
                      size="lg"
                      className="w-full h-14 font-extrabold uppercase text-base border-2 border-black brutalist-shadow"
                      disabled={!importValue.trim()}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Import Wallet
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* How It Works Section */}
            <Card className="brutalist-border bg-card">
              <CardHeader className="pb-4 border-b-2 border-black">
                <CardTitle className="flex items-center gap-3 text-xl font-extrabold uppercase">
                  <Terminal className="h-6 w-6" />
                  How It Works
                </CardTitle>
                <CardDescription className="font-mono font-semibold text-sm">API Documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="p-5 bg-secondary border-2 border-black space-y-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold uppercase">
                    <Code className="w-5 h-5" />
                    Capabilities
                  </div>
                  <ul className="space-y-2.5 text-sm font-mono font-medium leading-relaxed">
                    <li>→ Send test transactions on Sepolia & other testnets</li>
                    <li>→ Connect to dApps via WalletConnect v2</li>
                    <li>→ Sign messages & typed data (EIP-712)</li>
                    <li>→ View transaction history with block explorer links</li>
                    <li>→ Multi-chain support (Sepolia, Polygon, Base, etc.)</li>
                    <li>→ Watch-only mode for any Ethereum address</li>
                  </ul>
                </div>

                <div className="p-5 bg-muted border-2 border-black space-y-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold uppercase">
                    <Terminal className="w-5 h-5" />
                    URL Parameters
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2 bg-background border border-black">
                      <code className="text-primary font-bold">?pk=YOUR_PRIVATE_KEY</code>
                      <p className="mt-1 font-bold">Auto-import wallet</p>
                    </div>
                    <div className="p-2 bg-background border border-black">
                      <code className="text-primary font-bold">?chainId=11155111</code>
                      <p className="mt-1 font-bold">Set network (Sepolia)</p>
                    </div>
                    <div className="p-2 bg-background border border-black">
                      <code className="text-primary font-bold">?projectId=YOUR_ID</code>
                      <p className="mt-1 font-bold">Set Reown project ID</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-accent border-2 border-black">
                  <p className="text-xs font-mono font-bold">
                    <span className="text-primary">Example:</span>
                    <br />
                    <code className="break-all">{currentDomain}?pk=0x...&chainId=11155111</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-5 border-2 border-black bg-card brutalist-shadow-sm">
              <div className="w-10 h-10 bg-secondary flex items-center justify-center mb-3 border-2 border-black">
                <Terminal className="w-5 h-5 text-secondary-foreground" />
              </div>
              <h3 className="font-black uppercase mb-1">URL Import</h3>
              <p className="text-sm font-mono">Auto-import wallets for CI/CD testing pipelines</p>
            </div>

            <div className="p-5 border-2 border-black bg-card brutalist-shadow-sm">
              <div className="w-10 h-10 bg-primary flex items-center justify-center mb-3 border-2 border-black">
                <UserPlus className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-black uppercase mb-1">Multi-Account</h3>
              <p className="text-sm font-mono">Manage multiple accounts from the same seed phrase</p>
            </div>

            <div className="p-5 border-2 border-black bg-card brutalist-shadow-sm">
              <div className="w-10 h-10 bg-accent flex items-center justify-center mb-3 border-2 border-black">
                <Code className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-black uppercase mb-1">Watch-Only</h3>
              <p className="text-sm font-mono">Monitor any Ethereum address without private keys</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
