"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/wallet/wallet-provider"
import {
  Wallet,
  Key,
  AlertCircle,
  Link2,
  Network,
  Settings,
  ExternalLink,
  Code,
  Terminal,
  Sparkles,
  Hexagon,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export function WalletSetup() {
  const { createNewWallet, importWallet, projectId, setProjectId } = useWallet()
  const [importValue, setImportValue] = useState("")
  const [error, setError] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [localProjectId, setLocalProjectId] = useState(projectId)
  const [saved, setSaved] = useState(false)
  const [currentDomain, setCurrentDomain] = useState("https://your-app.vercel.app")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDomain(window.location.origin)
    }
  }, [])

  const handleImport = () => {
    try {
      setError("")
      importWallet(importValue)
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
          <div className="flex items-center justify-between mb-8 brutalist-border bg-accent p-4 rotate-slight">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-black">
                <Hexagon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">Reown Dev Wallet</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2 border-2 border-black font-bold uppercase"
            >
              <Settings className="w-4 h-4" />
              {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <Card className="mb-6 brutalist-border bg-card rotate-slight-reverse">
              <CardHeader className="pb-3 border-b-2 border-black">
                <CardTitle className="text-base flex items-center gap-2 font-black uppercase">
                  <Key className="h-4 w-4" />
                  Reown Project ID
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  Required for WalletConnect functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter your Reown/WalletConnect project ID..."
                    value={localProjectId}
                    onChange={(e) => setLocalProjectId(e.target.value)}
                    className="font-mono text-sm border-2 border-black"
                  />
                  <Button
                    onClick={handleSaveProjectId}
                    size="sm"
                    className="px-4 border-2 border-black font-bold uppercase"
                    disabled={localProjectId === projectId}
                  >
                    {saved ? "Saved!" : "Save"}
                  </Button>
                </div>
                <p className="text-xs font-mono">
                  Get your free project ID from{" "}
                  <a
                    href="https://cloud.reown.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold"
                  >
                    cloud.reown.com
                  </a>
                </p>
              </CardContent>
            </Card>
          )}

          <div className="text-center mb-8">
            <Badge
              variant="outline"
              className="mb-4 px-3 py-1 border-2 border-black font-black uppercase rotate-slight"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Web3 Testing
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-balance uppercase leading-none">
              The Developer
              <br />
              <span className="text-primary rotate-slight inline-block">Wallet</span> for
              <br />
              Web3 Testing
            </h1>
            <p className="text-lg font-mono max-w-2xl mx-auto text-pretty font-bold">
              Test transactions, connect to any dApp via WalletConnect, and debug your Web3 applications. Auto-import
              wallets via URL for seamless CI/CD integration.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 flex-1 items-start">
            {/* Wallet Creation Card */}
            <Card className="brutalist-border bg-card rotate-slight">
              <CardHeader className="space-y-1 pb-4 border-b-2 border-black">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-warning flex items-center justify-center border-2 border-black">
                    <Wallet className="w-6 h-6 text-warning-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black uppercase">Get Started</CardTitle>
                    <CardDescription className="font-mono font-bold">Create or import a test wallet</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 border-2 border-black p-0 bg-muted">
                    <TabsTrigger value="create" className="font-black uppercase">
                      Create
                    </TabsTrigger>
                    <TabsTrigger value="import" className="font-black uppercase">
                      Import
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="create" className="space-y-4">
                    <div className="p-4 bg-accent border-2 border-black">
                      <p className="text-sm font-mono font-bold">
                        Creates a random private key and mnemonic phrase for testing purposes.
                      </p>
                    </div>
                    <Alert className="border-2 border-black bg-warning">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs font-mono font-bold">
                        Test wallet only. Never use for real funds or mainnet.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={createNewWallet}
                      size="lg"
                      className="w-full h-12 font-black uppercase border-2 border-black brutalist-shadow"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Wallet
                    </Button>
                  </TabsContent>

                  <TabsContent value="import" className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="import-key" className="text-sm font-black uppercase">
                        Private Key or Mnemonic
                      </Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4" />
                        <Input
                          id="import-key"
                          type="password"
                          placeholder="0x... or 12/24 word phrase"
                          value={importValue}
                          onChange={(e) => setImportValue(e.target.value)}
                          className="pl-9 h-11 font-mono text-sm border-2 border-black"
                        />
                      </div>
                    </div>
                    {error && (
                      <Alert variant="destructive" className="border-2 border-black">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs font-mono font-bold">{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      onClick={handleImport}
                      size="lg"
                      disabled={!importValue.trim()}
                      className="w-full h-12 font-black uppercase border-2 border-black brutalist-shadow"
                    >
                      Import
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="brutalist-border bg-card rotate-slight-reverse">
              <CardHeader className="pb-3 border-b-2 border-black">
                <CardTitle className="flex items-center gap-2 text-xl font-black uppercase">
                  <Terminal className="h-5 w-5" />
                  How It Works
                </CardTitle>
                <CardDescription className="font-mono font-bold">API Documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* URL Parameters */}
                <div className="p-4 bg-secondary border-2 border-black space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black uppercase">
                    <Link2 className="w-4 h-4" />
                    URL Parameters
                  </div>
                  <div className="space-y-2 text-xs font-mono font-bold">
                    <div className="p-2 bg-background border-2 border-black">
                      ?pk=<span className="text-primary">{"<private_key>"}</span>
                    </div>
                    <div className="p-2 bg-background border-2 border-black">
                      ?chainId=<span className="text-primary">11155111</span>
                    </div>
                    <div className="p-2 bg-background border-2 border-black">
                      ?projectId=<span className="text-primary">{"<reown_id>"}</span>
                    </div>
                  </div>
                </div>

                {/* Supported Chains */}
                <div className="p-4 bg-accent border-2 border-black space-y-3 rotate-slight">
                  <div className="flex items-center gap-2 text-sm font-black uppercase">
                    <Network className="w-4 h-4" />
                    Testnets
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
                    <div>• Sepolia</div>
                    <div>• Base Sepolia</div>
                    <div>• Arbitrum</div>
                    <div>• Polygon</div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="p-4 bg-warning border-2 border-black space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black uppercase">
                    <Code className="w-4 h-4" />
                    Capabilities
                  </div>
                  <ul className="space-y-2 text-xs font-mono font-bold">
                    <li>→ Send test transactions</li>
                    <li>→ WalletConnect v2 dApps</li>
                    <li>→ Sign messages EIP-712</li>
                    <li>→ Transaction history</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 brutalist-border bg-primary rotate-slight">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0 border-2 border-black">
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-black uppercase text-xl text-primary-foreground">Quick Start</h3>
                  <p className="text-sm font-mono font-bold text-primary-foreground">
                    Open with pre-configured wallet:
                  </p>
                  <code className="block p-3 bg-black text-white text-xs font-mono overflow-x-auto border-2 border-black">
                    {currentDomain}/?pk=0xKEY&chainId=11155111
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-5 border-2 border-black bg-card brutalist-shadow-sm rotate-slight">
              <div className="w-10 h-10 bg-primary flex items-center justify-center mb-3 border-2 border-black">
                <Link2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-black uppercase mb-1">WalletConnect</h3>
              <p className="text-sm font-mono">Connect to any Web3 dApp</p>
            </div>

            <div className="p-5 border-2 border-black bg-card brutalist-shadow-sm -rotate-1">
              <div className="w-10 h-10 bg-warning flex items-center justify-center mb-3 border-2 border-black">
                <Terminal className="w-5 h-5 text-warning-foreground" />
              </div>
              <h3 className="font-black uppercase mb-1">URL Import</h3>
              <p className="text-sm font-mono">Auto-import for CI/CD testing</p>
            </div>

            <div className="p-5 border-2 border-black bg-card brutalist-shadow-sm rotate-1">
              <div className="w-10 h-10 bg-black flex items-center justify-center mb-3 border-2 border-black">
                <Network className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black uppercase mb-1">Multi-Chain</h3>
              <p className="text-sm font-mono">Test across multiple testnets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
