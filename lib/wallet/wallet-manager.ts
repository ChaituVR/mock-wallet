"use client"

import { ethers } from "ethers"

export interface WalletAccount {
  address: string
  privateKey: string
  mnemonic?: string
}

export class WalletManager {
  private static STORAGE_KEY = "reown_test_wallet"

  static createWallet(): WalletAccount {
    const wallet = ethers.Wallet.createRandom()
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
    }
  }

  static importFromPrivateKey(privateKey: string): WalletAccount {
    const wallet = new ethers.Wallet(privateKey)
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    }
  }

  static importFromMnemonic(mnemonic: string): WalletAccount {
    const wallet = ethers.Wallet.fromPhrase(mnemonic)
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
    }
  }

  static saveWallet(wallet: WalletAccount) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wallet))
    }
  }

  static loadWallet(): WalletAccount | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return null
  }

  static clearWallet() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  static formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
}
