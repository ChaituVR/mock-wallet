"use client"

import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletSetup } from "@/components/wallet/wallet-setup"
import { WalletDashboard } from "@/components/wallet/wallet-dashboard"
import { StatusBar } from "@/components/wallet/status-bar"
import { KeyboardShortcutsHelp } from "@/components/wallet/keyboard-shortcuts-help"
import Link from "next/link"

export default function Home() {
  const { isConnected } = useWallet()

  if (isConnected) {
    return (
      <>
        <StatusBar />
        <div className="pt-14">
          <WalletDashboard />
        </div>
        <KeyboardShortcutsHelp />
      </>
    )
  }

  return (
    <>
      <WalletSetup />

      {/* SEO-rich content sections — visible to users and crawlers */}
      <section className="border-t-4 border-border bg-background px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 text-center">
            Why Developers Choose Mock Wallet
          </h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            The fastest way to test Web3 applications without risking real funds. Built for blockchain developers who need reliable, repeatable testing workflows.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="border-4 border-border p-6 bg-card">
              <h3 className="text-xl font-black uppercase mb-3">Multi-Account Management</h3>
              <p className="text-sm text-muted-foreground">
                Create unlimited test wallets from a single HD seed phrase. Import via private key, mnemonic, or watch-only address. Perfect for testing multi-user dApp scenarios.
              </p>
              <Link href="/features/multi-account" className="text-primary text-sm font-semibold hover:underline mt-3 inline-block">
                Learn more →
              </Link>
            </div>

            <div className="border-4 border-border p-6 bg-card">
              <h3 className="text-xl font-black uppercase mb-3">WalletConnect v2</h3>
              <p className="text-sm text-muted-foreground">
                Connect to any dApp using WalletConnect v2 protocol. Pair via URI or QR code, manage sessions, and sign transactions — all in your browser.
              </p>
              <Link href="/features/walletconnect" className="text-primary text-sm font-semibold hover:underline mt-3 inline-block">
                Learn more →
              </Link>
            </div>

            <div className="border-4 border-border p-6 bg-card">
              <h3 className="text-xl font-black uppercase mb-3">Transaction Simulator</h3>
              <p className="text-sm text-muted-foreground">
                Preview transaction outcomes before signing. See gas estimates, risk assessments, decoded function calls, and balance change predictions.
              </p>
              <Link href="/features/transaction-simulator" className="text-primary text-sm font-semibold hover:underline mt-3 inline-block">
                Learn more →
              </Link>
            </div>
          </div>

          {/* Supported Chains */}
          <div className="mb-16">
            <h2 className="text-2xl font-black uppercase mb-6 text-center">
              Supported Blockchain Networks
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <Link href="/chains/ethereum" className="border-2 border-border p-4 hover:border-primary transition-colors">
                <span className="font-bold block">Ethereum</span>
                <span className="text-xs text-muted-foreground">Mainnet & Sepolia</span>
              </Link>
              <Link href="/chains/polygon" className="border-2 border-border p-4 hover:border-primary transition-colors">
                <span className="font-bold block">Polygon</span>
                <span className="text-xs text-muted-foreground">Mainnet & Amoy</span>
              </Link>
              <Link href="/chains/arbitrum" className="border-2 border-border p-4 hover:border-primary transition-colors">
                <span className="font-bold block">Arbitrum</span>
                <span className="text-xs text-muted-foreground">One & Sepolia</span>
              </Link>
              <Link href="/chains/optimism" className="border-2 border-border p-4 hover:border-primary transition-colors">
                <span className="font-bold block">Optimism</span>
                <span className="text-xs text-muted-foreground">Mainnet & Sepolia</span>
              </Link>
              <Link href="/chains/base" className="border-2 border-border p-4 hover:border-primary transition-colors">
                <span className="font-bold block">Base</span>
                <span className="text-xs text-muted-foreground">Mainnet & Sepolia</span>
              </Link>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              <Link href="/chains" className="text-primary hover:underline">View all supported chains →</Link>
            </p>
          </div>

          {/* Use Cases */}
          <div className="mb-16">
            <h2 className="text-2xl font-black uppercase mb-6 text-center">
              Built for Every Web3 Testing Scenario
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/use-cases/dapp-testing" className="flex items-start gap-3 border-2 border-border p-5 hover:border-primary transition-colors">
                <span className="text-2xl">🔗</span>
                <div>
                  <h3 className="font-bold">dApp Testing</h3>
                  <p className="text-sm text-muted-foreground">Test WalletConnect integrations, transaction flows, and user interactions safely.</p>
                </div>
              </Link>
              <Link href="/use-cases/smart-contract-development" className="flex items-start gap-3 border-2 border-border p-5 hover:border-primary transition-colors">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-bold">Smart Contract Development</h3>
                  <p className="text-sm text-muted-foreground">Deploy and interact with contracts on testnets with multiple accounts.</p>
                </div>
              </Link>
              <Link href="/use-cases/defi-testing" className="flex items-start gap-3 border-2 border-border p-5 hover:border-primary transition-colors">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="font-bold">DeFi Protocol Testing</h3>
                  <p className="text-sm text-muted-foreground">Test swaps, lending, staking, and liquidity flows without real funds.</p>
                </div>
              </Link>
              <Link href="/use-cases/nft-development" className="flex items-start gap-3 border-2 border-border p-5 hover:border-primary transition-colors">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-bold">NFT Development</h3>
                  <p className="text-sm text-muted-foreground">Test minting, transfers, and marketplace interactions on testnets.</p>
                </div>
              </Link>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              <Link href="/use-cases" className="text-primary hover:underline">Explore all use cases →</Link>
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-black uppercase mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              <details className="border-2 border-border p-4 group" open>
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                  What is Mock Wallet?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">
                  Mock Wallet is a free, open-source Web3 development wallet built for blockchain developers. It provides multi-account management, WalletConnect v2 integration, transaction simulation, and comprehensive testnet support across Ethereum, Polygon, Arbitrum, Optimism, Base, and other EVM-compatible chains.
                </p>
              </details>
              <details className="border-2 border-border p-4 group">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                  Is Mock Wallet safe to use?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">
                  Mock Wallet is designed for testing purposes only and should never be used with real funds. It stores private keys in browser localStorage for convenience during development. Only use it with testnet tokens.
                </p>
              </details>
              <details className="border-2 border-border p-4 group">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                  How do I connect Mock Wallet to a dApp?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">
                  Set your Reown Project ID in settings, then copy the WalletConnect URI from your dApp and paste it into Mock Wallet&apos;s connection field. Click PAIR to establish the connection. You can also scan QR codes directly.
                </p>
              </details>
              <details className="border-2 border-border p-4 group">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                  Can I import an existing wallet?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">
                  Yes. You can import wallets using private keys, 12/24-word mnemonic phrases, or add any Ethereum address as watch-only. CSV bulk import is also supported for managing multiple test wallets.
                </p>
              </details>
              <details className="border-2 border-border p-4 group">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                  What networks does Mock Wallet support?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">
                  Mock Wallet supports Ethereum (Mainnet &amp; Sepolia), Polygon (Mainnet &amp; Amoy), Arbitrum (One &amp; Sepolia), Optimism (Mainnet &amp; Sepolia), Base (Mainnet &amp; Sepolia), and any custom EVM-compatible chain via RPC URL.
                </p>
              </details>
              <details className="border-2 border-border p-4 group">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                  What is Agent Mode?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">
                  Agent Mode automatically approves all WalletConnect session proposals and signing requests without manual interaction. Enable it via the toggle in the WalletConnect panel, the command palette (Cmd/Ctrl+K), or add <code>?agent=true</code> to the URL. Combine with <code>?wc=URI</code> for fully automated dApp connections. All actions show real-time toast notifications and request logs are exportable as JSON.
                </p>
              </details>
            </div>
          </div>

          {/* CTA + Internal Links */}
          <div className="text-center border-4 border-border p-8 bg-accent/20">
            <h2 className="text-2xl font-black uppercase mb-3">Start Testing Your Web3 App Today</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Mock Wallet is free, open-source (MIT), and requires no installation. Create your first test wallet in seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/docs" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-bold uppercase text-sm hover:opacity-90 transition-opacity">
                Read Documentation
              </Link>
              <Link href="/features" className="inline-flex items-center px-6 py-3 border-2 border-border font-bold uppercase text-sm hover:bg-accent transition-colors">
                Explore Features
              </Link>
              <a href="https://github.com/ChaituVR/mock-wallet" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 border-2 border-border font-bold uppercase text-sm hover:bg-accent transition-colors">
                GitHub Repository
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
