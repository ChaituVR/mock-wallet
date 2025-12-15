"use client"

import { ethers } from "ethers"

export interface WalletAccount {
  address: string
  privateKey?: string
  mnemonic?: string
  isWatchOnly?: boolean
  derivationIndex?: number
  label?: string
}

export class WalletManager {
  private static STORAGE_KEY = "mockwallet_accounts"
  private static ACTIVE_ACCOUNT_KEY = "mockwallet_active_account"

  static createWallet(derivationIndex = 0): WalletAccount {
    const wallet = ethers.Wallet.createRandom()
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
      derivationIndex,
      label: `Account ${derivationIndex + 1}`,
    }
  }

  static importFromPrivateKey(privateKey: string): WalletAccount {
    const wallet = new ethers.Wallet(privateKey)
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      label: "Imported Account",
    }
  }

  static importFromMnemonic(mnemonic: string, derivationIndex = 0): WalletAccount {
    const path = `m/44'/60'/0'/0/${derivationIndex}`
    const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path)
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: mnemonic,
      derivationIndex,
      label: `Account ${derivationIndex + 1}`,
    }
  }

  static createWatchOnly(address: string): WalletAccount {
    if (!ethers.isAddress(address)) {
      throw new Error("Invalid Ethereum address")
    }
    return {
      address,
      isWatchOnly: true,
      label: "Watch Only",
    }
  }

  static saveAccounts(accounts: WalletAccount[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts))
    }
  }

  static loadAccounts(): WalletAccount[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return []
  }

  static setActiveAccountIndex(index: number) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.ACTIVE_ACCOUNT_KEY, index.toString())
    }
  }

  static getActiveAccountIndex(): number {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.ACTIVE_ACCOUNT_KEY)
      return stored ? Number.parseInt(stored) : 0
    }
    return 0
  }

  static clearAllAccounts() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.ACTIVE_ACCOUNT_KEY)
    }
  }

  static formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
}
