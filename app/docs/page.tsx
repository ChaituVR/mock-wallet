import type { Metadata } from "next"
import Link from "next/link"
import { generateMetadata as genMeta } from "@/lib/seo"

export const metadata: Metadata = genMeta({
  title: "Documentation - Mock Wallet Developer Guide",
  description: "Complete documentation for Mock Wallet - Learn how to create test wallets, connect to dApps via WalletConnect, manage multiple accounts, and test Web3 applications safely on testnets.",
  keywords: [
    "mock wallet documentation",
    "web3 wallet guide",
    "walletconnect tutorial",
    "dapp testing guide",
    "ethereum wallet setup",
    "testnet wallet docs",
  ],
  path: "/docs",
})

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-foreground font-semibold">Documentation</li>
          </ol>
        </nav>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header>
            <h1 className="text-5xl font-extrabold tracking-tight uppercase mb-4">
              Mock Wallet Documentation
            </h1>
            <p className="text-xl text-muted-foreground font-mono leading-relaxed">
              Complete guide to testing Web3 applications with Mock Wallet - The professional developer testing tool
            </p>
          </header>

          <section id="what-is-mock-wallet">
            <h2 className="text-3xl font-black uppercase mt-12 mb-4">What is Mock Wallet?</h2>
            <p className="text-lg leading-relaxed">
              Mock Wallet is a professional Web3 development wallet designed specifically for blockchain developers 
              to test decentralized applications (dApps), smart contracts, and Web3 integrations in a safe environment. 
              It provides multi-account management, native WalletConnect v2 support, and comprehensive testnet coverage 
              across Ethereum, Polygon, Arbitrum, Optimism, Base, and custom EVM-compatible chains.
            </p>
            <p className="text-lg leading-relaxed mt-4">
              Unlike production wallets like MetaMask or Rainbow, Mock Wallet is purpose-built for development and 
              testing workflows, with features like URL-based wallet import for CI/CD pipelines, transaction simulation, 
              and watch-only addresses for monitoring without private keys.
            </p>
          </section>

          <section id="key-features">
            <h2 className="text-3xl font-black uppercase mt-12 mb-4">Key Features</h2>
            
            <h3 className="text-2xl font-bold uppercase mt-8 mb-3">Multi-Account Management</h3>
            <ul className="list-disc pl-6 space-y-2 text-lg">
              <li>Create unlimited accounts from a single HD wallet (BIP-39/BIP-44)</li>
              <li>Import wallets via private key, 12/24-word mnemonic, or watch-only addresses</li>
              <li>Custom account labels for easy identification</li>
              <li>CSV bulk import for managing multiple test wallets</li>
              <li>Quick account switching with keyboard shortcuts (Cmd/Ctrl + K)</li>
            </ul>

            <h3 className="text-2xl font-bold uppercase mt-8 mb-3">WalletConnect v2 Integration</h3>
            <ul className="list-disc pl-6 space-y-2 text-lg">
              <li>Connect to any dApp using WalletConnect v2</li>
              <li>Scan QR codes or paste connection URIs</li>
              <li>Multi-session support for testing multiple dApps simultaneously</li>
              <li>Agent Mode (Auto-Approve) for automated testing workflows</li>
              <li>WC URI auto-connect via <code className="bg-muted px-1 rounded text-sm">?wc=URI</code> URL parameter</li>
              <li>Export request logs as JSON for debugging</li>
              <li>Disconnect all sessions with one click</li>
              <li>Session duration tracking and request counters</li>
              <li>Native WalletConnect v2 support via @reown/walletkit</li>
              <li>Connect to dApps using URI or QR code</li>
              <li>Multi-session management (connect to multiple dApps simultaneously)</li>
              <li>Session persistence across browser refreshes</li>
              <li>Support for all WalletConnect methods: sign transactions, sign messages, sign typed data (EIP-712)</li>
            </ul>

            <h3 className="text-2xl font-bold uppercase mt-8 mb-3">Network Support</h3>
            <p className="text-lg leading-relaxed">Mock Wallet supports all major Ethereum testnets and mainnets:</p>
            <ul className="list-disc pl-6 space-y-2 text-lg">
              <li><strong>Ethereum:</strong> Mainnet (1), Sepolia (11155111)</li>
              <li><strong>Polygon:</strong> Mainnet (137), Amoy (80002)</li>
              <li><strong>Arbitrum:</strong> One (42161), Sepolia (421614)</li>
              <li><strong>Optimism:</strong> Mainnet (10), Sepolia (11155420)</li>
              <li><strong>Base:</strong> Mainnet (8453), Sepolia (84532)</li>
              <li><strong>Custom:</strong> Any EVM-compatible chain via custom RPC URL</li>
            </ul>

            <h3 className="text-2xl font-bold uppercase mt-8 mb-3">Developer Tools</h3>
            <ul className="list-disc pl-6 space-y-2 text-lg">
              <li>URL-based wallet import for CI/CD integration</li>
              <li>Agent Mode for automated request approval (<code className="bg-muted px-1 rounded text-sm">?agent=true</code>)</li>
              <li>Transaction history with block explorer links</li>
              <li>Real-time balance updates</li>
              <li>Integrated faucet links for all supported testnets</li>
              <li>Command palette for quick actions (Cmd/Ctrl + K)</li>
            </ul>
          </section>

          <section id="getting-started">
            <h2 className="text-3xl font-black uppercase mt-12 mb-4">How to Get Started</h2>
            <p className="text-lg leading-relaxed">
              Getting started with Mock Wallet takes less than 30 seconds. Follow these simple steps:
            </p>

            <div className="bg-accent/20 border-4 border-border p-6 my-6">
              <h3 className="text-xl font-black uppercase mb-4">Step 1: Access Mock Wallet</h3>
              <p className="text-base leading-relaxed">
                Visit <Link href="/" className="text-primary font-bold hover:underline">mockwallet.dev</Link> in 
                your web browser. No installation or browser extension required.
              </p>
            </div>

            <div className="bg-accent/20 border-4 border-border p-6 my-6">
              <h3 className="text-xl font-black uppercase mb-4">Step 2: Create a New Wallet</h3>
              <p className="text-base leading-relaxed mb-3">
                Click the <strong>"Create Wallet"</strong> button to generate a new test wallet. This creates a 
                random private key and 12-word mnemonic phrase using industry-standard cryptography (BIP-39/BIP-44).
              </p>
              <p className="text-sm text-muted-foreground">
                ⚠️ <strong>Important:</strong> Only use test wallets with testnet tokens. Never use Mock Wallet 
                with real funds or mainnet private keys.
              </p>
            </div>

            <div className="bg-accent/20 border-4 border-border p-6 my-6">
              <h3 className="text-xl font-black uppercase mb-4">Step 3: Select Your Network</h3>
              <p className="text-base leading-relaxed">
                Choose your preferred testnet from the network selector at the top of the page. Popular choices 
                include Sepolia (Ethereum), Polygon Amoy, and Arbitrum Sepolia.
              </p>
            </div>

            <div className="bg-accent/20 border-4 border-border p-6 my-6">
              <h3 className="text-xl font-black uppercase mb-4">Step 4: Get Test Tokens</h3>
              <p className="text-base leading-relaxed">
                Click the <strong>"Faucets"</strong> button to access testnet faucets. These provide free test 
                tokens for your wallet address so you can perform transactions.
              </p>
            </div>

            <div className="bg-accent/20 border-4 border-border p-6 my-6">
              <h3 className="text-xl font-black uppercase mb-4">Step 5: Connect to Your dApp</h3>
              <p className="text-base leading-relaxed">
                Copy the WalletConnect URI from your dApp, paste it into Mock Wallet's connection field, and 
                click <strong>"PAIR"</strong>. You're now ready to test your Web3 application!
              </p>
            </div>
          </section>

          <section id="faq">
            <h2 className="text-3xl font-black uppercase mt-12 mb-4">Frequently Asked Questions</h2>

            <h3 className="text-xl font-bold uppercase mt-6 mb-2">How do I create a new wallet?</h3>
            <p className="text-base leading-relaxed">
              Click the "Create Wallet" button on the home page. This generates a random private key and 12-word 
              mnemonic phrase for you. Make sure to save your mnemonic if you want to restore the wallet later.
            </p>

            <h3 className="text-xl font-bold uppercase mt-6 mb-2">Is Mock Wallet safe for mainnet?</h3>
            <p className="text-base leading-relaxed">
              <strong>No.</strong> Mock Wallet is designed exclusively for testing and development. It stores 
              private keys in browser localStorage and is not audited for production security. Only use it with 
              testnet tokens. Never use real funds or mainnet private keys with Mock Wallet.
            </p>

            <h3 className="text-xl font-bold uppercase mt-6 mb-2">What networks are supported?</h3>
            <p className="text-base leading-relaxed">
              Mock Wallet supports Ethereum (Mainnet & Sepolia), Polygon (Mainnet & Amoy), Arbitrum (One & Sepolia), 
              Optimism (Mainnet & Sepolia), Base (Mainnet & Sepolia), and any custom EVM-compatible chain via RPC URL. 
              We recommend using testnets for all testing activities.
            </p>

            <h3 className="text-xl font-bold uppercase mt-6 mb-2">How do I connect to a dApp via WalletConnect?</h3>
            <p className="text-base leading-relaxed">
              Mock Wallet comes with a default Reown Project ID configured. Simply copy the WalletConnect URI from 
              your dApp (usually starts with "wc:"), paste it into Mock Wallet's connection field, and click 
              "PAIR". The connection will be established and you can approve requests from your dApp. You can also 
              configure your own Project ID in the settings if needed.
            </p>

            <h3 className="text-xl font-bold uppercase mt-6 mb-2">Can I import my existing wallet?</h3>
            <p className="text-base leading-relaxed">
              Yes! You can import wallets using private keys, 12/24-word mnemonic phrases, or add Ethereum 
              addresses as watch-only (no private key required). You can also import multiple wallets via CSV 
              file for bulk management.
            </p>

            <h3 className="text-xl font-bold uppercase mt-6 mb-2">How do I use URL import for CI/CD?</h3>
            <p className="text-base leading-relaxed">
              Add URL parameters to auto-import wallets: <code className="bg-muted px-2 py-1 rounded">
              ?pk=YOUR_PRIVATE_KEY&chainId=11155111</code>. This is perfect for automated testing pipelines 
              where you need to initialize wallets programmatically.
            </p>

            <h3 className="text-xl font-bold uppercase mt-6 mb-2">What is Agent Mode?</h3>
            <p className="text-base leading-relaxed">
              Agent Mode automatically approves all WalletConnect session proposals and signing requests without 
              manual interaction. Enable it via the toggle switch in the WalletConnect panel, the command palette 
              (<code className="bg-muted px-2 py-1 rounded">Cmd/Ctrl+K</code> → &quot;Agent Mode&quot;), or pass{' '}
              <code className="bg-muted px-2 py-1 rounded">?agent=true</code> as a URL parameter. Combine with{' '}
              <code className="bg-muted px-2 py-1 rounded">?wc=URI</code> for fully automated dApp connections. 
              All auto-approved actions show real-time toast notifications, and request logs can be exported as JSON 
              for debugging. Essential for CI/CD pipelines, E2E testing with Cypress or Playwright, and any 
              automated workflow that requires a headless wallet.
            </p>

            <h3 className="text-xl font-bold uppercase mt-6 mb-2">Where are my private keys stored?</h3>
            <p className="text-base leading-relaxed">
              Private keys are stored in your browser's localStorage. They never leave your device and are never 
              sent to any server. However, localStorage is not designed for production-level security, which is 
              why Mock Wallet should only be used for testing purposes.
            </p>

            <h3 className="text-xl font-bold uppercase mt-6 mb-2">How do I get test tokens from faucets?</h3>
            <p className="text-base leading-relaxed">
              Click the "Faucets" button in your wallet dashboard. This opens a panel with links to official 
              testnet faucets for all supported networks. Copy your wallet address, visit a faucet, and request 
              test tokens. They should arrive in your wallet within a few seconds to minutes depending on the network.
            </p>
          </section>

          <section id="advanced">
            <h2 className="text-3xl font-black uppercase mt-12 mb-4">Advanced Usage</h2>

            <h3 className="text-2xl font-bold uppercase mt-8 mb-3">Managing Multiple Accounts</h3>
            <p className="text-base leading-relaxed">
              Mock Wallet supports unlimited accounts from a single HD wallet or multiple imported wallets:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Click the account dropdown to see all accounts</li>
              <li>Use the "Add Account" button to derive new accounts from your seed</li>
              <li>Import additional wallets using private keys or mnemonics</li>
              <li>Switch between accounts with Cmd/Ctrl + K keyboard shortcut</li>
              <li>Label each account for easy identification</li>
            </ul>

            <h3 className="text-2xl font-bold uppercase mt-8 mb-3">Custom RPC URLs</h3>
            <p className="text-base leading-relaxed">
              To add a custom network, select "Custom" from the network dropdown and provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li><strong>RPC URL:</strong> The JSON-RPC endpoint for your network</li>
              <li><strong>Chain ID:</strong> The numeric chain identifier</li>
              <li><strong>Currency Symbol:</strong> The native token symbol (e.g., "ETH")</li>
              <li><strong>Explorer URL:</strong> Block explorer URL (optional)</li>
            </ul>

            <h3 className="text-2xl font-bold uppercase mt-8 mb-3">Watch-Only Addresses</h3>
            <p className="text-base leading-relaxed">
              Monitor any Ethereum address without needing the private key:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-base">
              <li>Click "Import" in the wallet setup</li>
              <li>Paste any Ethereum address (0x...)</li>
              <li>Mark it as "Watch-Only"</li>
              <li>View balance and transaction history without signing capabilities</li>
            </ol>

            <h3 className="text-2xl font-bold uppercase mt-8 mb-3">Keyboard Shortcuts</h3>
            <p className="text-base leading-relaxed">
              Speed up your workflow with keyboard shortcuts:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li><kbd className="bg-muted px-2 py-1 rounded">Cmd/Ctrl + K</kbd>: Open command palette</li>
              <li><kbd className="bg-muted px-2 py-1 rounded">?</kbd>: Show keyboard shortcuts help</li>
            </ul>
          </section>

          <section id="security">
            <h2 className="text-3xl font-black uppercase mt-12 mb-4">Security Best Practices</h2>
            <div className="bg-destructive/10 border-4 border-destructive p-6 my-6">
              <h3 className="text-xl font-black uppercase text-destructive mb-4">⚠️ Critical Security Warning</h3>
              <ul className="list-disc pl-6 space-y-2 text-base">
                <li>Mock Wallet is designed for <strong>testing only</strong></li>
                <li>Never use with real funds or mainnet private keys with value</li>
                <li>Private keys are stored in browser localStorage (not production-safe)</li>
                <li>Not audited for production security</li>
                <li>Use only with testnet tokens</li>
              </ul>
            </div>

            <h3 className="text-xl font-bold uppercase mt-6 mb-3">Safe Testing Practices</h3>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Always use testnets (Sepolia, Polygon Amoy, etc.)</li>
              <li>Never import production wallet seed phrases</li>
              <li>Generate new test wallets specifically for development</li>
              <li>Review all transaction requests before approving</li>
              <li>Use watch-only addresses for monitoring without risk</li>
              <li>Clear localStorage when switching between projects</li>
            </ul>
          </section>

          <section id="tech-stack">
            <h2 className="text-3xl font-black uppercase mt-12 mb-4">Technical Stack</h2>
            <p className="text-base leading-relaxed">
              Mock Wallet is built with modern Web3 technologies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li><strong>Framework:</strong> Next.js 15 with App Router and React Server Components</li>
              <li><strong>Language:</strong> TypeScript for type safety</li>
              <li><strong>Web3 Library:</strong> ethers.js v6 for blockchain interactions</li>
              <li><strong>WalletConnect:</strong> @reown/walletkit for WalletConnect v2 support</li>
              <li><strong>UI Components:</strong> Radix UI primitives for accessibility</li>
              <li><strong>Styling:</strong> Tailwind CSS v4 with brutalist design system</li>
              <li><strong>Runtime:</strong> Bun for fast package management</li>
              <li><strong>Deployment:</strong> Vercel Edge Network</li>
            </ul>
          </section>

          <section id="troubleshooting">
            <h2 className="text-3xl font-black uppercase mt-12 mb-4">Troubleshooting</h2>

            <h3 className="text-xl font-bold uppercase mt-6 mb-3">Connection issues with dApps</h3>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Verify your Reown Project ID is correctly configured</li>
              <li>Ensure the WalletConnect URI is complete and valid</li>
              <li>Try refreshing both Mock Wallet and your dApp</li>
              <li>Check that you're on a supported network</li>
            </ul>

            <h3 className="text-xl font-bold uppercase mt-6 mb-3">Balance not updating</h3>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Click the refresh button to manually update balance</li>
              <li>Verify you're connected to the correct network</li>
              <li>Check that the RPC endpoint is responsive</li>
              <li>Wait for transaction confirmations (can take 10-30 seconds)</li>
            </ul>

            <h3 className="text-xl font-bold uppercase mt-6 mb-3">Lost wallet access</h3>
            <p className="text-base leading-relaxed">
              If you saved your 12-word mnemonic phrase, you can re-import your wallet. Without the mnemonic or 
              private key, access cannot be recovered. This is why Mock Wallet should only be used with test 
              funds - loss of test wallets has no real-world consequences.
            </p>
          </section>

          <section id="contributing">
            <h2 className="text-3xl font-black uppercase mt-12 mb-4">Contributing</h2>
            <p className="text-base leading-relaxed">
              Mock Wallet is open source under the MIT license. We welcome contributions from the community!
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base mt-4">
              <li><strong>GitHub:</strong> <a href="https://github.com/ChaituVR/mock-wallet" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">ChaituVR/mock-wallet</a></li>
              <li><strong>Issues:</strong> Report bugs or request features via GitHub Issues</li>
              <li><strong>Pull Requests:</strong> Follow our contributing guidelines in CONTRIBUTING.md</li>
              <li><strong>Security:</strong> Report vulnerabilities to security@mockwallet.dev</li>
            </ul>
          </section>

          <footer className="mt-16 pt-8 border-t-4 border-border">
            <p className="text-sm text-muted-foreground">
              Last updated: February 28, 2026 | <Link href="/" className="text-primary hover:underline">Back to Home</Link> | <Link href="/features" className="text-primary hover:underline">Features</Link> | <Link href="/chains" className="text-primary hover:underline">Supported Chains</Link> | <Link href="/use-cases" className="text-primary hover:underline">Use Cases</Link>
            </p>
          </footer>
        </article>
      </div>
    </div>
  )
}
