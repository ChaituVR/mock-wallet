import type { Metadata } from "next"
import Link from "next/link"
import { generateMetadata as genMeta } from "@/lib/seo"

export const metadata: Metadata = genMeta({
  title: "Features - Mock Wallet",
  description: "Explore all features of Mock Wallet - Transaction Simulator, Multi-account management, WalletConnect v2 integration, address impersonation & watch-only mode, agent mode, URL import for CI/CD, and comprehensive testnet support for Web3 developers.",
  keywords: [
    "wallet features",
    "transaction simulator",
    "multi-account wallet",
    "walletconnect integration",
    "watch-only wallet",
    "address impersonation",
    "ci/cd wallet import",
  ],
  path: "/features",
})

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-foreground font-semibold">Features</li>
          </ol>
        </nav>

        <article className="space-y-12">
          <header>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight uppercase mb-4">
              Features
            </h1>
            <p className="text-xl text-muted-foreground font-mono leading-relaxed max-w-3xl">
              Mock Wallet is packed with powerful features designed to make Web3 testing fast, safe, and efficient.
            </p>
          </header>

          {/* Core Features Grid */}
          <section className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="border-4 border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-black uppercase mb-3 flex items-center gap-2">
                <span className="text-3xl">👛</span>
                Multi-Account Management
              </h2>
              <ul className="space-y-2 text-base">
                <li>✓ Unlimited accounts from single HD wallet</li>
                <li>✓ Import via private key, mnemonic, or watch-only</li>
                <li>✓ Custom account labels and organization</li>
                <li>✓ CSV bulk import for multiple wallets</li>
                <li>✓ Quick switching with keyboard shortcuts</li>
              </ul>
            </div>

            <div className="border-4 border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-black uppercase mb-3 flex items-center gap-2">
                <span className="text-3xl">🔗</span>
                WalletConnect v2
              </h2>
              <ul className="space-y-2 text-base">
                <li>✓ Native WalletConnect v2 support</li>
                <li>✓ Connect via URI or QR code</li>
                <li>✓ Multi-session management</li>
                <li>✓ Sign transactions, messages, typed data (EIP-712)</li>
                <li>✓ Session persistence across refreshes</li>
              </ul>
            </div>

            <div className="border-4 border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-black uppercase mb-3 flex items-center gap-2">
                <span className="text-3xl">🌐</span>
                Network Support
              </h2>
              <ul className="space-y-2 text-base">
                <li>✓ Ethereum (Mainnet & Sepolia)</li>
                <li>✓ Polygon (Mainnet & Amoy)</li>
                <li>✓ Arbitrum (One & Sepolia)</li>
                <li>✓ Optimism (Mainnet & Sepolia)</li>
                <li>✓ Base (Mainnet & Sepolia)</li>
                <li>✓ Custom EVM chains via RPC URL</li>
              </ul>
            </div>

            <div className="border-4 border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-black uppercase mb-3 flex items-center gap-2">
                <span className="text-3xl">👁️</span>
                Watch-Only Mode / Address Impersonation
              </h2>
              <ul className="space-y-2 text-base">
                <li>✓ Impersonate any Ethereum address (whales, users, etc.)</li>
                <li>✓ View dApp UI from any address perspective</li>
                <li>✓ No private key required - zero security risk</li>
                <li>✓ Monitor balance and transaction history</li>
                <li>✓ Connect to dApps via WalletConnect</li>
                <li>✓ Perfect for UI testing and portfolio tracking</li>
              </ul>
            </div>

            <div className="border-4 border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-black uppercase mb-3 flex items-center gap-2">
                <span className="text-3xl">🔧</span>
                URL Import (CI/CD)
              </h2>
              <ul className="space-y-2 text-base">
                <li>✓ Auto-import wallets via URL parameters</li>
                <li>✓ Perfect for CI/CD pipelines</li>
                <li>✓ Programmatic wallet initialization</li>
                <li>✓ Support for private key and chain ID</li>
                <li>✓ Zero manual setup required</li>
              </ul>
            </div>

            <div className="border-4 border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-black uppercase mb-3 flex items-center gap-2">
                <span className="text-3xl">🤖</span>
                Agent Mode (Auto-Approve)
              </h2>
              <ul className="space-y-2 text-base">
                <li>✓ Auto-approve all WalletConnect sessions</li>
                <li>✓ Auto-sign messages &amp; transactions</li>
                <li>✓ Toggle via UI, command palette, or <code className="bg-muted px-1 rounded text-sm">?agent=true</code></li>
                <li>✓ Auto-connect dApps via <code className="bg-muted px-1 rounded text-sm">?wc=URI</code></li>
                <li>✓ Export request logs as JSON</li>
                <li>✓ Toast notifications &amp; copy results</li>
              </ul>
            </div>

            <div className="border-4 border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-black uppercase mb-3 flex items-center gap-2">
                <span className="text-3xl">🎮</span>
                Transaction Simulator
              </h2>
              <ul className="space-y-2 text-base">
                <li>✓ Preview transactions before signing</li>
                <li>✓ Gas estimation and cost analysis</li>
                <li>✓ Risk assessment and warnings</li>
                <li>✓ Decode ERC20 transfers and approvals</li>
                <li>✓ Detect unlimited approvals</li>
              </ul>
            </div>
          </section>

          {/* Developer Tools */}
          <section className="mt-16">
            <h2 className="text-4xl font-black uppercase mb-8">Developer Tools</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-2 border-border bg-accent/20 p-5">
                <h3 className="text-lg font-black uppercase mb-2">Transaction History</h3>
                <p className="text-sm">
                  View complete transaction history with block explorer links, timestamps, and status indicators.
                </p>
              </div>

              <div className="border-2 border-border bg-accent/20 p-5">
                <h3 className="text-lg font-black uppercase mb-2">Real-Time Balance</h3>
                <p className="text-sm">
                  Automatic balance updates after transactions with manual refresh option for instant updates.
                </p>
              </div>

              <div className="border-2 border-border bg-accent/20 p-5">
                <h3 className="text-lg font-black uppercase mb-2">Faucet Integration</h3>
                <p className="text-sm">
                  Quick access to testnet faucets for all supported networks - get test tokens instantly.
                </p>
              </div>

              <div className="border-2 border-border bg-accent/20 p-5">
                <h3 className="text-lg font-black uppercase mb-2">Transaction Simulator</h3>
                <p className="text-sm">
                  Preview transaction outcomes with gas estimates, risk assessment, and decoded function calls.
                </p>
              </div>

              <div className="border-2 border-border bg-accent/20 p-5">
                <h3 className="text-lg font-black uppercase mb-2">Command Palette</h3>
                <p className="text-sm">
                  Keyboard-driven navigation (Cmd/Ctrl + K) for power users - switch accounts, networks, and more.
                </p>
              </div>

              <div className="border-2 border-border bg-accent/20 p-5">
                <h3 className="text-lg font-black uppercase mb-2">Dark/Light Theme</h3>
                <p className="text-sm">
                  Full theme customization with dark and light modes, optimized for extended coding sessions.
                </p>
              </div>

              <div className="border-2 border-border bg-accent/20 p-5">
                <h3 className="text-lg font-black uppercase mb-2">CSV Import/Export</h3>
                <p className="text-sm">
                  Bulk wallet management with CSV file support - import/export multiple wallets at once.
                </p>
              </div>
            </div>
          </section>

          {/* Security Features */}
          <section className="mt-16">
            <h2 className="text-4xl font-black uppercase mb-8">Security & Safety</h2>
            <div className="bg-destructive/10 border-4 border-destructive p-8 mb-6">
              <h3 className="text-2xl font-black uppercase text-destructive mb-4">⚠️ Testing Only</h3>
              <p className="text-base leading-relaxed">
                Mock Wallet is designed exclusively for testing and development. Never use with real funds or 
                mainnet private keys with value. All security features are optimized for testing safety, not 
                production security.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-border bg-card p-6">
                <h3 className="text-xl font-bold uppercase mb-3">Browser-Based Storage</h3>
                <p className="text-sm">
                  Private keys stored in browser localStorage - never leaves your device, never sent to servers.
                </p>
              </div>

              <div className="border-2 border-border bg-card p-6">
                <h3 className="text-xl font-bold uppercase mb-3">No Server Communication</h3>
                <p className="text-sm">
                  All cryptographic operations happen client-side. Your keys never touch our servers.
                </p>
              </div>

              <div className="border-2 border-border bg-card p-6">
                <h3 className="text-xl font-bold uppercase mb-3">Open Source</h3>
                <p className="text-sm">
                  MIT licensed and fully open source on GitHub - audit the code yourself.
                </p>
              </div>

              <div className="border-2 border-border bg-card p-6">
                <h3 className="text-xl font-bold uppercase mb-3">Request Review</h3>
                <p className="text-sm">
                  Every transaction and signature request requires explicit approval - no surprises.
                </p>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mt-16">
            <h2 className="text-4xl font-black uppercase mb-8">Perfect For</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary bg-primary/5 p-6">
                <h3 className="text-xl font-bold uppercase mb-2">dApp Development & Testing</h3>
                <p className="text-base leading-relaxed">
                  Test your dApp's WalletConnect integration without risking real funds. Simulate multiple users, 
                  test edge cases, and debug transaction flows in a safe environment.
                </p>
              </div>

              <div className="border-l-4 border-primary bg-primary/5 p-6">
                <h3 className="text-xl font-bold uppercase mb-2">Smart Contract Development</h3>
                <p className="text-base leading-relaxed">
                  Deploy and interact with smart contracts on testnets. Test contract functions, verify events, 
                  and debug contract logic without mainnet gas costs.
                </p>
              </div>

              <div className="border-l-4 border-primary bg-primary/5 p-6">
                <h3 className="text-xl font-bold uppercase mb-2">CI/CD Integration</h3>
                <p className="text-base leading-relaxed">
                  Automate wallet imports via URL parameters and enable Agent Mode for fully automated testing. 
                  Use <code className="bg-muted px-1 rounded text-sm">?pk=KEY&agent=true&wc=URI</code> for zero-touch E2E testing 
                  with auto-connect, auto-approve, and exportable request logs.
                </p>
              </div>

              <div className="border-l-4 border-primary bg-primary/5 p-6">
                <h3 className="text-xl font-bold uppercase mb-2">Multi-Account Testing</h3>
                <p className="text-base leading-relaxed">
                  Test multi-user scenarios with ease. Switch between accounts instantly, simulate token transfers 
                  between wallets, and verify permission systems.
                </p>
              </div>

              <div className="border-l-4 border-primary bg-primary/5 p-6">
                <h3 className="text-xl font-bold uppercase mb-2">Blockchain Education</h3>
                <p className="text-base leading-relaxed">
                  Learn Web3 development without financial risk. Perfect for students, bootcamps, and workshops. 
                  Experiment freely with testnets and mock scenarios.
                </p>
              </div>

              <div className="border-l-4 border-primary bg-primary/5 p-6">
                <h3 className="text-xl font-bold uppercase mb-2">Transaction Debugging</h3>
                <p className="text-base leading-relaxed">
                  Inspect and debug transaction flows step-by-step. View transaction history, check gas estimates, 
                  and verify signature data before committing to mainnet.
                </p>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mt-16">
            <h2 className="text-4xl font-black uppercase mb-8">Mock Wallet vs Production Wallets</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-4 border-border">
                <thead className="bg-accent">
                  <tr>
                    <th className="border-2 border-border p-4 text-left font-black uppercase">Feature</th>
                    <th className="border-2 border-border p-4 text-center font-black uppercase">Mock Wallet</th>
                    <th className="border-2 border-border p-4 text-center font-black uppercase">MetaMask</th>
                    <th className="border-2 border-border p-4 text-center font-black uppercase">Rainbow</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-2 border-border p-4 font-semibold">Multi-Account Management</td>
                    <td className="border-2 border-border p-4 text-center">✅ Unlimited</td>
                    <td className="border-2 border-border p-4 text-center">✅ Multiple</td>
                    <td className="border-2 border-border p-4 text-center">✅ Multiple</td>
                  </tr>
                  <tr className="bg-accent/20">
                    <td className="border-2 border-border p-4 font-semibold">WalletConnect v2</td>
                    <td className="border-2 border-border p-4 text-center">✅ Native</td>
                    <td className="border-2 border-border p-4 text-center">✅ Yes</td>
                    <td className="border-2 border-border p-4 text-center">✅ Yes</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-border p-4 font-semibold">Watch-Only Addresses</td>
                    <td className="border-2 border-border p-4 text-center">✅ Yes</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                    <td className="border-2 border-border p-4 text-center">✅ Limited</td>
                  </tr>
                  <tr className="bg-accent/20">
                    <td className="border-2 border-border p-4 font-semibold">URL Import (CI/CD)</td>
                    <td className="border-2 border-border p-4 text-center">✅ Yes</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-border p-4 font-semibold">Agent Mode (Auto-Approve)</td>
                    <td className="border-2 border-border p-4 text-center">✅ Yes</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                  </tr>
                  <tr className="bg-accent/20">
                    <td className="border-2 border-border p-4 font-semibold">CSV Bulk Import</td>
                    <td className="border-2 border-border p-4 text-center">✅ Yes</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-border p-4 font-semibold">Transaction Simulator</td>
                    <td className="border-2 border-border p-4 text-center">✅ Built-in</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                  </tr>
                  <tr className="bg-accent/20">
                    <td className="border-2 border-border p-4 font-semibold">Browser Extension</td>
                    <td className="border-2 border-border p-4 text-center">❌ No (Web)</td>
                    <td className="border-2 border-border p-4 text-center">✅ Yes</td>
                    <td className="border-2 border-border p-4 text-center">❌ No</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-border p-4 font-semibold">Production Ready</td>
                    <td className="border-2 border-border p-4 text-center">❌ Testing Only</td>
                    <td className="border-2 border-border p-4 text-center">✅ Yes</td>
                    <td className="border-2 border-border p-4 text-center">✅ Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              * Mock Wallet is specifically designed for development and testing. For production use with real funds, 
              use audited wallets like MetaMask or Rainbow.
            </p>
          </section>

          {/* Technical Specifications */}
          <section className="mt-16">
            <h2 className="text-4xl font-black uppercase mb-8">Technical Specifications</h2>
            <div className="border-4 border-border bg-card p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold uppercase mb-4">Supported Standards</h3>
                  <ul className="space-y-2 text-base font-mono">
                    <li>• BIP-39 (Mnemonic phrases)</li>
                    <li>• BIP-44 (HD wallet derivation)</li>
                    <li>• EIP-712 (Typed structured data)</li>
                    <li>• EIP-1193 (Provider standard)</li>
                    <li>• EIP-155 (Chain ID)</li>
                    <li>• EIP-1559 (Gas pricing)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold uppercase mb-4">Network Compatibility</h3>
                  <ul className="space-y-2 text-base font-mono">
                    <li>• EVM-compatible chains</li>
                    <li>• Layer 1: Ethereum</li>
                    <li>• Layer 2: Polygon, Arbitrum, Optimism, Base</li>
                    <li>• Custom RPC endpoints</li>
                    <li>• Mainnet & Testnet support</li>
                    <li>• WebSocket & HTTP providers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold uppercase mb-4">Web3 Library</h3>
                  <ul className="space-y-2 text-base font-mono">
                    <li>• ethers.js v6</li>
                    <li>• @reown/walletkit</li>
                    <li>• WalletConnect v2</li>
                    <li>• JSON-RPC 2.0</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold uppercase mb-4">Framework</h3>
                  <ul className="space-y-2 text-base font-mono">
                    <li>• Next.js 15</li>
                    <li>• TypeScript</li>
                    <li>• React 18</li>
                    <li>• Tailwind CSS v4</li>
                    <li>• Radix UI</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-16 pt-8 border-t-4 border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Last updated: February 28, 2026
              </p>
              <div className="flex gap-4">
                <Link href="/" className="text-primary hover:underline font-semibold">Home</Link>
                <Link href="/docs" className="text-primary hover:underline font-semibold">Documentation</Link>
                <a href="https://github.com/ChaituVR/mock-wallet" className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </div>
  )
}
