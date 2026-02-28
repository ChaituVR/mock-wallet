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
import { Link2, Unlink, AlertCircle, CheckCircle2, Loader2, ExternalLink, Scan, Settings, Eye, Bot, Camera, X, PlayCircle, Download, Copy, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { SUPPORTED_CHAINS } from "@/lib/wallet/chain-config"
import { Switch } from "@/components/ui/switch"
import dynamic from "next/dynamic"
import { TransactionSimulator, type TransactionData } from "./transaction-simulator"
import { DataVerifier } from "./data-verifier"

// Dynamically import QR scanner to avoid SSR issues
const QrScanner = dynamic(() => import("react-qr-scanner"), { ssr: false })

// Helper function to format time ago
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function WalletConnectConnector() {
  const { activeAccount, chainId, projectId } = useWallet()
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
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [initStatus, setInitStatus] = useState<"idle" | "initializing" | "ready" | "error">("idle")
  const [showTransactionSimulator, setShowTransactionSimulator] = useState(false)
  const [simulatorTransaction, setSimulatorTransaction] = useState<TransactionData | null>(null)
  const [requestLogs, setRequestLogs] = useState<Array<{
    id: string
    timestamp: Date
    method: string
    status: "approved" | "rejected" | "pending"
    params: any
    result?: any
  }>>([])
  const [agentMode, setAgentMode] = useState(false)
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null)
  const initRef = useRef(false)
  const activeAccountRef = useRef(activeAccount)
  const chainIdRef = useRef(chainId)
  const agentModeRef = useRef(false)
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wcUriFromUrlRef = useRef<string | null>(null)

  // Keep refs in sync with state
  useEffect(() => {
    activeAccountRef.current = activeAccount
  }, [activeAccount])

  useEffect(() => {
    agentModeRef.current = agentMode
  }, [agentMode])

  // Initialize agent mode from localStorage or URL param
  useEffect(() => {
    if (typeof window === "undefined") return
    const urlParams = new URLSearchParams(window.location.search)
    const urlAgent = urlParams.get("agent")
    if (urlAgent === "true" || urlAgent === "1") {
      setAgentMode(true)
      agentModeRef.current = true
      localStorage.setItem("mockwallet_agent_mode", "true")
    } else {
      const saved = localStorage.getItem("mockwallet_agent_mode")
      if (saved === "true") {
        setAgentMode(true)
        agentModeRef.current = true
      }
    }
    // Read WC URI from URL param for auto-connect
    const urlWc = urlParams.get("wc")
    if (urlWc) {
      wcUriFromUrlRef.current = urlWc.startsWith("wc:") ? urlWc : `wc:${urlWc}`
    }
  }, [])

  // Auto-connect WC URI from URL param after initialization is ready
  useEffect(() => {
    if (initStatus !== "ready" || !wcUriFromUrlRef.current || !activeAccount) return
    const uri = wcUriFromUrlRef.current
    wcUriFromUrlRef.current = null // Only attempt once
    console.log("[v0] Auto-connecting WC URI from URL param:", uri.substring(0, 20) + "...")
    handleConnect(uri)
    // Clean URL after auto-connect for security
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("wc")
      window.history.replaceState({}, "", url.toString())
    }
  }, [initStatus, activeAccount])

  const toggleAgentMode = (checked: boolean) => {
    setAgentMode(checked)
    agentModeRef.current = checked
    localStorage.setItem("mockwallet_agent_mode", checked ? "true" : "false")
  }

  // Listen for agent mode changes from command palette or other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mockwallet_agent_mode") {
        const newValue = e.newValue === "true"
        setAgentMode(newValue)
        agentModeRef.current = newValue
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    chainIdRef.current = chainId
  }, [chainId])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current)
      }
    }
  }, [])

  // Update WalletConnect sessions when account or chain changes
  useEffect(() => {
    const updateSessions = async () => {
      if (!activeAccount || initStatus !== "ready") return
      
      try {
        const activeSessions = wcManager.getActiveSessions()
        const sessionCount = Object.keys(activeSessions).length
        
        if (sessionCount > 0) {
          console.log("[v0] Account or chain changed, updating WalletConnect sessions...")
          await wcManager.updateSessionAccount(activeAccount.address, chainId)
          console.log("[v0] All sessions updated with new account/chain")
        }
      } catch (err) {
        console.error("[v0] Failed to update sessions:", err)
      }
    }

    updateSessions()
  }, [activeAccount?.address, chainId, initStatus])

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

  // Auto-approve a WC request (used in Agent Mode)
  const autoApproveRequest = async (request: WCRequest) => {
    const account = activeAccountRef.current
    if (!account || !account.privateKey) return

    const currentChain = SUPPORTED_CHAINS.find((c) => c.chainId === chainIdRef.current)
    const rpcUrl = currentChain?.rpcUrls.default.http[0] || "https://1rpc.io/sepolia"
    let result: string

    switch (request.method) {
      case "personal_sign": {
        const message = request.params[0]
        const messageStr = message.startsWith("0x") ? Buffer.from(message.slice(2), "hex").toString("utf8") : message
        result = await wcManager.signMessage(messageStr, account.privateKey)
        break
      }
      case "eth_sign": {
        const message = request.params[1]
        result = await wcManager.signMessage(message, account.privateKey)
        break
      }
      case "eth_signTypedData":
      case "eth_signTypedData_v3":
      case "eth_signTypedData_v4": {
        const typedData = JSON.parse(request.params[1])
        const { domain, types, message: value } = typedData
        const { EIP712Domain, ...restTypes } = types
        result = await wcManager.signTypedData(domain, restTypes, value, account.privateKey)
        break
      }
      case "eth_sendTransaction": {
        const tx = request.params[0]
        result = await wcManager.sendTransaction(tx, account.privateKey, rpcUrl)
        break
      }
      default:
        throw new Error(`Unsupported method: ${request.method}`)
    }

    await wcManager.respondToRequest(request.id, { result })

    // Update log status
    setRequestLogs(prev => prev.map(log =>
      log.id === `${request.id}` ? { ...log, status: "approved" as const, result } : log
    ))
  }

  const handleSessionProposal = async (proposal: WCProposal) => {
    console.log("[v0] Received session proposal in UI:", proposal)

    // Agent Mode: auto-approve session proposals
    if (agentModeRef.current && activeAccountRef.current && !activeAccountRef.current.isWatchOnly) {
      try {
        console.log("[v0] Agent Mode: auto-approving session proposal")
        await wcManager.approveSession(proposal, activeAccountRef.current.address, chainIdRef.current)
        refreshSessions()
        toast({
          title: "🤖 Agent Mode: Session Approved",
          description: `Auto-connected to ${proposal.params.proposer.metadata.name}`,
          variant: "success",
        })
        return
      } catch (err) {
        console.error("[v0] Agent Mode auto-approve session error:", err)
        toast({
          title: "⚠️ Agent Mode: Session Failed",
          description: "Falling back to manual approval",
          variant: "destructive",
        })
        // Fall through to manual mode
      }
    }
    
    setPendingProposal(proposal)
    setShowSessionDialog(true)
  }

  const handleSessionRequest = async (request: WCRequest) => {
    console.log("[v0] Received session request in UI:", request)
    
    // Add to request log
    setRequestLogs(prev => [{
      id: `${request.id}`,
      timestamp: new Date(),
      method: request.method,
      status: (agentModeRef.current ? "approved" : "pending") as const,
      params: request.params,
    }, ...prev].slice(0, 50)) // Keep last 50 requests

    // Agent Mode: auto-approve signing and transaction requests
    if (agentModeRef.current && activeAccountRef.current && !activeAccountRef.current.isWatchOnly && activeAccountRef.current.privateKey) {
      try {
        console.log("[v0] Agent Mode: auto-approving request:", request.method)
        await autoApproveRequest(request)
        toast({
          title: "🤖 Agent Mode: Request Signed",
          description: `Auto-approved ${request.method}`,
          variant: "success",
        })
        return
      } catch (err) {
        console.error("[v0] Agent Mode auto-approve request error:", err)
        toast({
          title: "⚠️ Agent Mode: Request Failed",
          description: `Failed to auto-approve ${request.method}`,
          variant: "destructive",
        })
        // Fall through to manual mode
      }
    }
    
    setPendingRequest(request)
    setShowRequestDialog(true)
  }

  const handleConnect = async (uriToConnect?: string) => {
    const uri = uriToConnect || wcUri
    if (!uri.trim() || !activeAccount) return

    setIsConnecting(true)
    setError("")

    try {
      const parsed = parseWCUri(uri)
      if (!parsed) {
        throw new Error("Invalid WalletConnect URI. Must start with 'wc:'")
      }

      console.log("[v0] Attempting to pair with URI...")
      await wcManager.pair(uri)
      setWcUri("")
      setShowQrScanner(false)
      console.log("[v0] Pair called successfully, waiting for proposal...")
    } catch (err) {
      console.error("[v0] Connection error:", err)
      setError(err instanceof Error ? err.message : "Failed to connect")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleQrScan = (data: any) => {
    if (data?.text) {
      const uri = data.text
      if (uri.startsWith("wc:")) {
        setWcUri(uri)
        setShowQrScanner(false)
        // Auto-connect after scanning
        setTimeout(() => {
          if (uri && activeAccount) {
            handleConnect(uri)
          }
        }, 100)
      }
    }
  }

  const handleQrError = (err: any) => {
    console.error("[v0] QR Scanner error:", err)
    setError("Failed to access camera. Please check permissions.")
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
      const currentChain = SUPPORTED_CHAINS.find((c) => c.chainId === chainId)
      const rpcUrl = currentChain?.rpcUrls.default.http[0] || "https://1rpc.io/sepolia"
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
      
      // Update log status
      setRequestLogs(prev => prev.map(log => 
        log.id === `${pendingRequest.id}` ? { ...log, status: "approved" as const, result } : log
      ))
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
      
      // Update log status
      setRequestLogs(prev => prev.map(log => 
        log.id === `${pendingRequest.id}` ? { ...log, status: "rejected" as const } : log
      ))
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

  const handleDisconnectAll = async () => {
    const topics = Object.keys(sessions)
    for (const topic of topics) {
      try {
        await wcManager.disconnectSession(topic)
      } catch (err) {
        console.error("[v0] Disconnect error for", topic, err)
      }
    }
    refreshSessions()
    toast({
      title: "✓ All Sessions Disconnected",
      description: `Disconnected ${topics.length} session${topics.length !== 1 ? 's' : ''}`,
      variant: "success",
    })
  }

  const exportLogsAsJson = () => {
    const data = requestLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      method: log.method,
      status: log.status,
      params: log.params,
      ...(log.result ? { result: log.result } : {}),
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wc-request-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "✓ Logs Exported",
      description: `Exported ${data.length} request log${data.length !== 1 ? 's' : ''} as JSON`,
      variant: "success",
    })
  }

  const copyLogResult = (logId: string, result: string) => {
    navigator.clipboard.writeText(result)
    setCopiedLogId(logId)
    setTimeout(() => setCopiedLogId(null), 2000)
  }

  const formatSessionDuration = (connectedAt: number): string => {
    const seconds = Math.floor((Date.now() - connectedAt * 1000) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ${minutes % 60}m`
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
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
      <Card className="brutalist-border bg-gradient-to-br from-primary/5 via-card to-primary/10 shadow-2xl border-primary/30 border-[3px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <CardHeader className="pb-4 border-b-[3px] border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <CardTitle className="flex items-center justify-between text-2xl font-black uppercase relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center border-2 border-black shadow-lg animate-pulse">
                <Link2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  WALLETCONNECT
                  <Badge className="bg-primary text-primary-foreground border-none font-bold text-xs">LIVE</Badge>
                </div>
                <p className="text-xs font-mono font-semibold text-muted-foreground normal-case mt-0.5">Real-time dApp Connection</p>
              </div>
            </div>
            {initStatus === "ready" && (
              <Badge variant="outline" className="border-2 border-success text-success font-mono text-xs font-bold">
                READY
              </Badge>
            )}
            {initStatus === "initializing" && (
              <Badge variant="outline" className="border-2 border-warning  font-mono text-xs font-bold">
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

          {/* Agent Mode Toggle */}
          {!isWatchOnly && (
            <div className={`flex items-center justify-between p-3 border-[3px] transition-all ${
              agentMode 
                ? 'border-[#00ff00] bg-[#00ff00]/10 shadow-[0_0_15px_rgba(0,255,0,0.15)]' 
                : 'border-foreground/30 bg-muted/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center border-2 ${
                  agentMode ? 'border-[#00ff00] bg-[#00ff00]/20' : 'border-foreground/50 bg-muted'
                }`}>
                  <Bot className={`h-4 w-4 ${agentMode ? 'text-[#00ff00] animate-pulse' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <Label htmlFor="agent-mode" className="font-mono text-xs font-black uppercase cursor-pointer">
                    Agent Mode
                  </Label>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {agentMode ? 'AUTO-APPROVING ALL REQUESTS' : 'Auto-approve sessions & requests'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {agentMode && (
                  <Badge className="bg-[#00ff00] text-black border-none font-mono text-[10px] animate-pulse">
                    ACTIVE
                  </Badge>
                )}
                <Switch
                  id="agent-mode"
                  checked={agentMode}
                  onCheckedChange={toggleAgentMode}
                />
              </div>
            </div>
          )}

          {!projectId ? (
            <Alert className="border-[3px] border-foreground bg-warning/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p className="font-mono text-xs font-bold">Reown Project ID required for WalletConnect</p>
                <Button
                  onClick={() => setShowProjectIdDialog(true)}
                  size="sm"
                  className="w-full border-2 border-foreground font-black uppercase"
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
                  <div className="flex-1 space-y-2">
                    <Input
                      id="wc-uri"
                      placeholder="wc:..."
                      value={wcUri}
                      onChange={(e) => {
                        const value = e.target.value
                        setWcUri(value)
                        setError("")
                        
                        // Clear previous timeout
                        if (connectTimeoutRef.current) {
                          clearTimeout(connectTimeoutRef.current)
                        }
                        
                        // Auto-connect on paste/input with debounce
                        if (value.trim().startsWith('wc:') && activeAccount && initStatus === "ready") {
                          connectTimeoutRef.current = setTimeout(() => {
                            handleConnect(value)
                          }, 500)
                        }
                      }}
                      onPaste={(e) => {
                        const pastedText = e.clipboardData.getData('text')
                        if (pastedText.trim().startsWith('wc:') && activeAccount && initStatus === "ready") {
                          // Clear previous timeout
                          if (connectTimeoutRef.current) {
                            clearTimeout(connectTimeoutRef.current)
                          }
                          // Connect immediately on paste
                          setTimeout(() => {
                            handleConnect(pastedText)
                          }, 300)
                        }
                      }}
                      className="font-mono text-sm border-[3px] border-foreground"
                      disabled={isConnecting || initStatus !== "ready"}
                    />
                    {error && (
                      <p className="font-mono text-xs text-[#ff3333] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => setShowQrScanner(true)}
                    disabled={isConnecting || initStatus !== "ready"}
                    className="px-4 bg-primary text-primary-foreground border-[3px] border-foreground font-mono uppercase hover:bg-primary/90"
                    title="Scan QR Code"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                {initStatus === "initializing" && (
                  <p className="font-mono text-xs text-[#ffff00]">Connecting to relay server...</p>
                )}
              </div>

              {sessionCount > 0 && (
                <div className="space-y-3 pt-4 border-t-[3px] border-foreground">
                  <Label className="font-mono uppercase text-xs font-black">ACTIVE SESSIONS</Label>
                  <ScrollArea className="h-50">
                    <div className="space-y-3">
                      {Object.values(sessions).map((session) => (
                        <div
                          key={session.topic}
                          className="flex items-start gap-3 p-4 border-[3px] border-foreground shadow-brutal-sm bg-background"
                        >
                          <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-green-500">
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
                            <div className="flex items-center gap-2">
                              <div className="font-mono font-black text-sm uppercase">{session.peerMetadata.name}</div>
                              {session.verifyContext && (
                                <Badge 
                                  className={`text-[10px] border-2 border-foreground px-1.5 py-0.5 ${
                                    session.verifyContext.verified.isScam 
                                      ? "bg-[#ff3333] text-white" 
                                      : session.verifyContext.verified.validation === "VALID"
                                      ? "bg-[#00ff00] text-black"
                                      : "bg-[#ffaa00] text-black"
                                  }`}
                                >
                                  {session.verifyContext.verified.isScam 
                                    ? "🚫 SCAM" 
                                    : session.verifyContext.verified.validation === "VALID"
                                    ? "✓"
                                    : "⚠️"}
                                </Badge>
                              )}
                            </div>
                            <p className="font-mono text-xs truncate text-muted-foreground">
                              {session.peerMetadata.url}
                            </p>
                            {(session.lastActivity || session.requestCount !== undefined) && (
                              <p className="font-mono text-[10px] text-muted-foreground mt-1">
                                {session.requestCount !== undefined && `${session.requestCount} requests`}
                                {session.lastActivity && ` • Active ${formatTimeAgo(session.lastActivity)}`}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="text-xs border-2 border-foreground bg-[#00ff00] text-black font-mono">
                                CONNECTED
                              </Badge>
                              {session.connectedAt && (
                                <Badge variant="outline" className="text-[10px] font-mono border-foreground/50">
                                  {formatSessionDuration(session.connectedAt)}
                                </Badge>
                              )}
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
                  {sessionCount > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnectAll}
                      className="w-full mt-2 border-2 border-foreground font-mono uppercase hover:bg-[#ff3333] hover:text-white"
                    >
                      <Unlink className="h-3 w-3 mr-2" />
                      Disconnect All ({sessionCount})
                    </Button>
                  )}
                </div>
              )}

              {sessionCount === 0 && !error && initStatus === "ready" && (
                <div className="flex flex-col items-center justify-center py-8 text-center border-[3px] border-dashed border-foreground">
                  <Scan className="h-12 w-12 mb-4" />
                  <p className="font-mono text-sm uppercase font-black">NO ACTIVE CONNECTIONS</p>
                  <p className="font-mono text-xs mt-1 text-muted-foreground">PASTE A WC URI TO CONNECT</p>
                </div>
              )}
              
              {requestLogs.length > 0 && (
                <div className="space-y-3 pt-4 border-t-[3px] border-foreground mt-6">
                  <Label className="font-mono uppercase text-xs font-black">REQUEST HISTORY (TEMPORARY)</Label>
                  <ScrollArea className="h-75">
                    <div className="space-y-2">
                      {requestLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 border-2 border-foreground bg-background text-xs font-mono"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={`text-xs border-2 border-foreground ${
                                  log.status === "approved" 
                                    ? "bg-[#00ff00] text-black" 
                                    : log.status === "rejected"
                                    ? "bg-[#ff3333] text-white"
                                    : "bg-[#ffff00] text-black"
                                }`}
                              >
                                {log.status.toUpperCase()}
                              </Badge>
                              <span className="font-bold uppercase">{log.method}</span>
                            </div>
                            <span className="text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {log.result && (
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-[10px] text-muted-foreground truncate flex-1">
                                Result: {typeof log.result === 'string' ? `${log.result.slice(0, 30)}...` : 'Object'}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1.5"
                                onClick={() => copyLogResult(log.id, typeof log.result === 'string' ? log.result : JSON.stringify(log.result))}
                              >
                                {copiedLogId === log.id ? (
                                  <Check className="h-3 w-3 text-[#00ff00]" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                          <details className="cursor-pointer">
                            <summary className="text-muted-foreground hover:text-foreground">View details...</summary>
                            <pre className="mt-2 p-2 bg-muted overflow-auto max-h-37.5 text-[10px]">
                              {JSON.stringify(log.params, null, 2)}
                            </pre>
                          </details>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportLogsAsJson}
                      className="flex-1 border-2 border-foreground font-mono uppercase"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRequestLogs([])}
                      className="flex-1 border-2 border-foreground font-mono uppercase"
                    >
                      Clear History
                    </Button>
                  </div>
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
                <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center bg-background">
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
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-black uppercase">{pendingProposal.params.proposer.metadata.name}</div>
                    {pendingProposal.verifyContext && (
                      <Badge 
                        className={`text-[10px] border-2 border-foreground px-1.5 py-0.5 ${
                          pendingProposal.verifyContext.verified.isScam 
                            ? "bg-[#ff3333] text-white" 
                            : pendingProposal.verifyContext.verified.validation === "VALID"
                            ? "bg-[#00ff00] text-black"
                            : "bg-[#ffaa00] text-black"
                        }`}
                      >
                        {pendingProposal.verifyContext.verified.isScam 
                          ? "🚫 SCAM WARNING" 
                          : pendingProposal.verifyContext.verified.validation === "VALID"
                          ? "✓ VERIFIED"
                          : "⚠️ UNVERIFIED"}
                      </Badge>
                    )}
                  </div>
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

              {pendingProposal.verifyContext?.verified.isScam && (
                <Alert className="border-[3px] border-foreground bg-[#ff3333]/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-xs font-black">
                    ⚠️ WARNING: THIS SITE MAY BE A SCAM! WE STRONGLY RECOMMEND REJECTING THIS CONNECTION.
                  </AlertDescription>
                </Alert>
              )}

              {pendingProposal.verifyContext?.verified.validation === "UNKNOWN" && (
                <Alert className="border-[3px] border-foreground bg-[#ffaa00]/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-xs">
                    ⚠️ THIS APP IS NOT VERIFIED. MAKE SURE YOU TRUST IT BEFORE CONNECTING.
                  </AlertDescription>
                </Alert>
              )}

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

              {/* Human-readable description */}
              {pendingRequest.humanReadable && (
                <div className="p-4 border-[3px] border-foreground bg-gradient-to-br from-[#00ff00]/20 to-[#00ffff]/20">
                  <div className="font-mono text-sm font-black">{pendingRequest.humanReadable}</div>
                </div>
              )}

              {/* Verification badge for the requesting dApp */}
              {pendingRequest.verifyContext && (
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`text-xs border-2 border-foreground ${
                      pendingRequest.verifyContext.verified.isScam 
                        ? "bg-[#ff3333] text-white" 
                        : pendingRequest.verifyContext.verified.validation === "VALID"
                        ? "bg-[#00ff00] text-black"
                        : "bg-[#ffaa00] text-black"
                    }`}
                  >
                    {pendingRequest.verifyContext.verified.isScam 
                      ? "🚫 SCAM WARNING" 
                      : pendingRequest.verifyContext.verified.validation === "VALID"
                      ? "✓ VERIFIED APP"
                      : "⚠️ UNVERIFIED APP"}
                  </Badge>
                  {pendingRequest.verifyContext.verified.origin && (
                    <span className="font-mono text-xs text-muted-foreground">
                      from {pendingRequest.verifyContext.verified.origin}
                    </span>
                  )}
                </div>
              )}

              <div className="p-4 border-3 border-foreground bg-muted font-mono text-xs overflow-auto max-h-50">
                <pre className="whitespace-pre-wrap break-all">{formatRequestParams(pendingRequest)}</pre>
              </div>

              {/* Data Verifier for detailed inspection */}
              {pendingRequest && (
                <DataVerifier
                  data={pendingRequest.method === "eth_sendTransaction" 
                    ? pendingRequest.params[0]
                    : pendingRequest.method === "eth_signTypedData_v4" || pendingRequest.method === "eth_signTypedData"
                    ? JSON.parse(pendingRequest.params[1])
                    : { 
                        method: pendingRequest.method,
                        params: pendingRequest.params 
                      }
                  }
                  title={`${pendingRequest.method} - Detailed View`}
                />
              )}

              {pendingRequest.verifyContext?.verified.isScam && (
                <Alert className="border-[3px] border-foreground bg-[#ff3333]/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-xs font-black">
                    ⚠️ DANGER: REQUEST FROM SUSPECTED SCAM SITE! WE STRONGLY RECOMMEND REJECTING.
                  </AlertDescription>
                </Alert>
              )}

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
                {pendingRequest?.method === "eth_sendTransaction" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (pendingRequest?.params?.[0]) {
                        const tx = pendingRequest.params[0]
                        setSimulatorTransaction({
                          to: tx.to,
                          from: tx.from || activeAccount?.address,
                          value: tx.value || "0",
                          data: tx.data,
                          gasLimit: tx.gas || tx.gasLimit,
                        })
                        setShowTransactionSimulator(true)
                      }
                    }}
                    disabled={isProcessing || isWatchOnly}
                    className="flex-1 bg-blue-500/10 border-[3px] border-blue-500 font-mono uppercase hover:bg-blue-500/20 text-blue-500"
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    SIMULATE
                  </Button>
                )}
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

      {/* QR Scanner Dialog */}
      <Dialog open={showQrScanner} onOpenChange={setShowQrScanner}>
        <DialogContent className="max-w-md border-[3px] border-foreground shadow-brutal bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono uppercase font-black">
              <Camera className="h-5 w-5" />
              SCAN QR CODE
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Point your camera at a WalletConnect QR code
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative aspect-square border-[3px] border-foreground overflow-hidden bg-black">
              {showQrScanner && (
                <QrScanner
                  delay={300}
                  onError={handleQrError}
                  onScan={handleQrScan}
                  style={{ width: "100%" }}
                  constraints={{
                    video: { facingMode: "environment" }
                  }}
                />
              )}
            </div>

            <Alert className="border-[3px] border-foreground bg-primary/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">
                📷 Make sure to allow camera access when prompted
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              onClick={() => setShowQrScanner(false)}
              className="w-full border-[3px] border-foreground font-mono uppercase hover:bg-muted"
            >
              <X className="h-4 w-4 mr-2" />
              CANCEL
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Simulator for WalletConnect Requests */}
      <TransactionSimulator
        open={showTransactionSimulator}
        onOpenChange={setShowTransactionSimulator}
        transaction={simulatorTransaction}
        chainId={chainId}
        fromAddress={activeAccount?.address || ""}
        onProceed={() => {
          setShowTransactionSimulator(false)
          setSimulatorTransaction(null)
          // Continue with the approval flow
          handleRequestApprove()
        }}
        onCancel={() => {
          setShowTransactionSimulator(false)
          setSimulatorTransaction(null)
        }}
      />
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
