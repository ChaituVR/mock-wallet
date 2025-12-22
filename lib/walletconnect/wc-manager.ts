"use client"

import { Core } from "@walletconnect/core"
import { WalletKit, type WalletKitTypes } from "@reown/walletkit"
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils"
import { ethers } from "ethers"

export type VerifyContext = {
  verified: {
    isScam?: boolean
    origin?: string
    validation: 'VALID' | 'INVALID' | 'UNKNOWN'
  }
}

export interface WCSession {
  topic: string
  peerMetadata: {
    name: string
    description: string
    url: string
    icons: string[]
  }
  namespaces: any
  connectedAt: number
  verifyContext?: VerifyContext
  lastActivity?: number
  requestCount?: number
}

export interface WCProposal {
  id: number
  params: WalletKitTypes.SessionProposal["params"]
  verifyContext?: VerifyContext
}

export interface WCRequest {
  id: number
  topic: string
  method: string
  params: any
  chainId: string
  verifyContext?: VerifyContext
  humanReadable?: string
  decodedData?: any
}

// Parse WalletConnect URI to extract connection info
export function parseWCUri(uri: string): { version: number; topic: string; relay: string; key: string } | null {
  try {
    if (!uri.startsWith("wc:")) return null

    const withoutPrefix = uri.slice(3)
    const [topicPart, paramsPart] = withoutPrefix.split("?")
    const topic = topicPart.split("@")[0]
    const version = Number.parseInt(topicPart.split("@")[1] || "2")

    const params = new URLSearchParams(paramsPart)
    const relay = params.get("relay-protocol") || "irn"
    const key = params.get("symKey") || ""

    return { version, topic, relay, key }
  } catch {
    return null
  }
}

type EventCallback = (...args: any[]) => void

export class WalletConnectManager {
  private static instance: WalletConnectManager
  private walletKit: InstanceType<typeof WalletKit> | null = null
  private core: InstanceType<typeof Core> | null = null
  private projectId = ""
  private isInitialized = false
  private isInitializing = false
  private initPromise: Promise<void> | null = null
  private listeners: Map<string, Set<EventCallback>> = new Map()
  private pendingRequests: Map<number, WCRequest> = new Map()

  static getInstance(): WalletConnectManager {
    if (!WalletConnectManager.instance) {
      WalletConnectManager.instance = new WalletConnectManager()
    }
    return WalletConnectManager.instance
  }

  async initialize(projectId: string): Promise<void> {
    if (this.initPromise && this.projectId === projectId) {
      return this.initPromise
    }

    if (this.isInitialized && this.projectId === projectId) {
      return
    }

    if (this.isInitialized && this.projectId !== projectId) {
      this.isInitialized = false
      this.walletKit = null
      this.core = null
    }

    this.projectId = projectId
    this.isInitializing = true

    this.initPromise = this._doInitialize(projectId)

    try {
      await this.initPromise
    } finally {
      this.isInitializing = false
    }
  }

  private async _doInitialize(projectId: string): Promise<void> {
    try {
      console.log("[v0] Initializing WalletKit with projectId:", projectId.substring(0, 8) + "...")

      this.core = new Core({
        projectId,
      })

      console.log("[v0] Core created, initializing WalletKit...")

      // Initialize WalletKit - this handles relay connection internally
      this.walletKit = await WalletKit.init({
        core: this.core,
        metadata: {
          name: "Reown Dev Wallet",
          description: "Developer Test Wallet for Web3 dApps",
          url: typeof window !== "undefined" ? window.location.origin : "https://reown-dev-wallet.vercel.app",
          icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
      })

      console.log("[v0] WalletKit instance created")

      // Set up event listeners
      this.setupEventListeners()

      this.isInitialized = true
      console.log("[v0] WalletKit fully initialized")
    } catch (error) {
      console.error("[v0] WalletKit initialization error:", error)
      this.initPromise = null
      throw error
    }
  }

  private setupEventListeners(): void {
    if (!this.walletKit) return

    // Session proposal event
    this.walletKit.on("session_proposal", (proposal: WalletKitTypes.SessionProposal) => {
      console.log("[v0] Session proposal received:", proposal)
      
      // Extract verification context if available
      const verifyContext = (proposal as any).verifyContext as VerifyContext | undefined
      
      const wcProposal: WCProposal = {
        id: proposal.id,
        params: proposal.params,
        verifyContext
      }
      this.emit("session_proposal", wcProposal)
    })

    // Session request event (for signing, transactions, etc.)
    this.walletKit.on("session_request", (request: WalletKitTypes.SessionRequest) => {
      console.log("[v0] Session request received:", request)
      
      // Extract verification context if available
      const verifyContext = (request as any).verifyContext as VerifyContext | undefined
      
      // Generate human-readable description
      const humanReadable = this.getHumanReadableDescription(request.params.request.method, request.params.request.params)
      
      const wcRequest: WCRequest = {
        id: request.id,
        topic: request.topic,
        method: request.params.request.method,
        params: request.params.request.params,
        chainId: request.params.chainId,
        verifyContext,
        humanReadable,
      }
      this.pendingRequests.set(request.id, wcRequest)
      
      // Update session activity
      this.updateSessionActivity(request.topic)
      
      this.emit("session_request", wcRequest)
    })

    // Session delete event
    this.walletKit.on("session_delete", (event: { topic: string }) => {
      console.log("[v0] Session deleted:", event)
      this.emit("session_delete", event)
    })
  }

  async pair(uri: string): Promise<void> {
    if (!this.isInitialized) {
      if (this.initPromise) {
        console.log("[v0] Waiting for initialization to complete before pairing...")
        await this.initPromise
      } else {
        throw new Error("WalletKit not initialized. Please set your Project ID first.")
      }
    }

    if (!this.walletKit) {
      throw new Error("WalletKit not initialized")
    }

    const parsed = parseWCUri(uri)
    if (!parsed) {
      throw new Error("Invalid WalletConnect URI format. Must start with 'wc:'")
    }

    console.log("[v0] Pairing with URI topic:", parsed.topic)

    try {
      let lastError: Error | null = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log("[v0] Pairing attempt", attempt)
          await this.walletKit.pair({ uri })
          console.log("[v0] Pairing successful, waiting for session proposal...")
          return
        } catch (error) {
          lastError = error as Error
          console.error(`[v0] Pairing attempt ${attempt} failed:`, error)
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
          }
        }
      }
      throw lastError || new Error("Failed to pair after 3 attempts")
    } catch (error) {
      console.error("[v0] Pairing error:", error)
      throw error
    }
  }

  async approveSession(proposal: WCProposal, account: string, chainId: number): Promise<void> {
    if (!this.walletKit) {
      throw new Error("WalletKit not initialized")
    }

    try {
      // Build approved namespaces using the utility
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces: {
          eip155: {
            chains: [
              `eip155:${chainId}`,
              "eip155:1",
              "eip155:11155111",
              "eip155:137",
              "eip155:80002",
              "eip155:8453",
              "eip155:84532",
              "eip155:42161",
              "eip155:421614",
              "eip155:10",
              "eip155:11155420",
            ],
            methods: [
              "eth_sendTransaction",
              "eth_signTransaction",
              "eth_sign",
              "personal_sign",
              "eth_signTypedData",
              "eth_signTypedData_v3",
              "eth_signTypedData_v4",
              "wallet_switchEthereumChain",
              "wallet_addEthereumChain",
            ],
            events: ["chainChanged", "accountsChanged"],
            accounts: [
              `eip155:${chainId}:${account}`,
              `eip155:1:${account}`,
              `eip155:11155111:${account}`,
              `eip155:137:${account}`,
              `eip155:80002:${account}`,
              `eip155:8453:${account}`,
              `eip155:84532:${account}`,
              `eip155:42161:${account}`,
              `eip155:421614:${account}`,
              `eip155:10:${account}`,
              `eip155:11155420:${account}`,
            ],
          },
        },
      })

      console.log("[v0] Approving session with namespaces:", approvedNamespaces)

      const session = await this.walletKit.approveSession({
        id: proposal.id,
        namespaces: approvedNamespaces,
      })

      console.log("[v0] Session approved:", session)
      this.emit("session_update", session)
    } catch (error) {
      console.error("[v0] Session approval error:", error)
      throw error
    }
  }

  async rejectSession(proposalId: number): Promise<void> {
    if (!this.walletKit) {
      throw new Error("WalletKit not initialized")
    }

    try {
      await this.walletKit.rejectSession({
        id: proposalId,
        reason: getSdkError("USER_REJECTED"),
      })
      console.log("[v0] Session rejected")
      this.emit("session_rejected", { id: proposalId })
    } catch (error) {
      console.error("[v0] Session rejection error:", error)
      throw error
    }
  }

  async respondToRequest(
    requestId: number,
    response: { result?: any; error?: { code: number; message: string } },
  ): Promise<void> {
    if (!this.walletKit) {
      throw new Error("WalletKit not initialized")
    }

    const request = this.pendingRequests.get(requestId)
    if (!request) {
      throw new Error("Request not found")
    }

    try {
      if (response.error) {
        await this.walletKit.respondSessionRequest({
          topic: request.topic,
          response: {
            id: requestId,
            jsonrpc: "2.0",
            error: response.error,
          },
        })
      } else {
        await this.walletKit.respondSessionRequest({
          topic: request.topic,
          response: {
            id: requestId,
            jsonrpc: "2.0",
            result: response.result,
          },
        })
      }

      this.pendingRequests.delete(requestId)
      console.log("[v0] Request response sent")
    } catch (error) {
      console.error("[v0] Response error:", error)
      throw error
    }
  }

  async signMessage(message: string, privateKey: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey)
    return wallet.signMessage(message)
  }

  async signTypedData(domain: any, types: any, value: any, privateKey: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey)
    return wallet.signTypedData(domain, types, value)
  }

  async sendTransaction(tx: any, privateKey: string, rpcUrl: string): Promise<string> {
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(privateKey, provider)
    const transaction = await wallet.sendTransaction(tx)
    return transaction.hash
  }

  async disconnectSession(topic: string): Promise<void> {
    if (!this.walletKit) {
      throw new Error("WalletKit not initialized")
    }

    try {
      await this.walletKit.disconnectSession({
        topic,
        reason: getSdkError("USER_DISCONNECTED"),
      })
      console.log("[v0] Session disconnected")
      this.emit("session_delete", { topic })
    } catch (error) {
      console.error("[v0] Disconnect error:", error)
      throw error
    }
  }

  getActiveSessions(): Record<string, WCSession> {
    if (!this.walletKit) return {}

    try {
      const sessions = this.walletKit.getActiveSessions()
      const result: Record<string, WCSession> = {}

      Object.entries(sessions).forEach(([topic, session]) => {
        result[topic] = {
          topic,
          peerMetadata: session.peer.metadata,
          namespaces: session.namespaces,
          connectedAt: Date.now(),
        }
      })

      return result
    } catch (error) {
      console.error("[v0] Get sessions error:", error)
      return {}
    }
  }

  async updateSessionAccount(newAccount: string, chainId: number): Promise<void> {
    if (!this.walletKit) {
      throw new Error("WalletKit not initialized")
    }

    try {
      const sessions = this.walletKit.getActiveSessions()
      
      for (const [topic, session] of Object.entries(sessions)) {
        console.log("[v0] Updating session account for topic:", topic)
        
        // Update the session with new account
        const updatedNamespaces = {
          ...session.namespaces,
          eip155: {
            ...session.namespaces.eip155,
            accounts: [
              `eip155:${chainId}:${newAccount}`,
              `eip155:1:${newAccount}`,
              `eip155:11155111:${newAccount}`,
              `eip155:137:${newAccount}`,
              `eip155:80002:${newAccount}`,
              `eip155:8453:${newAccount}`,
              `eip155:84532:${newAccount}`,
              `eip155:42161:${newAccount}`,
              `eip155:421614:${newAccount}`,
              `eip155:10:${newAccount}`,
              `eip155:11155420:${newAccount}`,
            ],
          },
        }

        await this.walletKit.updateSession({
          topic,
          namespaces: updatedNamespaces,
        })

        // Emit accountsChanged event
        await this.walletKit.emitSessionEvent({
          topic,
          event: {
            name: "accountsChanged",
            data: [newAccount],
          },
          chainId: `eip155:${chainId}`,
        })

        console.log("[v0] Session updated with new account:", newAccount)
      }
      
      this.emit("session_update", { account: newAccount, chainId })
    } catch (error) {
      console.error("[v0] Update session account error:", error)
      throw error
    }
  }

  getPendingRequests(): WCRequest[] {
    return Array.from(this.pendingRequests.values())
  }

  private getHumanReadableDescription(method: string, params: any): string {
    switch (method) {
      case 'personal_sign':
        return `🖊️ Sign a message to prove it's really you`
      case 'eth_sign':
        return `✍️ Sign some data (be careful with this!)`
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        return `📝 Sign structured data (like a form)`
      case 'eth_sendTransaction':
        return `💸 Send a transaction (spending money!)`
      case 'eth_signTransaction':
        return `📋 Sign a transaction (not sending yet)`
      case 'wallet_switchEthereumChain':
        return `🔄 Switch to a different blockchain network`
      case 'wallet_addEthereumChain':
        return `➕ Add a new blockchain network`
      case 'wallet_watchAsset':
        return `👀 Add a token to your wallet`
      default:
        return `🔧 ${method.replace('_', ' ').replace('eth', 'Ethereum')}`
    }
  }

  private updateSessionActivity(topic: string): void {
    if (!this.walletKit) return
    const sessions = this.walletKit.getActiveSessions()
    if (sessions[topic]) {
      // Store activity tracking in memory (would be better in storage for persistence)
      const session = sessions[topic] as any
      session.lastActivity = Date.now()
      session.requestCount = (session.requestCount || 0) + 1
    }
  }

  getSessionDetails(topic: string): WCSession | null {
    if (!this.walletKit) return null
    const sessions = this.walletKit.getActiveSessions()
    const session = sessions[topic]
    if (!session) return null

    return {
      topic: session.topic,
      peerMetadata: session.peer.metadata,
      namespaces: session.namespaces,
      connectedAt: (session as any).connectedAt || Date.now(),
      lastActivity: (session as any).lastActivity,
      requestCount: (session as any).requestCount || 0,
    }
  }

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((cb) => cb(data))
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getProjectId(): string {
    return this.projectId
  }

  // Emit accountsChanged event to all connected sessions
  async emitAccountsChanged(accounts: string[]): Promise<void> {
    const sessions = this.getActiveSessions()
    
    for (const [topic, session] of Object.entries(sessions)) {
      try {
        const chainId = `eip155:${session.requiredNamespaces?.eip155?.chains?.[0]?.split(':')[1] || '1'}`
        
        await this.web3wallet.emitSessionEvent({
          topic,
          event: {
            name: 'accountsChanged',
            data: accounts
          },
          chainId
        })
        
        console.log(`[WalletConnect] Emitted accountsChanged to ${session.peerMetadata.name}`)
      } catch (error) {
        console.error(`[WalletConnect] Failed to emit accountsChanged to ${topic}:`, error)
      }
    }
  }

  // Emit chainChanged event to all connected sessions
  async emitChainChanged(chainId: number): Promise<void> {
    const sessions = this.getActiveSessions()
    
    for (const [topic, session] of Object.entries(sessions)) {
      try {
        const chainIdStr = `eip155:${chainId}`
        
        await this.web3wallet.emitSessionEvent({
          topic,
          event: {
            name: 'chainChanged',
            data: chainId
          },
          chainId: chainIdStr
        })
        
        console.log(`[WalletConnect] Emitted chainChanged (${chainId}) to ${session.peerMetadata.name}`)
      } catch (error) {
        console.error(`[WalletConnect] Failed to emit chainChanged to ${topic}:`, error)
      }
    }
  }
}
