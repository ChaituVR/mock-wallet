"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { WalletManager, type WalletAccount } from "./wallet-manager"
import { getChainRpcUrl } from "./chain-config"
import { useSearchParams } from "next/navigation"

interface WalletContextType {
  account: WalletAccount | null
  balance: string
  chainId: number
  isConnected: boolean
  projectId: string
  createNewWallet: () => void
  importWallet: (privateKeyOrMnemonic: string) => void
  disconnectWallet: () => void
  switchChain: (chainId: number) => Promise<void>
  setProjectId: (id: string) => void
  getProvider: () => ethers.JsonRpcProvider | null
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

function WalletProviderInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const [account, setAccount] = useState<WalletAccount | null>(null)
  const [balance, setBalance] = useState("0.0")
  const [chainId, setChainId] = useState(11155111)
  const [projectId, setProjectIdState] = useState("")
  const [hasCheckedUrl, setHasCheckedUrl] = useState(false)

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
        WalletManager.saveWallet(wallet)
        setAccount(wallet)
        // Clean URL after import for security
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", window.location.pathname)
        }
        return
      } catch (error) {
        console.error("[v0] Failed to import wallet from URL:", error)
      }
    }

    // Load from localStorage if no URL params
    const savedWallet = WalletManager.loadWallet()
    if (savedWallet) {
      setAccount(savedWallet)
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
    if (account) {
      refreshBalance()
    }
  }, [account, chainId, projectId])

  const getProvider = (): ethers.JsonRpcProvider | null => {
    const rpcUrl = getChainRpcUrl(chainId, projectId)
    if (!rpcUrl) return null
    return new ethers.JsonRpcProvider(rpcUrl)
  }

  const refreshBalance = async () => {
    if (!account) return

    try {
      const provider = getProvider()
      if (!provider) {
        setBalance("0.0")
        return
      }

      const balanceWei = await provider.getBalance(account.address)
      const balanceEth = ethers.formatEther(balanceWei)
      setBalance(Number.parseFloat(balanceEth).toFixed(4))
    } catch (error) {
      console.error("[v0] Error fetching balance:", error)
      setBalance("0.0")
    }
  }

  const createNewWallet = () => {
    const newWallet = WalletManager.createWallet()
    WalletManager.saveWallet(newWallet)
    setAccount(newWallet)
  }

  const importWallet = (privateKeyOrMnemonic: string) => {
    try {
      let wallet: WalletAccount

      const words = privateKeyOrMnemonic.trim().split(/\s+/)
      if (words.length === 12 || words.length === 24) {
        wallet = WalletManager.importFromMnemonic(privateKeyOrMnemonic)
      } else {
        wallet = WalletManager.importFromPrivateKey(privateKeyOrMnemonic)
      }

      WalletManager.saveWallet(wallet)
      setAccount(wallet)
    } catch (error) {
      console.error("[v0] Error importing wallet:", error)
      throw new Error("Invalid private key or mnemonic phrase")
    }
  }

  const disconnectWallet = () => {
    WalletManager.clearWallet()
    setAccount(null)
    setBalance("0.0")
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

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        chainId,
        isConnected: !!account,
        projectId,
        createNewWallet,
        importWallet,
        disconnectWallet,
        switchChain,
        setProjectId,
        getProvider,
        refreshBalance,
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
