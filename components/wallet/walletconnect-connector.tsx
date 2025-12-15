"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWallet } from "@/lib/wallet/wallet-provider"
import {
  WalletConnectManager,
  type WCSession,
  type WCProposal,
  type WCRequest,
  parseWCUri,
} from "@/lib/walletconnect/wc-manager"
import { Link2, Unlink, AlertCircle, CheckCircle2, Loader2, ExternalLink, Scan, Settings, Eye, Bot } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/lib/wallet/chain-config"

export function WalletConnectConnector() {
  const { activeAccount, chainId, projectId, agentMode } = useWallet()
  const [wcUri, setWcUri] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState("")
  const [sessions, setSessions] = useState<Record<string, WCSession>>({})
  const [pendingProposal, setPendingProposal] = useState<WCProposal | null>(null)
  const [pendingRequest, setPendingRequest] = useState<WCRequest | null>(null)
  const [wcManager] = useState(() => WalletConnectManager.getInstance())
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showProjectIdDialog, setShowProjectIdDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [initStatus, setInitStatus] = useState<"idle" | "initializing" | "ready" | "error">("idle")
  const initRef = useRef(false)
  const agentModeRef = useRef(agentMode)
  const activeAccountRef = useRef(activeAccount)
  const chainIdRef = useRef(chainId)

  // Keep refs in sync with state
  useEffect(() => {
    agentModeRef.current = agentMode
  }, [agentMode])

  useEffect(() => {
    activeAccountRef.current = activeAccount
  }, [activeAccount])

  useEffect(() => {
    chainIdRef.current = chainId
  }, [chainId])

  // Auto-connect when WC URI is pasted in agent mode
  useEffect(() => {
    if (agentMode && wcUri.trim() && activeAccount && initStatus === "ready" && !isConnecting) {
      const parsed = parseWCUri(wcUri)
      if (parsed) {
        console.log("[v0] Agent mode: auto-connecting with pasted URI...")
        handleConnect()
      }
    }
  }, [wcUri, agentMode])

  const refreshSessions = useCallback(() => {
    const activeSessions = wcManager.getActiveSessions()
    setSessions(activeSessions)
  }, [wcManager])

  useEffect(() => {
    if (projectId && activeAccount && !initRef.current) {
      initRef.current = true
      initializeWC()
    }
  }, [projectId, activeAccount])

  useEffect(() => {
    if (projectId && activeAccount && initRef.current) {
      initializeWC()
    }
  }, [projectId])

  const initializeWC = async () => {
    if (!projectId) {
      setError("Please set your Reown Project ID in settings")
      setInitStatus("error")
      return
    }

    setIsInitializing(true)
    setInitStatus("initializing")
    setError("")

    try {
      console.log("[v0] Starting WalletConnect initialization...")
      await wcManager.initialize(projectId)

      refreshSessions()

      wcManager.off("session_proposal", handleSessionProposal)
      wcManager.off("session_request", handleSessionRequest)
      wcManager.off("session_update", refreshSessions)
      wcManager.off("session_delete", refreshSessions)

      wcManager.on("session_proposal", handleSessionProposal)
      wcManager.on("session_request", handleSessionRequest)
      wcManager.on("session_update", refreshSessions)
      wcManager.on("session_delete", refreshSessions)

      setInitStatus("ready")
      console.log("[v0] WalletConnect ready in UI")
    } catch (err) {
      console.error("[v0] WC initialization error:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize WalletConnect")
      setInitStatus("error")
      initRef.current = false
    } finally {
      setIsInitializing(false)
    }
  }

  const handleSessionProposal = async (proposal: WCProposal) => {
    console.log("[v0] Received session proposal in UI:", proposal)
    const currentAccount = activeAccountRef.current
    const currentChainId = chainIdRef.current
    
    // Auto-approve in agent mode
    if (agentModeRef.current && currentAccount && !currentAccount.isWatchOnly) {
      console.log("[v0] Agent mode enabled, auto-approving session...")
      try {
        await wcManager.approveSession(proposal, currentAccount.address, currentChainId)
        refreshSessions()
        console.log("[v0] Session auto-approved in agent mode")
        return
      } catch (err) {
        console.error("[v0] Auto-approve error:", err)
        // Fall back to manual approval on error
      }
    }
    
    setPendingProposal(proposal)
    setShowSessionDialog(true)
  }

  const handleSessionRequest = async (request: WCRequest) => {
    console.log("[v0] Received session request in UI:", request)
    const currentAccount = activeAccountRef.current
    const currentChainId = chainIdRef.current
    
    // Auto-approve in agent mode
    if (agentModeRef.current && currentAccount && !currentAccount.isWatchOnly && currentAccount.privateKey) {
      console.log("[v0] Agent mode enabled, auto-processing request...")
      try {
        const currentChain = SUPPORTED_CHAINS.find((c) => c.id === currentChainId)
        const rpcUrl = currentChain?.rpcUrl || "https://1rpc.io/sepolia"
        let result: string

        switch (request.method) {
          case "personal_sign": {
            const message = request.params[0]
            const messageStr = message.startsWith("0x") ? Buffer.from(message.slice(2), "hex").toString("utf8") : message
            result = await wcManager.signMessage(messageStr, currentAccount.privateKey)
            break
          }
          case "eth_sign": {
            const message = request.params[1]
            result = await wcManager.signMessage(message, currentAccount.privateKey)
            break
          }
          case "eth_signTypedData":
          case "eth_signTypedData_v3":
          case "eth_signTypedData_v4": {
            const typedData = JSON.parse(request.params[1])
            const { domain, types, message: value } = typedData
            const { EIP712Domain, ...restTypes } = types
            result = await wcManager.signTypedData(domain, restTypes, value, currentAccount.privateKey)
            break
          }
          case "eth_sendTransaction": {
            const tx = request.params[0]
            result = await wcManager.sendTransaction(tx, currentAccount.privateKey, rpcUrl)
            break
          }
          default:
            console.log("[v0] Unsupported method for auto-sign:", request.method)
            // Fall back to manual for unsupported methods
            setPendingRequest(request)
            setShowRequestDialog(true)
            return
        }

        await wcManager.respondToRequest(request.id, { result })
        console.log("[v0] Request auto-processed in agent mode")
        return
      } catch (err) {
        console.error("[v0] Auto-process error:", err)
        // Fall back to manual approval on error
      }
    }
    
    setPendingRequest(request)
    setShowRequestDialog(true)
  }

  const handleConnect = async () => {
    if (!wcUri.trim() || !activeAccount) return

    setIsConnecting(true)
    setError("")

    try {
      const parsed = parseWCUri(wcUri)
      if (!parsed) {
        throw new Error("Invalid WalletConnect URI. Must start with 'wc:'")
      }

      console.log("[v0] Attempting to pair with URI...")
      await wcManager.pair(wcUri)
      setWcUri("")
      console.log("[v0] Pair called successfully, waiting for proposal...")
    } catch (err) {
      console.error("[v0] Connection error:", err)
      setError(err instanceof Error ? err.message : "Failed to connect")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleApprove = async () => {
    if (!pendingProposal || !activeAccount) return

    setIsProcessing(true)
    try {
      await wcManager.approveSession(pendingProposal, activeAccount.address, chainId)
      setShowSessionDialog(false)
      setPendingProposal(null)
      refreshSessions()
    } catch (err) {
      console.error("[v0] Approve error:", err)
      setError(err instanceof Error ? err.message : "Failed to approve session")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!pendingProposal) return

    setIsProcessing(true)
    try {
      await wcManager.rejectSession(pendingProposal.id)
      setShowSessionDialog(false)
      setPendingProposal(null)
    } catch (err) {
      console.error("[v0] Reject error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRequestApprove = async () => {
    if (!pendingRequest || !activeAccount) return

    if (activeAccount.isWatchOnly) {
      setError("Cannot sign requests from a watch-only account")
      return
    }

    if (!activeAccount.privateKey) {
      setError("Private key not available")
      return
    }

    setIsProcessing(true)
    try {
      const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chainId)
      const rpcUrl = currentChain?.rpcUrl || "https://1rpc.io/sepolia"
      let result: string

      switch (pendingRequest.method) {
        case "personal_sign": {
          const message = pendingRequest.params[0]
          const messageStr = message.startsWith("0x") ? Buffer.from(message.slice(2), "hex").toString("utf8") : message
          result = await wcManager.signMessage(messageStr, activeAccount.privateKey)
          break
        }
        case "eth_sign": {
          const message = pendingRequest.params[1]
          result = await wcManager.signMessage(message, activeAccount.privateKey)
          break
        }
        case "eth_signTypedData":
        case "eth_signTypedData_v3":
        case "eth_signTypedData_v4": {
          const typedData = JSON.parse(pendingRequest.params[1])
          const { domain, types, message: value } = typedData
          const { EIP712Domain, ...restTypes } = types
          result = await wcManager.signTypedData(domain, restTypes, value, activeAccount.privateKey)
          break
        }
        case "eth_sendTransaction": {
          const tx = pendingRequest.params[0]
          result = await wcManager.sendTransaction(tx, activeAccount.privateKey, rpcUrl)
          break
        }
        default:
          throw new Error(`Unsupported method: ${pendingRequest.method}`)
      }

      await wcManager.respondToRequest(pendingRequest.id, { result })
      setShowRequestDialog(false)
      setPendingRequest(null)
    } catch (err) {
      console.error("[v0] Request approval error:", err)
      setError(err instanceof Error ? err.message : "Failed to process request")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRequestReject = async () => {
    if (!pendingRequest) return

    setIsProcessing(true)
    try {
      await wcManager.respondToRequest(pendingRequest.id, {
        error: { code: 4001, message: "User rejected the request" },
      })
      setShowRequestDialog(false)
      setPendingRequest(null)
    } catch (err) {
      console.error("[v0] Request rejection error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisconnect = async (topic: string) => {
    try {
      await wcManager.disconnectSession(topic)
      refreshSessions()
    } catch (err) {
      console.error("[v0] Disconnect error:", err)
      setError(err instanceof Error ? err.message : "Failed to disconnect")
    }
  }

  const sessionCount = Object.keys(sessions).length

  const formatRequestParams = (request: WCRequest) => {
    try {
      if (request.method === "personal_sign" || request.method === "eth_sign") {
        const message = request.params[0]
        if (message.startsWith("0x")) {
          return Buffer.from(message.slice(2), "hex").toString("utf8")
        }
        return message
      }
      return JSON.stringify(request.params, null, 2)
    } catch {
      return JSON.stringify(request.params, null, 2)
    }
  }

  const isWatchOnly = activeAccount?.isWatchOnly

  return (
    <>
      <Card className="brutalist-border bg-card">
        <CardHeader className="pb-3 border-b-[3px] border-foreground">
          <CardTitle className="flex items-center justify-between text-xl font-black uppercase">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              WALLETCONNECT
            </div>
            {initStatus === "ready" && (
              <Badge variant="outline" className="border-[2px] border-success text-success font-mono text-xs">
                READY
              </Badge>
            )}
            {initStatus === "initializing" && (
              <Badge variant="outline" className="border-[2px] border-warning text-warning font-mono text-xs">
                INIT
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="font-mono font-bold">Connect to any Web3 dApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {isWatchOnly && (
            <Alert className="border-[3px] border-foreground bg-warning/20">
              <Eye className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs font-bold">
                WATCH-ONLY MODE: Can connect to dApps but cannot sign transactions or messages
              </AlertDescription>
            </Alert>
          )}

          {!projectId ? (
            <Alert className="border-[3px] border-foreground bg-warning/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p className="font-mono text-xs font-bold">Reown Project ID required for WalletConnect</p>
                <Button
                  onClick={() => setShowProjectIdDialog(true)}
                  size="sm"
                  className="w-full border-[2px] border-foreground font-black uppercase"
                >
                  <Settings className="w-3 h-3 mr-2" />
                  Add Project ID
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="wc-uri" className="font-mono uppercase text-xs font-black">
                  PASTE WC URI
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="wc-uri"
                    placeholder="wc:..."
                    value={wcUri}
                    onChange={(e) => setWcUri(e.target.value)}
                    className="font-mono text-sm border-[3px] border-foreground"
                    disabled={isConnecting || initStatus !== "ready"}
                  />
                  <Button
                    onClick={handleConnect}
                    disabled={!wcUri.trim() || isConnecting || initStatus !== "ready"}
                    className="px-6 bg-foreground text-background border-[3px] border-foreground font-mono uppercase hover:bg-background hover:text-foreground"
                  >
                    {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "PAIR"}
                  </Button>
                </div>
                {initStatus === "initializing" && (
                  <p className="font-mono text-xs text-[#ffff00]">Connecting to relay server...</p>
                )}
              </div>

              {error && (
                <Alert className="border-[3px] border-foreground bg-[#ff3333]/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {sessionCount > 0 && (
                <div className="space-y-3 pt-4 border-t-[3px] border-foreground">
                  <Label className="font-mono uppercase text-xs font-black">ACTIVE SESSIONS</Label>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {Object.values(sessions).map((session) => (
                        <div
                          key={session.topic}
                          className="flex items-start gap-3 p-4 border-[3px] border-foreground shadow-brutal-sm bg-background"
                        >
                          <div className="w-10 h-10 border-[2px] border-foreground flex items-center justify-center bg-[#00ff00]">
                            {session.peerMetadata.icons?.[0] ? (
                              <img
                                src={session.peerMetadata.icons[0] || "/placeholder.svg"}
                                alt=""
                                className="w-8 h-8 object-contain"
                              />
                            ) : (
                              <Link2 className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono font-black text-sm uppercase">{session.peerMetadata.name}</div>
                            <p className="font-mono text-xs truncate text-muted-foreground">
                              {session.peerMetadata.url}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="text-xs border-2 border-foreground bg-[#00ff00] text-black font-mono">
                                CONNECTED
                              </Badge>
                              {session.peerMetadata.url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs font-mono"
                                  onClick={() => window.open(session.peerMetadata.url, "_blank")}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  VISIT
                                </Button>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisconnect(session.topic)}
                            className="border-2 border-foreground hover:bg-[#ff3333] hover:text-white"
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {sessionCount === 0 && !error && initStatus === "ready" && (
                <div className="flex flex-col items-center justify-center py-8 text-center border-[3px] border-dashed border-foreground">
                  <Scan className="h-12 w-12 mb-4" />
                  <p className="font-mono text-sm uppercase font-black">NO ACTIVE CONNECTIONS</p>
                  <p className="font-mono text-xs mt-1 text-muted-foreground">PASTE A WC URI TO CONNECT</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Session Proposal Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-md border-[3px] border-foreground shadow-brutal bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono uppercase font-black">
              <Link2 className="h-5 w-5" />
              CONNECTION REQUEST
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">A DAPP WANTS TO CONNECT TO YOUR WALLET</DialogDescription>
          </DialogHeader>

          {pendingProposal && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border-[3px] border-foreground bg-muted">
                <div className="w-12 h-12 border-[2px] border-foreground flex items-center justify-center bg-background">
                  {pendingProposal.params.proposer.metadata.icons?.[0] ? (
                    <img
                      src={pendingProposal.params.proposer.metadata.icons[0] || "/placeholder.svg"}
                      alt=""
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Link2 className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-mono font-black uppercase">{pendingProposal.params.proposer.metadata.name}</div>
                  <p className="font-mono text-xs truncate text-muted-foreground">
                    {pendingProposal.params.proposer.metadata.url}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono uppercase text-xs font-black">PERMISSIONS REQUESTED:</Label>
                <ul className="font-mono text-xs space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    VIEW WALLET ADDRESS
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    REQUEST TRANSACTION APPROVAL
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    SIGN MESSAGES
                  </li>
                </ul>
              </div>

              <Alert className="border-[3px] border-foreground bg-[#ffff00]/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-mono text-xs">
                  TEST WALLET ONLY - NEVER USE WITH REAL FUNDS
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 border-[3px] border-foreground font-mono uppercase hover:bg-[#ff3333] hover:text-white bg-transparent"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "REJECT"}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-[#00ff00] text-black border-[3px] border-foreground font-mono uppercase hover:bg-[#00cc00]"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "APPROVE"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Request Dialog (signing, transactions) */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md border-[3px] border-foreground shadow-brutal bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono uppercase font-black">
              <AlertCircle className="h-5 w-5" />
              {pendingRequest?.method.includes("sign") ? "SIGN REQUEST" : "TRANSACTION REQUEST"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">{pendingRequest?.method.toUpperCase()}</DialogDescription>
          </DialogHeader>

          {pendingRequest && (
            <div className="space-y-4">
              {isWatchOnly && (
                <Alert className="border-[3px] border-foreground bg-[#ff3333]/20">
                  <Eye className="h-4 w-4" />
                  <AlertDescription className="font-mono text-xs">
                    CANNOT PROCESS REQUEST: WATCH-ONLY ACCOUNT
                  </AlertDescription>
                </Alert>
              )}

              <div className="p-4 border-[3px] border-foreground bg-muted font-mono text-xs overflow-auto max-h-[200px]">
                <pre className="whitespace-pre-wrap break-all">{formatRequestParams(pendingRequest)}</pre>
              </div>

              <Alert className="border-[3px] border-foreground bg-[#ffff00]/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-mono text-xs">
                  REVIEW THE REQUEST CAREFULLY BEFORE SIGNING
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRequestReject}
                  disabled={isProcessing}
                  className="flex-1 border-[3px] border-foreground font-mono uppercase hover:bg-[#ff3333] hover:text-white bg-transparent"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "REJECT"}
                </Button>
                <Button
                  onClick={handleRequestApprove}
                  disabled={isProcessing || isWatchOnly}
                  className="flex-1 bg-[#00ff00] text-black border-[3px] border-foreground font-mono uppercase hover:bg-[#00cc00] disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "APPROVE"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Project ID Settings Dialog */}
      <Dialog open={showProjectIdDialog} onOpenChange={setShowProjectIdDialog}>
        <DialogContent className="border-4 border-foreground bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Reown Project ID</DialogTitle>
            <DialogDescription className="font-mono font-bold">
              Required for WalletConnect functionality
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-2 border-foreground">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-mono">
                Get your free project ID from{" "}
                <a
                  href="https://cloud.reown.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold"
                >
                  cloud.reown.com
                </a>
              </AlertDescription>
            </Alert>
            <ProjectIdInput onClose={() => setShowProjectIdDialog(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ProjectIdInput({ onClose }: { onClose: () => void }) {
  const { projectId, setProjectId } = useWallet()
  const [localValue, setLocalValue] = useState(projectId)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setProjectId(localValue)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 1000)
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="project-id-input" className="font-mono uppercase text-xs font-black">
        Project ID
      </Label>
      <Input
        id="project-id-input"
        type="text"
        placeholder="Enter your Reown/WalletConnect project ID..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="font-mono text-sm border-2 border-foreground"
      />
      <Button
        onClick={handleSave}
        size="lg"
        className="w-full h-12 font-black uppercase border-2 border-foreground brutalist-shadow"
        disabled={!localValue.trim() || localValue === projectId}
      >
        {saved ? "Saved!" : "Save Project ID"}
      </Button>
    </div>
  )
}
