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
import { Link2, Unlink, AlertCircle, CheckCircle2, Loader2, ExternalLink, Scan } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/lib/wallet/chain-config"

export function WalletConnectConnector() {
  const { account, chainId, projectId } = useWallet()
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [initStatus, setInitStatus] = useState<"idle" | "initializing" | "ready" | "error">("idle")
  const initRef = useRef(false)

  const refreshSessions = useCallback(() => {
    const activeSessions = wcManager.getActiveSessions()
    setSessions(activeSessions)
  }, [wcManager])

  useEffect(() => {
    if (projectId && account && !initRef.current) {
      initRef.current = true
      initializeWC()
    }
  }, [projectId, account])

  useEffect(() => {
    if (projectId && account && initRef.current) {
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

  const handleSessionProposal = (proposal: WCProposal) => {
    console.log("[v0] Received session proposal in UI:", proposal)
    setPendingProposal(proposal)
    setShowSessionDialog(true)
  }

  const handleSessionRequest = (request: WCRequest) => {
    console.log("[v0] Received session request in UI:", request)
    setPendingRequest(request)
    setShowRequestDialog(true)
  }

  const handleConnect = async () => {
    if (!wcUri.trim() || !account) return

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
    if (!pendingProposal || !account) return

    setIsProcessing(true)
    try {
      await wcManager.approveSession(pendingProposal, account.address, chainId)
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
    if (!pendingRequest || !account) return

    setIsProcessing(true)
    try {
      const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chainId)
      const rpcUrl = currentChain?.rpcUrl || "https://1rpc.io/sepolia"
      let result: string

      switch (pendingRequest.method) {
        case "personal_sign": {
          const message = pendingRequest.params[0]
          const messageStr = message.startsWith("0x") ? Buffer.from(message.slice(2), "hex").toString("utf8") : message
          result = await wcManager.signMessage(messageStr, account.privateKey)
          break
        }
        case "eth_sign": {
          const message = pendingRequest.params[1]
          result = await wcManager.signMessage(message, account.privateKey)
          break
        }
        case "eth_signTypedData":
        case "eth_signTypedData_v3":
        case "eth_signTypedData_v4": {
          const typedData = JSON.parse(pendingRequest.params[1])
          const { domain, types, message: value } = typedData
          const { EIP712Domain, ...restTypes } = types
          result = await wcManager.signTypedData(domain, restTypes, value, account.privateKey)
          break
        }
        case "eth_sendTransaction": {
          const tx = pendingRequest.params[0]
          result = await wcManager.sendTransaction(tx, account.privateKey, rpcUrl)
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

  return (
    <>
      <Card className="border-[3px] border-foreground shadow-brutal">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-mono uppercase tracking-tighter">
            <span className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              WalletConnect
            </span>
            <div className="flex items-center gap-2">
              {initStatus === "initializing" && (
                <Badge className="bg-[#ffff00] text-black border-2 border-foreground font-mono text-xs">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  INIT
                </Badge>
              )}
              {initStatus === "ready" && (
                <Badge className="bg-[#00ff00] text-black border-2 border-foreground font-mono text-xs">READY</Badge>
              )}
              {sessionCount > 0 && (
                <Badge className="bg-foreground text-background border-2 border-foreground font-mono">
                  {sessionCount} LIVE
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription className="font-mono text-xs">CONNECT TO ANY DAPP VIA REOWN PROTOCOL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!projectId ? (
            <Alert className="border-[3px] border-foreground bg-[#ff3333]/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">
                ADD YOUR REOWN PROJECT ID IN SETTINGS TO ENABLE WALLETCONNECT
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
    </>
  )
}
