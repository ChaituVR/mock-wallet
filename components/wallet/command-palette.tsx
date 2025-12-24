"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Send,
  Copy,
  RefreshCw,
  Network,
  Users,
  Link2,
  Droplet,
  Download,
  History,
  ExternalLink,
  Sparkles,
  Command,
  ArrowRight,
  MessageSquarePlus,
} from "lucide-react"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { SUPPORTED_CHAINS, getChainById } from "@/lib/wallet/chain-config"

interface Command {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  keywords: string[]
  action: () => void
  category: "action" | "chain" | "account" | "navigation"
  shortcut?: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { activeAccount, chainId, switchChain, accounts, switchAccount, refreshBalance } = useWallet()

  // Expose setOpen for external triggers (mobile button)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).openCommandPalette = () => setOpen(true)
    }
  }, [])

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === "?" && !open) {
        e.preventDefault()
        setOpen(true)
        setSearch("help")
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  // Clear search when opening
  useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  const copyAddress = useCallback(async () => {
    if (activeAccount?.address) {
      await navigator.clipboard.writeText(activeAccount.address)
      toast({
        title: "✓ Address Copied",
        description: `${activeAccount.address.slice(0, 10)}...${activeAccount.address.slice(-8)}`,
        variant: "success",
      })
      setOpen(false)
    }
  }, [activeAccount])

  const openSendDialog = useCallback(() => {
    setOpen(false)
    // Trigger send dialog
    document.querySelector<HTMLButtonElement>('[data-action="send"]')?.click()
  }, [])

  const openHistoryDialog = useCallback(() => {
    setOpen(false)
    document.querySelector<HTMLButtonElement>('[data-action="history"]')?.click()
  }, [])

  const openFaucet = useCallback(() => {
    setOpen(false)
    if (typeof window !== 'undefined') {
      ;(window as any).setActiveTab?.("faucet")
    }
  }, [])

  const openWalletConnect = useCallback(() => {
    setOpen(false)
    if (typeof window !== 'undefined') {
      ;(window as any).setActiveTab?.("walletconnect")
    }
  }, [])

  const openAccounts = useCallback(() => {
    setOpen(false)
    if (typeof window !== 'undefined') {
      ;(window as any).setActiveTab?.("accounts")
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setOpen(false)
    await refreshBalance()
  }, [refreshBalance])

  const openExplorer = useCallback(() => {
    if (activeAccount) {
      const chain = getChainById(chainId)
      if (chain) {
        window.open(`${chain.blockExplorers.default.url}/address/${activeAccount.address}`, "_blank")
      }
      setOpen(false)
    }
  }, [activeAccount, chainId])

  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [
      // Quick actions
      {
        id: "send",
        label: "Send Transaction",
        description: "Send ETH or tokens to an address",
        icon: Send,
        keywords: ["send", "transfer", "tx", "transaction"],
        action: openSendDialog,
        category: "action",
        shortcut: "⌘S",
      },
      {
        id: "receive",
        label: "Receive Funds",
        description: "Show QR code to receive funds",
        icon: Download,
        keywords: ["receive", "qr", "code", "deposit", "here"],
        action: () => {
          if (typeof window !== 'undefined' && (window as any).openReceiveDialog) {
            (window as any).openReceiveDialog()
          }
          setOpen(false)
        },
        category: "action",
        shortcut: "⌘H",
      },
      {
        id: "copy",
        label: "Copy Address",
        description: `Copy ${activeAccount?.address.slice(0, 10)}... to clipboard`,
        icon: Copy,
        keywords: ["copy", "address", "clipboard"],
        action: copyAddress,
        category: "action",
        shortcut: "⌘C",
      },
      {
        id: "refresh",
        label: "Refresh Balance",
        description: "Update balance and tokens",
        icon: RefreshCw,
        keywords: ["refresh", "reload", "update", "balance"],
        action: handleRefresh,
        category: "action",
        shortcut: "⌘R",
      },
      {
        id: "history",
        label: "Transaction History",
        description: "View all past transactions",
        icon: History,
        keywords: ["history", "transactions", "tx", "past"],
        action: openHistoryDialog,
        category: "navigation",
      },
      {
        id: "faucet",
        label: "Get Testnet ETH",
        description: "Claim testnet ETH from faucet",
        icon: Droplet,
        keywords: ["faucet", "testnet", "eth", "claim", "get"],
        action: openFaucet,
        category: "action",
      },
      {
        id: "walletconnect",
        label: "Connect WalletConnect",
        description: "Connect to a dApp via WalletConnect",
        icon: Link2,
        keywords: ["walletconnect", "wc", "connect", "dapp", "pairing"],
        action: openWalletConnect,
        category: "navigation",
      },
      {
        id: "accounts",
        label: "Manage Accounts",
        description: "View and switch accounts",
        icon: Users,
        keywords: ["accounts", "wallets", "manage", "switch"],
        action: openAccounts,
        category: "navigation",
      },
      {
        id: "explorer",
        label: "View on Explorer",
        description: "Open current address in block explorer",
        icon: ExternalLink,
        keywords: ["explorer", "etherscan", "view", "external"],
        action: openExplorer,
        category: "action",
      },
      {
        id: "feedback",
        label: "Send Feedback",
        description: "Request a feature or report an issue",
        icon: MessageSquarePlus,
        keywords: ["feedback", "feature", "request", "bug", "issue", "report", "suggest"],
        action: () => {
          window.open('https://tally.so/r/jabg9R', '_blank')
          setOpen(false)
        },
        category: "navigation",
      },
    ]

    // Add chain switching commands
    SUPPORTED_CHAINS.forEach((chain) => {
      cmds.push({
        id: `chain-${chain.chainId}`,
        label: `Switch to ${chain.name}`,
        description: chain.testnet ? "Testnet" : "Mainnet",
        icon: Network,
        keywords: ["switch", "chain", "network", chain.name.toLowerCase()],
        action: async () => {
          await switchChain(chain.chainId)
          setOpen(false)
        },
        category: "chain",
      })
    })

    // Add account switching commands
    accounts.forEach((account, index) => {
      const accountLabel = account.label || `Account ${index + 1}`
      cmds.push({
        id: `account-${index}`,
        label: `Switch to ${accountLabel}`,
        description: `${account.address.slice(0, 10)}...${account.address.slice(-8)}`,
        icon: Users,
        keywords: ["switch", "account", "wallet", accountLabel.toLowerCase()],
        action: async () => {
          await switchAccount(index)
          setOpen(false)
        },
        category: "account",
        shortcut: index < 9 ? `⌘${index + 1}` : undefined,
      })
    })

    return cmds
  }, [
    activeAccount,
    chainId,
    accounts,
    copyAddress,
    openSendDialog,
    openHistoryDialog,
    openFaucet,
    openWalletConnect,
    openAccounts,
    handleRefresh,
    openExplorer,
    switchChain,
    switchAccount,
  ])

  const filteredCommands = useMemo(() => {
    if (!search) return commands

    const searchLower = search.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(searchLower) ||
        cmd.description.toLowerCase().includes(searchLower) ||
        cmd.keywords.some((kw) => kw.includes(searchLower))
    )
  }, [commands, search])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {
      action: [],
      chain: [],
      account: [],
      navigation: [],
    }

    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd)
    })

    return groups
  }, [filteredCommands])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "action":
        return "Quick Actions"
      case "chain":
        return "Switch Chain"
      case "account":
        return "Switch Account"
      case "navigation":
        return "Navigation"
      default:
        return category
    }
  }

  const currentChain = getChainById(chainId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="brutalist-border max-w-2xl sm:max-w-2xl w-[calc(100vw-2rem)] sm:w-full p-0 gap-0 overflow-hidden max-h-[85vh] sm:max-h-[600px]">
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b-2 border-border bg-gradient-to-r from-card to-primary/5">
          <Command className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="border-0 focus-visible:ring-0 font-mono text-sm sm:text-base"
            autoFocus
          />
          <Badge variant="outline" className="border-2 border-black font-black text-[10px] sm:text-xs shrink-0 hidden sm:inline-flex">
            ⌘K
          </Badge>
        </div>

        <div className="max-h-[calc(85vh-120px)] sm:max-h-[500px] overflow-y-auto p-2">
          {search === "help" ? (
            <div className="p-4 space-y-4">\n              <h3 className="font-black uppercase text-sm">Keyboard Shortcuts</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span>Open command palette</span>
                  <Badge variant="outline" className="border-2 border-black font-black">⌘K</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Send transaction</span>
                  <Badge variant="outline" className="border-2 border-black font-black">⌘S</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Copy address</span>
                  <Badge variant="outline" className="border-2 border-black font-black">⌘C</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Refresh balance</span>
                  <Badge variant="outline" className="border-2 border-black font-black">⌘R</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Switch account (1-9)</span>
                  <Badge variant="outline" className="border-2 border-black font-black">⌘1-9</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Show help</span>
                  <Badge variant="outline" className="border-2 border-black font-black">?</Badge>
                </div>
              </div>
            </div>
          ) : filteredCommands.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-mono text-muted-foreground">No commands found</p>
              <p className="text-xs font-mono text-muted-foreground mt-2">Try "send", "switch", or "copy"</p>
            </div>
          ) : (
            <div className="space-y-4 p-2">
              {Object.entries(groupedCommands).map(([category, cmds]) =>
                cmds.length > 0 ? (
                  <div key={category}>
                    <h3 className="text-xs font-black uppercase text-muted-foreground px-3 py-2">
                      {getCategoryLabel(category)}
                    </h3>
                    <div className="space-y-1">
                      {cmds.map((cmd) => {
                        const Icon = cmd.icon
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            className="w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-primary/10 active:bg-primary/20 border-2 border-transparent hover:border-primary transition-all group touch-manipulation"
                          >
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 flex items-center justify-center border-2 border-black group-hover:bg-primary group-active:scale-95 transition-all shrink-0">
                              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-primary-foreground" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-black uppercase text-xs sm:text-sm truncate">{cmd.label}</div>
                              <div className="text-[10px] sm:text-xs font-mono text-muted-foreground truncate">
                                {cmd.description}
                              </div>
                            </div>
                            {cmd.shortcut && (
                              <Badge variant="outline" className="border-2 border-black font-black text-[10px] sm:text-xs shrink-0 hidden sm:inline-flex">
                                {cmd.shortcut}
                              </Badge>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>

        <div className="border-t-2 border-border p-3 bg-muted/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              <span className="font-black">{currentChain?.name}</span> · {activeAccount?.label || 'Account'}
            </span>
          </div>
          <span className="text-muted-foreground">Press <span className="font-black">?</span> for shortcuts</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
