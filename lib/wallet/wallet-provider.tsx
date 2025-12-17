"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { WalletManager, type WalletAccount } from "./wallet-manager"
import { getChainRpcUrl } from "./chain-config"
import { useSearchParams } from "next/navigation"

interface WalletContextType {
  accounts: WalletAccount[]
  activeAccount: WalletAccount | null
  activeAccountIndex: number
  balance: string
  chainId: number
  isConnected: boolean
  projectId: string
  agentMode: boolean
  setAgentMode: (enabled: boolean) => void
  createNewWallet: () => void
  importWallet: (privateKeyOrMnemonicOrAddress: string) => void
  addWallet: (privateKeyOrMnemonicOrAddress: string) => void
  addAccountFromSeed: () => void
  switchAccount: (index: number) => Promise<void>
  reorderAccounts: (newOrder: WalletAccount[]) => void
  disconnectWallet: () => void
  switchChain: (chainId: number) => Promise<void>
  setProjectId: (id: string) => void
  getProvider: () => ethers.JsonRpcProvider | null
  refreshBalance: () => Promise<void>
  getAccountBalance: (address: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

function WalletProviderInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<WalletAccount[]>([])
  const [activeAccountIndex, setActiveAccountIndex] = useState(0)
  const [balance, setBalance] = useState("0.0")
  const [chainId, setChainId] = useState(11155111)
  const [projectId, setProjectIdState] = useState("")
  const [hasCheckedUrl, setHasCheckedUrl] = useState(false)
  const [agentMode, setAgentModeState] = useState(false)

  const activeAccount = accounts[activeAccountIndex] || null

  useEffect(() => {
    if (hasCheckedUrl) return
    setHasCheckedUrl(true)

    const urlPrivateKey = searchParams.get("pk") || searchParams.get("privateKey")
    const urlChainId = searchParams.get("chainId") || searchParams.get("chain")
    const urlProjectId = searchParams.get("projectId")

    if (urlProjectId) {
      setProjectIdState(urlProjectId)
      localStorage.setItem("reown_project_id", urlProjectId)
    }

    if (urlChainId) {
      const parsedChainId = Number.parseInt(urlChainId)
      if (!isNaN(parsedChainId)) {
        setChainId(parsedChainId)
        localStorage.setItem("selected_chain_id", parsedChainId.toString())
      }
    }

    if (urlPrivateKey) {
      try {
        const wallet = WalletManager.importFromPrivateKey(urlPrivateKey)
        const newAccounts = [wallet]
        WalletManager.saveAccounts(newAccounts)
        WalletManager.setActiveAccountIndex(0)
        setAccounts(newAccounts)
        setActiveAccountIndex(0)
        // Enable agent mode when importing from URL with private key
        setAgentModeState(true)
        // Clean URL after import for security
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", window.location.pathname)
        }
        return
      } catch (error) {
        console.error("[v0] Failed to import wallet from URL:", error)
      }
    }

    const savedAccounts = WalletManager.loadAccounts()
    if (savedAccounts.length > 0) {
      setAccounts(savedAccounts)
      const savedIndex = WalletManager.getActiveAccountIndex()
      setActiveAccountIndex(Math.min(savedIndex, savedAccounts.length - 1))
    }

    const savedChainId = localStorage.getItem("selected_chain_id")
    if (savedChainId && !urlChainId) {
      setChainId(Number.parseInt(savedChainId))
    }

    const savedProjectId = localStorage.getItem("reown_project_id")
    if (savedProjectId && !urlProjectId) {
      setProjectIdState(savedProjectId)
    }
  }, [searchParams, hasCheckedUrl])

  useEffect(() => {
    if (activeAccount) {
      ;(async () => {
        try {
          await refreshBalance()
        } catch (error) {
          console.error("[v0] Error refreshing balance in effect:", error)
        }
      })()
    }
  }, [activeAccount, chainId, projectId])

  const getProvider = (): ethers.JsonRpcProvider | null => {
    const rpcUrl = getChainRpcUrl(chainId, projectId)
    if (!rpcUrl) return null
    return new ethers.JsonRpcProvider(rpcUrl)
  }

  const refreshBalance = async () => {
    if (!activeAccount) return

    try {
      const provider = getProvider()
      if (!provider) {
        setBalance("0.0")
        return
      }

      const balanceWei = await provider.getBalance(activeAccount.address)
      const balanceEth = ethers.formatEther(balanceWei)
      setBalance(Number.parseFloat(balanceEth).toFixed(4))
    } catch (error) {
      console.error("[v0] Error fetching balance:", error)
      setBalance("0.0")
    }
  }

  const getAccountBalance = async (address: string): Promise<string> => {
    try {
      const provider = getProvider()
      if (!provider) return "0.0"

      const balanceWei = await provider.getBalance(address)
      const balanceEth = ethers.formatEther(balanceWei)
      return Number.parseFloat(balanceEth).toFixed(4)
    } catch (error) {
      return "0.0"
    }
  }

  const createNewWallet = () => {
    const newWallet = WalletManager.createWallet(0)
    const newAccounts = [newWallet]
    WalletManager.saveAccounts(newAccounts)
    WalletManager.setActiveAccountIndex(0)
    setAccounts(newAccounts)
    setActiveAccountIndex(0)
  }

  const importWallet = (privateKeyOrMnemonicOrAddress: string) => {
    try {
      let wallet: WalletAccount
      const input = privateKeyOrMnemonicOrAddress.trim()

      // Check if it's an Ethereum address (watch-only)
      if (ethers.isAddress(input)) {
        wallet = WalletManager.createWatchOnly(input)
      } else {
        // Check if mnemonic or private key
        const words = input.split(/\s+/)
        if (words.length === 12 || words.length === 24) {
          wallet = WalletManager.importFromMnemonic(input, 0)
        } else {
          wallet = WalletManager.importFromPrivateKey(input)
        }
      }

      const newAccounts = [wallet]
      WalletManager.saveAccounts(newAccounts)
      WalletManager.setActiveAccountIndex(0)
      setAccounts(newAccounts)
      setActiveAccountIndex(0)
    } catch (error) {
      console.error("[v0] Error importing wallet:", error)
      throw new Error("Invalid private key, mnemonic phrase, or Ethereum address")
    }
  }

  const addWallet = (privateKeyOrMnemonicOrAddress: string) => {
    try {
      let wallet: WalletAccount
      const input = privateKeyOrMnemonicOrAddress.trim()

      // Check if it's an Ethereum address (watch-only)
      if (ethers.isAddress(input)) {
        wallet = WalletManager.createWatchOnly(input)
      } else {
        // Check if mnemonic or private key
        const words = input.split(/\s+/)
        if (words.length === 12 || words.length === 24) {
          wallet = WalletManager.importFromMnemonic(input, 0)
        } else {
          wallet = WalletManager.importFromPrivateKey(input)
        }
      }

      // Check if wallet already exists
      const existingIndex = accounts.findIndex((a) => a.address.toLowerCase() === wallet.address.toLowerCase())
      if (existingIndex !== -1) {
        // Switch to existing account
        WalletManager.setActiveAccountIndex(existingIndex)
        setActiveAccountIndex(existingIndex)
        return
      }

      const newAccounts = [...accounts, wallet]
      WalletManager.saveAccounts(newAccounts)
      WalletManager.setActiveAccountIndex(newAccounts.length - 1)
      setAccounts(newAccounts)
      setActiveAccountIndex(newAccounts.length - 1)
    } catch (error) {
      console.error("[v0] Error adding wallet:", error)
      throw new Error("Invalid private key, mnemonic phrase, or Ethereum address")
    }
  }

  const addAccountFromSeed = () => {
    if (accounts.length === 0 || !activeAccount?.mnemonic) {
      throw new Error("No seed phrase available")
    }

    const mnemonic = activeAccount.mnemonic
    const nextIndex = accounts.filter((a) => a.mnemonic === mnemonic).length
    const newAccount = WalletManager.importFromMnemonic(mnemonic, nextIndex)

    const newAccounts = [...accounts, newAccount]
    WalletManager.saveAccounts(newAccounts)
    WalletManager.setActiveAccountIndex(newAccounts.length - 1)
    setAccounts(newAccounts)
    setActiveAccountIndex(newAccounts.length - 1)
  }

  const switchAccount = async (index: number) => {
    if (index >= 0 && index < accounts.length) {
      WalletManager.setActiveAccountIndex(index)
      setActiveAccountIndex(index)
      
      // Refresh balance for new account
      setTimeout(() => {
        refreshBalance()
      }, 100)
    }
  }

  const reorderAccounts = (newOrder: WalletAccount[]) => {
    // Find the current active account in the new order
    const currentActiveAccount = accounts[activeAccountIndex]
    const newActiveIndex = newOrder.findIndex(
      (account) => account.address === currentActiveAccount?.address
    )
    
    // Update accounts and save
    WalletManager.saveAccounts(newOrder)
    setAccounts(newOrder)
    
    // Update active index if found
    if (newActiveIndex !== -1) {
      WalletManager.setActiveAccountIndex(newActiveIndex)
      setActiveAccountIndex(newActiveIndex)
    }
  }

  const disconnectWallet = () => {
    if (accounts.length <= 1) {
      // If only one account, clear all
      WalletManager.clearAllAccounts()
      setAccounts([])
      setActiveAccountIndex(0)
      setBalance("0.0")
    } else {
      // Remove only the active account
      const newAccounts = accounts.filter((_, index) => index !== activeAccountIndex)
      WalletManager.saveAccounts(newAccounts)
      
      // Set new active index (either same position or previous if was last)
      const newActiveIndex = activeAccountIndex >= newAccounts.length ? newAccounts.length - 1 : activeAccountIndex
      WalletManager.setActiveAccountIndex(newActiveIndex)
      setAccounts(newAccounts)
      setActiveAccountIndex(newActiveIndex)
    }
  }

  const switchChain = async (newChainId: number) => {
    setChainId(newChainId)
    localStorage.setItem("selected_chain_id", newChainId.toString())
    await refreshBalance()
  }

  const setProjectId = (id: string) => {
    setProjectIdState(id)
    localStorage.setItem("reown_project_id", id)
  }

  const setAgentMode = (enabled: boolean) => {
    setAgentModeState(enabled)
  }

  return (
    <WalletContext.Provider
      value={{
        accounts,
        activeAccount,
        activeAccountIndex,
        balance,
        chainId,
        isConnected: !!activeAccount,
        projectId,
        agentMode,
        setAgentMode,
        createNewWallet,
        importWallet,
        addWallet,
        addAccountFromSeed,
        switchAccount,
        reorderAccounts,
        disconnectWallet,
        switchChain,
        setProjectId,
        getProvider,
        refreshBalance,
        getAccountBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

import { Suspense } from "react"

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WalletProviderInner>{children}</WalletProviderInner>
    </Suspense>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
