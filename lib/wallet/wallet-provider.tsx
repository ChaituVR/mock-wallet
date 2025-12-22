"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { WalletManager, type WalletAccount } from "./wallet-manager"
import { getChainRpcUrl, getChainById } from "./chain-config"
import { useSearchParams } from "next/navigation"
import { type Token, ERC20_ABI, getTokensForChain } from "./token-config"
import { WalletConnectManager } from "../walletconnect/wc-manager"

interface TokenBalance extends Token {
  balance: string
  balanceFormatted: string
  isLoading: boolean
}

interface WalletContextType {
  accounts: WalletAccount[]
  activeAccount: WalletAccount | null
  activeAccountIndex: number
  balance: string
  balanceLoading: boolean
  chainId: number
  isConnected: boolean
  projectId: string
  agentMode: boolean
  tokens: TokenBalance[]
  customTokens: Token[]
  setAgentMode: (enabled: boolean) => void
  createNewWallet: () => void
  importWallet: (privateKeyOrMnemonicOrAddress: string) => Promise<void>
  addWallet: (privateKeyOrMnemonicOrAddress: string) => Promise<void>
  addAccountFromSeed: () => void
  switchAccount: (index: number) => Promise<void>
  reorderAccounts: (newOrder: WalletAccount[]) => void
  disconnectWallet: () => void
  switchChain: (chainId: number) => Promise<void>
  setProjectId: (id: string) => void
  getProvider: () => ethers.JsonRpcProvider | null
  refreshBalance: () => Promise<void>
  getAccountBalance: (address: string) => Promise<string>
  addCustomToken: (tokenAddress: string) => Promise<void>
  removeToken: (tokenAddress: string) => void
  refreshTokenBalances: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

function WalletProviderInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<WalletAccount[]>([])
  const [activeAccountIndex, setActiveAccountIndex] = useState(0)
  const [balance, setBalance] = useState("0.0")
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [chainId, setChainId] = useState(11155111)
  const [projectId, setProjectIdState] = useState("")
  const [hasCheckedUrl, setHasCheckedUrl] = useState(false)
  const [agentMode, setAgentModeState] = useState(false)
  const [tokens, setTokens] = useState<TokenBalance[]>([])
  const [customTokens, setCustomTokens] = useState<Token[]>([])

  const activeAccount = accounts[activeAccountIndex] || null

  // Load custom tokens from localStorage
  useEffect(() => {
    const savedCustomTokens = localStorage.getItem("custom_tokens")
    if (savedCustomTokens) {
      try {
        setCustomTokens(JSON.parse(savedCustomTokens))
      } catch (error) {
        console.error("[v0] Error loading custom tokens:", error)
      }
    }
  }, [])

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

  const getProvider = (targetChainId?: number): ethers.JsonRpcProvider | null => {
    const rpcUrl = getChainRpcUrl(targetChainId ?? chainId, projectId)
    if (!rpcUrl) return null
    return new ethers.JsonRpcProvider(rpcUrl)
  }

  const refreshBalance = async (targetChainId?: number) => {
    if (!activeAccount) return

    const useChainId = targetChainId ?? chainId
    setBalanceLoading(true)
    try {
      const provider = getProvider(useChainId)
      if (!provider) {
        console.log("[v0] No provider available for chainId:", useChainId)
        setBalance("0.0")
        return
      }

      console.log(`[v0] Fetching balance for ${activeAccount.address} on chain ${useChainId}`)
      const balanceWei = await provider.getBalance(activeAccount.address)
      const balanceEth = ethers.formatEther(balanceWei)
      const formattedBalance = Number.parseFloat(balanceEth).toFixed(4)
      console.log(`[v0] Balance on chain ${useChainId}: ${formattedBalance} ${getChainById(useChainId)?.nativeCurrency.symbol || 'ETH'}`)
      setBalance(formattedBalance)
    } catch (error) {
      console.error("[v0] Error fetching balance:", error)
      setBalance("0.0")
    } finally {
      setBalanceLoading(false)
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

  // Helper to resolve ENS names to addresses
  const resolveENS = async (ensName: string): Promise<string | null> => {
    try {
      // Use Ethereum mainnet for ENS resolution
      const mainnetProvider = new ethers.JsonRpcProvider("https://1rpc.io/eth")
      const address = await mainnetProvider.resolveName(ensName)
      return address
    } catch (error) {
      console.error("[v0] Error resolving ENS:", error)
      return null
    }
  }

  // Helper to check if input looks like an ENS name
  const isENSName = (input: string): boolean => {
    // Check for common ENS TLDs - primarily .eth but also others
    // Avoid matching private keys or mnemonics
    const ensPattern = /^[a-zA-Z0-9-]+\.(eth|xyz|luxe|kred|art|club)$/i
    return ensPattern.test(input)
  }

  const importWallet = async (privateKeyOrMnemonicOrAddress: string) => {
    try {
      let wallet: WalletAccount
      const input = privateKeyOrMnemonicOrAddress.trim()

      // Check if it's an Ethereum address (watch-only)
      if (ethers.isAddress(input)) {
        wallet = WalletManager.createWatchOnly(input)
      } else if (isENSName(input)) {
        // Try to resolve as ENS name
        const resolvedAddress = await resolveENS(input)
        if (!resolvedAddress) {
          throw new Error(`Could not resolve ENS name: ${input}`)
        }
        wallet = WalletManager.createWatchOnly(resolvedAddress)
        wallet.label = input // Use ENS name as label
      } else {
        // Check if mnemonic or private key
        const inputStr = String(input)
        const words = inputStr.split(/\s+/)
        if (words.length === 12 || words.length === 24) {
          wallet = WalletManager.importFromMnemonic(inputStr, 0)
        } else {
          wallet = WalletManager.importFromPrivateKey(inputStr)
        }
      }

      const newAccounts = [wallet]
      WalletManager.saveAccounts(newAccounts)
      WalletManager.setActiveAccountIndex(0)
      setAccounts(newAccounts)
      setActiveAccountIndex(0)
    } catch (error) {
      console.error("[v0] Error importing wallet:", error)
      throw error instanceof Error ? error : new Error("Invalid private key, mnemonic phrase, ENS name, or Ethereum address")
    }
  }

  const addWallet = async (privateKeyOrMnemonicOrAddress: string) => {
    try {
      let wallet: WalletAccount
      const input = privateKeyOrMnemonicOrAddress.trim()

      // Check if it's an Ethereum address (watch-only)
      if (ethers.isAddress(input)) {
        wallet = WalletManager.createWatchOnly(input)
      } else if (isENSName(input)) {
        // Try to resolve as ENS name
        const resolvedAddress = await resolveENS(input)
        if (!resolvedAddress) {
          throw new Error(`Could not resolve ENS name: ${input}`)
        }
        wallet = WalletManager.createWatchOnly(resolvedAddress)
        wallet.ensName = input // Store ENS name
        wallet.label = input // Use ENS name as label
      } else {
        // Check if mnemonic or private key
        const inputStr = String(input)
        const words = inputStr.split(/\s+/)
        if (words.length === 12 || words.length === 24) {
          wallet = WalletManager.importFromMnemonic(inputStr, 0)
        } else {
          wallet = WalletManager.importFromPrivateKey(inputStr)
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
      throw error instanceof Error ? error : new Error("Invalid private key, mnemonic phrase, ENS name, or Ethereum address")
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
      
      // Emit accountsChanged event to connected WalletConnect dApps
      const wcManager = WalletConnectManager.getInstance()
      if (wcManager) {
        await wcManager.emitAccountsChanged([accounts[index].address])
      }
      
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
    console.log(`[v0] Switching chain from ${chainId} to ${newChainId}`)
    setChainId(newChainId)
    localStorage.setItem("selected_chain_id", newChainId.toString())
    
    // Emit chainChanged event to connected WalletConnect dApps
    const wcManager = WalletConnectManager.getInstance()
    if (wcManager) {
      await wcManager.emitChainChanged(newChainId)
    }
    
    await refreshBalance(newChainId)
    console.log(`[v0] Chain switch complete to ${newChainId}`)
  }

  const setProjectId = (id: string) => {
    setProjectIdState(id)
    localStorage.setItem("reown_project_id", id)
  }

  const setAgentMode = (enabled: boolean) => {
    setAgentModeState(enabled)
  }

  const refreshTokenBalances = async () => {
    if (!activeAccount) {
      setTokens([])
      return
    }

    try {
      const provider = getProvider()
      if (!provider) {
        setTokens([])
        return
      }

      // Get default tokens for current chain
      const defaultTokens = getTokensForChain(chainId)
      // Combine with custom tokens for this chain
      const chainCustomTokens = customTokens.filter((t) => t.chainId === chainId)
      const allTokens = [...defaultTokens, ...chainCustomTokens]

      // Initialize tokens with loading state
      const initialTokens: TokenBalance[] = allTokens.map((token) => ({
        ...token,
        balance: "0",
        balanceFormatted: "0",
        isLoading: true,
      }))
      setTokens(initialTokens)

      // Fetch balances for all tokens
      const tokenBalances = await Promise.all(
        allTokens.map(async (token) => {
          try {
            const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
            const balance = await contract.balanceOf(activeAccount.address)
            const formatted = ethers.formatUnits(balance, token.decimals)
            return {
              ...token,
              balance: balance.toString(),
              balanceFormatted: Number.parseFloat(formatted).toFixed(4),
              isLoading: false,
            }
          } catch (error) {
            console.error(`[v0] Error fetching balance for ${token.symbol}:`, error)
            return {
              ...token,
              balance: "0",
              balanceFormatted: "0",
              isLoading: false,
            }
          }
        })
      )

      setTokens(tokenBalances)
    } catch (error) {
      console.error("[v0] Error refreshing token balances:", error)
      setTokens([])
    }
  }

  const addCustomToken = async (tokenAddress: string) => {
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid token address")
    }

    // Check if token already exists
    const existingToken = 
      [...getTokensForChain(chainId), ...customTokens].find(
        (t) => t.address.toLowerCase() === tokenAddress.toLowerCase() && t.chainId === chainId
      )
    
    if (existingToken) {
      throw new Error("Token already added")
    }

    try {
      const provider = getProvider()
      if (!provider) throw new Error("No provider available")

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
      
      // Fetch token details
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ])

      const newToken: Token = {
        address: tokenAddress,
        symbol,
        name,
        decimals: Number(decimals),
        chainId,
        isCustom: true,
      }

      const updatedCustomTokens = [...customTokens, newToken]
      setCustomTokens(updatedCustomTokens)
      localStorage.setItem("custom_tokens", JSON.stringify(updatedCustomTokens))

      // Refresh token balances to include new token
      await refreshTokenBalances()
    } catch (error) {
      console.error("[v0] Error adding custom token:", error)
      throw new Error("Failed to fetch token details. Make sure it's a valid ERC20 token.")
    }
  }

  const removeToken = (tokenAddress: string) => {
    const updatedCustomTokens = customTokens.filter(
      (t) => t.address.toLowerCase() !== tokenAddress.toLowerCase()
    )
    setCustomTokens(updatedCustomTokens)
    localStorage.setItem("custom_tokens", JSON.stringify(updatedCustomTokens))
    
    // Remove from current token list
    setTokens((prev) => prev.filter((t) => t.address.toLowerCase() !== tokenAddress.toLowerCase()))
  }

  return (
    <WalletContext.Provider
      value={{
        accounts,
        activeAccount,
        activeAccountIndex,
        balance,
        balanceLoading,
        chainId,
        isConnected: !!activeAccount,
        projectId,
        agentMode,
        tokens,
        customTokens,
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
        addCustomToken,
        removeToken,
        refreshTokenBalances,
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
