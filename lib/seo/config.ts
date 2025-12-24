import type { Metadata } from "next"

// Site configuration
export const siteConfig = {
  name: "Mock Wallet",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://mockwallet.dev",
  description: "Professional Web3 development wallet for testing dApps, smart contracts, and blockchain integrations",
  twitter: "@mockwallet",
  github: "https://github.com/ChaituVR/mock-wallet",
}

// Base keywords used across the site
export const baseKeywords = [
  "web3 wallet",
  "ethereum wallet", 
  "test wallet",
  "developer wallet",
  "walletconnect",
  "dapp testing",
]

// Generate metadata for any page
export function generateMetadata({
  title,
  description,
  keywords = [],
  path = "",
  image,
  noIndex = false,
}: {
  title: string
  description: string
  keywords?: string[]
  path?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const url = `${siteConfig.url}${path}`
  const ogImage = image || `${siteConfig.url}/og-image.png`

  return {
    title,
    description,
    keywords: [...baseKeywords, ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: `${title} | ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [ogImage],
      creator: siteConfig.twitter,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

// Chain-specific SEO data
export const chainSeoData: Record<
  string,
  {
    name: string
    slug: string
    description: string
    keywords: string[]
    faucetUrl?: string
    isTestnet: boolean
  }
> = {
  ethereum: {
    name: "Ethereum",
    slug: "ethereum",
    description: "Test your dApps on Ethereum Mainnet with Mock Wallet. Full WalletConnect support, transaction simulation, and multi-account management.",
    keywords: ["ethereum wallet", "eth wallet", "ethereum dapp testing", "ethereum mainnet"],
    isTestnet: false,
  },
  sepolia: {
    name: "Sepolia Testnet",
    slug: "sepolia",
    description: "Test Ethereum dApps on Sepolia testnet. Get free test ETH, simulate transactions, and debug smart contracts with Mock Wallet.",
    keywords: ["sepolia testnet", "sepolia wallet", "sepolia faucet", "ethereum testnet"],
    faucetUrl: "https://sepoliafaucet.com",
    isTestnet: true,
  },
  polygon: {
    name: "Polygon",
    slug: "polygon",
    description: "Test Polygon dApps with Mock Wallet. Fast transactions, low fees, and full compatibility with Polygon ecosystem.",
    keywords: ["polygon wallet", "matic wallet", "polygon dapp testing", "polygon mainnet"],
    isTestnet: false,
  },
  "polygon-amoy": {
    name: "Polygon Amoy Testnet",
    slug: "polygon-amoy",
    description: "Test on Polygon Amoy testnet with Mock Wallet. Get free test MATIC and debug your Polygon dApps.",
    keywords: ["polygon amoy", "polygon testnet", "amoy faucet", "matic testnet"],
    faucetUrl: "https://faucet.polygon.technology/",
    isTestnet: true,
  },
  arbitrum: {
    name: "Arbitrum One",
    slug: "arbitrum",
    description: "Test Arbitrum dApps with Mock Wallet. Layer 2 scaling with Ethereum security.",
    keywords: ["arbitrum wallet", "arbitrum one", "arbitrum dapp testing", "layer 2 wallet"],
    isTestnet: false,
  },
  "arbitrum-sepolia": {
    name: "Arbitrum Sepolia Testnet",
    slug: "arbitrum-sepolia",
    description: "Test on Arbitrum Sepolia testnet. Debug Layer 2 dApps with Mock Wallet.",
    keywords: ["arbitrum sepolia", "arbitrum testnet", "layer 2 testnet"],
    faucetUrl: "https://faucet.quicknode.com/arbitrum/sepolia",
    isTestnet: true,
  },
  optimism: {
    name: "Optimism",
    slug: "optimism",
    description: "Test Optimism dApps with Mock Wallet. Optimistic rollup testing made easy.",
    keywords: ["optimism wallet", "op wallet", "optimism dapp testing", "optimistic rollup"],
    isTestnet: false,
  },
  "optimism-sepolia": {
    name: "Optimism Sepolia Testnet",
    slug: "optimism-sepolia",
    description: "Test on Optimism Sepolia testnet. Debug OP Stack dApps with Mock Wallet.",
    keywords: ["optimism sepolia", "optimism testnet", "op testnet"],
    faucetUrl: "https://app.optimism.io/faucet",
    isTestnet: true,
  },
  base: {
    name: "Base",
    slug: "base",
    description: "Test Base dApps with Mock Wallet. Coinbase's Layer 2 testing made simple.",
    keywords: ["base wallet", "base chain", "base dapp testing", "coinbase layer 2"],
    isTestnet: false,
  },
  "base-sepolia": {
    name: "Base Sepolia Testnet",
    slug: "base-sepolia",
    description: "Test on Base Sepolia testnet. Debug Base dApps with Mock Wallet.",
    keywords: ["base sepolia", "base testnet", "coinbase testnet"],
    faucetUrl: "https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet",
    isTestnet: true,
  },
}

// Feature-specific SEO data
export const featureSeoData: Record<
  string,
  {
    name: string
    slug: string
    title: string
    description: string
    keywords: string[]
  }
> = {
  "multi-account": {
    name: "Multi-Account Management",
    slug: "multi-account",
    title: "Multi-Account Wallet Management for Web3 Developers",
    description: "Manage unlimited test wallets from a single HD wallet. Switch accounts instantly, organize with labels, and bulk import via CSV.",
    keywords: ["multi account wallet", "multiple wallets", "HD wallet", "account management"],
  },
  walletconnect: {
    name: "WalletConnect Integration",
    slug: "walletconnect",
    title: "WalletConnect v2 Integration for dApp Testing",
    description: "Connect to any dApp using WalletConnect v2. Sign transactions, messages, and typed data. Perfect for dApp development testing.",
    keywords: ["walletconnect", "walletconnect v2", "dapp connection", "wallet bridge"],
  },
  "transaction-simulator": {
    name: "Transaction Simulator",
    slug: "transaction-simulator",
    title: "Transaction Simulator - Preview Before Signing",
    description: "Simulate transactions before signing. See gas estimates, risk assessments, and decoded function calls. Avoid costly mistakes.",
    keywords: ["transaction simulator", "gas estimation", "transaction preview", "risk assessment"],
  },
  "watch-only": {
    name: "Watch-Only Mode",
    slug: "watch-only",
    title: "Watch-Only Wallet & Address Impersonation",
    description: "Monitor any Ethereum address without private keys. View dApps from any perspective. Perfect for portfolio tracking and UI testing.",
    keywords: ["watch only wallet", "address impersonation", "portfolio tracking", "view only"],
  },
  "agent-mode": {
    name: "Agent Mode",
    slug: "agent-mode",
    title: "Agent Mode - Automated Transaction Signing",
    description: "Auto-approve WalletConnect requests for automated testing. Perfect for CI/CD pipelines and E2E testing.",
    keywords: ["agent mode", "automated testing", "auto approve", "CI/CD wallet"],
  },
  "url-import": {
    name: "URL Import",
    slug: "url-import",
    title: "URL Import for CI/CD Pipeline Integration",
    description: "Auto-import wallets via URL parameters. Zero manual setup for automated testing pipelines.",
    keywords: ["url import", "CI/CD integration", "automated wallet setup", "programmatic import"],
  },
}

// Use case specific SEO data
export const useCaseSeoData: Record<
  string,
  {
    name: string
    slug: string
    title: string
    description: string
    keywords: string[]
  }
> = {
  "dapp-testing": {
    name: "dApp Testing",
    slug: "dapp-testing",
    title: "dApp Testing Wallet - Test Your Decentralized Applications",
    description: "Test your dApps with Mock Wallet. Connect via WalletConnect, sign transactions, and debug smart contract interactions.",
    keywords: ["dapp testing", "decentralized app testing", "web3 testing", "smart contract testing"],
  },
  "smart-contract-development": {
    name: "Smart Contract Development",
    slug: "smart-contract-development",
    title: "Smart Contract Testing & Development Wallet",
    description: "Test smart contracts with Mock Wallet. Simulate transactions, debug function calls, and verify contract behavior.",
    keywords: ["smart contract testing", "solidity testing", "contract development", "blockchain development"],
  },
  "defi-testing": {
    name: "DeFi Testing",
    slug: "defi-testing",
    title: "DeFi Protocol Testing Wallet",
    description: "Test DeFi protocols safely with Mock Wallet. Simulate swaps, lending, and liquidity operations without real funds.",
    keywords: ["defi testing", "defi development", "protocol testing", "yield farming testing"],
  },
  "nft-development": {
    name: "NFT Development",
    slug: "nft-development",
    title: "NFT Development & Minting Testing",
    description: "Test NFT minting and marketplace interactions with Mock Wallet. Debug ERC-721 and ERC-1155 contracts.",
    keywords: ["nft testing", "nft development", "erc721 testing", "nft minting"],
  },
}

// Get all slugs for static generation
export function getAllChainSlugs(): string[] {
  return Object.keys(chainSeoData)
}

export function getAllFeatureSlugs(): string[] {
  return Object.keys(featureSeoData)
}

export function getAllUseCaseSlugs(): string[] {
  return Object.keys(useCaseSeoData)
}

// Generate structured data for pages
export function generateWebPageSchema(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
