import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WalletProvider } from "@/lib/wallet/wallet-provider"
import { AnimatedBackground } from "@/components/animated-background"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
})
const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mockwallet.dev"
const siteName = "Mock Wallet"
const siteTitle = "Mock Wallet - Web3 Developer Testing & Multi-Account Management Tool"
const siteDescription = "Professional Web3 development wallet with multi-account management, WalletConnect integration, watch-only addresses, and comprehensive testnet support. Test Ethereum dApps, manage multiple wallets, sign transactions, and connect via WalletConnect. Perfect for developers, testers, and blockchain enthusiasts. Supports Ethereum, Polygon, Arbitrum, Optimism, Base and all major testnets."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    // Core wallet keywords
    "web3 wallet", "ethereum wallet", "crypto wallet", "test wallet", "developer wallet",
    "mock wallet", "blockchain wallet", "digital wallet", "testnet wallet",
    
    // Developer tools
    "web3 developer tools", "blockchain development", "dapp testing", "smart contract testing",
    "ethereum development tools", "web3 testing tool", "blockchain developer tools",
    
    // WalletConnect
    "walletconnect", "walletconnect v2", "reown wallet", "wallet connection",
    "dapp connector", "web3 connection", "wallet bridge",
    
    // Multi-account features
    "multi account wallet", "multiple wallets", "wallet management", "account switcher",
    "HD wallet", "hierarchical deterministic wallet", "seed phrase wallet",
    
    // Networks
    "ethereum testnet", "sepolia", "goerli", "polygon testnet", "mumbai",
    "arbitrum testnet", "optimism testnet", "base testnet", "mainnet",
    "ethereum mainnet", "polygon mainnet", "layer 2", "L2 wallet",
    
    // Features
    "watch only wallet", "watch only address", "transaction testing",
    "private key import", "mnemonic import", "seed phrase import",
    "wallet testing", "dapp testing wallet", "blockchain testing",
    
    // Use cases
    "blockchain development", "ethereum development", "web3 testing",
    "dapp development", "smart contract development", "defi testing",
    "nft testing", "token testing", "transaction signing",
    
    // Additional
    "browser wallet", "web wallet", "online wallet", "developer sandbox",
    "ethereum sandbox", "web3 sandbox", "blockchain sandbox",
  ],
  authors: [{ name: "Mock Wallet Team" }],
  creator: "Mock Wallet",
  publisher: "Mock Wallet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: siteName,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Mock Wallet - Web3 Developer Testing Tool",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: "@mockwallet",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
  classification: "Web3 Development Tools",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mockwallet.dev"
  
  // SoftwareApplication Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Mock Wallet",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "description": "Professional Web3 development wallet with multi-account management, WalletConnect integration, and comprehensive testnet support for blockchain developers.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1",
    },
    "featureList": [
      "Multi-account management",
      "WalletConnect v2 integration",
      "Watch-only addresses",
      "HD wallet support",
      "Multiple blockchain networks",
      "Transaction signing",
      "Testnet support",
      "Private key import",
      "Mnemonic phrase support",
      "Real-time balance updates",
    ],
    "screenshot": `${siteUrl}/screenshot.png`,
    "softwareVersion": "1.0",
    "datePublished": "2025-12-17",
    "author": {
      "@type": "Organization",
      "name": "Mock Wallet Team",
      "url": siteUrl,
    },
    "provider": {
      "@type": "Organization",
      "name": "Mock Wallet",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`,
      },
    },
    "installUrl": siteUrl,
    "downloadUrl": siteUrl,
    "softwareHelp": {
      "@type": "CreativeWork",
      "url": `${siteUrl}#docs`,
    },
  }

  // WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mock Wallet",
    "alternateName": "Mock Wallet - Web3 Developer Testing Tool",
    "url": siteUrl,
    "description": "Professional Web3 development wallet for blockchain developers",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mock Wallet",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "sameAs": [
      "https://github.com/ChaituVR/mock-wallet",
      "https://twitter.com/mockwallet",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@mockwallet.dev",
    },
  }

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Mock Wallet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mock Wallet is a professional Web3 development wallet designed for blockchain developers to test dApps, smart contracts, and Web3 integrations. It supports multiple accounts, WalletConnect v2, and all major Ethereum testnets.",
        },
      },
      {
        "@type": "Question",
        "name": "Is Mock Wallet safe to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mock Wallet is designed for testing purposes only and should never be used with real funds. It stores private keys in browser localStorage and is not audited for production security. Only use it with testnet tokens.",
        },
      },
      {
        "@type": "Question",
        "name": "How do I connect Mock Wallet to a dApp?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "First, set your Reown Project ID in settings. Then copy the WalletConnect URI from your dApp and paste it into Mock Wallet's connection field. Click PAIR to establish the connection.",
        },
      },
      {
        "@type": "Question",
        "name": "What networks does Mock Wallet support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mock Wallet supports Ethereum (Mainnet & Sepolia), Polygon (Mainnet & Amoy), Arbitrum (One & Sepolia), Optimism (Mainnet & Sepolia), Base (Mainnet & Sepolia), and any custom EVM-compatible chain via RPC URL.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I import my existing wallet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can import wallets using private keys, 12/24-word mnemonic phrases, or add Ethereum addresses as watch-only. You can also import multiple wallets via CSV file for bulk management.",
        },
      },
    ],
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl,
      },
    ],
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Structured Data Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        
        {/* Resource Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://1rpc.io" />
        <link rel="dns-prefetch" href="https://vercel.com" />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mock Wallet" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="rating" content="General" />
        <meta name="distribution" content="global" />
        <meta name="revisit-after" content="7 days" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        
        {/* Pinterest */}
        <meta name="pinterest" content="nopin" />
        
        {/* LinkedIn */}
        <meta property="og:site_name" content="Mock Wallet" />
        <meta property="article:author" content="Mock Wallet Team" />
        
        {/* Google / Search Engine Tags */}
        <meta itemProp="name" content="Mock Wallet" />
        <meta itemProp="description" content="Professional Web3 development wallet with multi-account management" />
        <meta itemProp="image" content={`${siteUrl}/og-image.png`} />
        
        {/* Verification Tags (to be filled) */}
        {/* <meta name="google-site-verification" content="YOUR_CODE" /> */}
        {/* <meta name="msvalidate.01" content="YOUR_CODE" /> */}
        {/* <meta name="yandex-verification" content="YOUR_CODE" /> */}
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        <AnimatedBackground />
        <WalletProvider>{children}</WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
