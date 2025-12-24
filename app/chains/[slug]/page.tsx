import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  chainSeoData,
  generateMetadata as genMeta,
  getAllChainSlugs,
  siteConfig,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo"
import { SUPPORTED_CHAINS } from "@/lib/wallet/chain-config"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Droplets,
  ExternalLink,
  Globe,
  Layers,
  Link2,
  Wallet,
} from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllChainSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const chainData = chainSeoData[slug]
  if (!chainData) return {}

  return genMeta({
    title: `${chainData.name} Wallet - Test dApps on ${chainData.name}`,
    description: chainData.description,
    keywords: chainData.keywords,
    path: `/chains/${slug}`,
  })
}

export default async function ChainPage({ params }: Props) {
  const { slug } = await params
  const chainData = chainSeoData[slug]

  if (!chainData) {
    notFound()
  }

  // Find matching chain config
  const chainConfig = SUPPORTED_CHAINS.find(
    (c) => c.network === slug || c.name.toLowerCase().replace(/\s+/g, "-") === slug
  )

  const breadcrumbs = [
    { name: "Home", url: siteConfig.url },
    { name: "Chains", url: `${siteConfig.url}/chains` },
    { name: chainData.name, url: `${siteConfig.url}/chains/${slug}` },
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateWebPageSchema(
        `${chainData.name} Wallet`,
        chainData.description,
        `${siteConfig.url}/chains/${slug}`
      ),
      generateBreadcrumbSchema(breadcrumbs),
    ],
  }

  const features = [
    {
      icon: Wallet,
      title: "Multi-Account Support",
      description: `Create and manage unlimited test accounts on ${chainData.name}`,
    },
    {
      icon: Link2,
      title: "WalletConnect v2",
      description: `Connect to any ${chainData.name} dApp using WalletConnect`,
    },
    {
      icon: Layers,
      title: "Transaction Simulation",
      description: "Preview transaction outcomes before signing",
    },
    {
      icon: Globe,
      title: "Block Explorer",
      description: chainConfig
        ? `View transactions on ${chainConfig.blockExplorers.default.name}`
        : "View transactions on chain explorer",
    },
  ]

  // Get other chains for internal linking
  const otherChains = Object.entries(chainSeoData)
    .filter(([key]) => key !== slug)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumbs */}
      <nav className="border-b border-border px-4 py-3" aria-label="Breadcrumb">
        <ol className="container mx-auto flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
          </li>
          <span className="text-muted-foreground">/</span>
          <li>
            <Link href="/chains" className="text-muted-foreground hover:text-foreground">
              Chains
            </Link>
          </li>
          <span className="text-muted-foreground">/</span>
          <li className="font-medium">{chainData.name}</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <header className="border-b border-border bg-background px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Mock Wallet
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold md:text-4xl">
                  {chainData.name}
                </h1>
                <Badge variant={chainData.isTestnet ? "secondary" : "default"}>
                  {chainData.isTestnet ? "Testnet" : "Mainnet"}
                </Badge>
              </div>

              <p className="mt-4 text-lg text-muted-foreground">
                {chainData.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/">
                    <Wallet className="mr-2 h-4 w-4" />
                    Open Mock Wallet
                  </Link>
                </Button>
                {chainData.faucetUrl && (
                  <Button variant="outline" asChild>
                    <a
                      href={chainData.faucetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Droplets className="mr-2 h-4 w-4" />
                      Get Test Tokens
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          {/* Chain Info */}
          {chainConfig && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">Network Details</h2>
              <Card>
                <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Chain ID</p>
                    <p className="font-mono font-medium">{chainConfig.chainId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Native Currency</p>
                    <p className="font-medium">
                      {chainConfig.nativeCurrency.name} ({chainConfig.nativeCurrency.symbol})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Network</p>
                    <p className="font-medium">{chainConfig.network}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Block Explorer</p>
                    <a
                      href={chainConfig.blockExplorers.default.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      {chainConfig.blockExplorers.default.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Features */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">
              Mock Wallet Features for {chainData.name}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">
              How to Test on {chainData.name}
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Open Mock Wallet",
                  description: "Navigate to mockwallet.dev and create or import a wallet",
                },
                {
                  step: 2,
                  title: `Select ${chainData.name}`,
                  description: `Choose ${chainData.name} from the chain selector dropdown`,
                },
                chainData.isTestnet && {
                  step: 3,
                  title: "Get Test Tokens",
                  description: `Use the faucet to get free test ${
                    chainConfig?.nativeCurrency.symbol || "tokens"
                  }`,
                },
                {
                  step: chainData.isTestnet ? 4 : 3,
                  title: "Connect to Your dApp",
                  description: "Scan the WalletConnect QR code or paste the connection URI",
                },
                {
                  step: chainData.isTestnet ? 5 : 4,
                  title: "Test Transactions",
                  description: "Send transactions, sign messages, and debug your dApp",
                },
              ]
                .filter(Boolean)
                .map((item) => (
                  <div
                    key={item.step}
                    className="flex gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">
              What You Can Test on {chainData.name}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Smart contract interactions",
                "Token transfers (ERC-20, ERC-721, ERC-1155)",
                "DeFi protocol integrations",
                "NFT minting and trading",
                "Multi-signature transactions",
                "Gas estimation and optimization",
              ].map((useCase) => (
                <div
                  key={useCase}
                  className="flex items-center gap-2 rounded-lg bg-muted/50 p-3"
                >
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-sm">{useCase}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Related Chains */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">Other Supported Chains</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {otherChains.map(([key, chain]) => (
                <Link key={key} href={`/chains/${chain.slug}`}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{chain.name}</CardTitle>
                        <Badge variant={chain.isTestnet ? "secondary" : "default"}>
                          {chain.isTestnet ? "Testnet" : "Mainnet"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        {chain.description}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-sm text-primary">
                        Learn more
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-12 rounded-lg border-2 border-border bg-muted/30 p-8 text-center">
            <h2 className="text-2xl font-bold">Ready to Test on {chainData.name}?</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Mock Wallet is free, open-source, and works entirely in your browser.
              No downloads required.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/">Start Testing Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">Read Documentation</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
