import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  useCaseSeoData,
  generateMetadata as genMeta,
  getAllUseCaseSlugs,
  siteConfig,
  generateWebPageSchema,
  generateBreadcrumbSchema,
  featureSeoData,
} from "@/lib/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllUseCaseSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const useCaseData = useCaseSeoData[slug]
  if (!useCaseData) return {}

  return genMeta({
    title: useCaseData.title,
    description: useCaseData.description,
    keywords: useCaseData.keywords,
    path: `/use-cases/${slug}`,
  })
}

// Use case specific content
const useCaseContent: Record<string, {
  challenges: string[]
  solutions: { title: string; description: string }[]
  recommendedFeatures: string[]
}> = {
  "dapp-testing": {
    challenges: [
      "Need to test with multiple user accounts",
      "Don't want to risk real funds during testing",
      "Need to simulate different wallet states",
      "Want to test across multiple chains",
    ],
    solutions: [
      {
        title: "Multi-Account Testing",
        description: "Create unlimited test accounts to simulate different user scenarios",
      },
      {
        title: "Testnet Support",
        description: "Use testnets with free test tokens for risk-free testing",
      },
      {
        title: "Transaction Simulation",
        description: "Preview what will happen before confirming transactions",
      },
      {
        title: "Watch-Only Mode",
        description: "Impersonate any address to test UI states without private keys",
      },
    ],
    recommendedFeatures: ["multi-account", "walletconnect", "transaction-simulator", "watch-only"],
  },
  "smart-contract-development": {
    challenges: [
      "Need to test contract interactions thoroughly",
      "Want to debug failed transactions",
      "Need to verify function call parameters",
      "Testing requires multiple accounts with different roles",
    ],
    solutions: [
      {
        title: "Transaction Decoding",
        description: "See decoded function calls and parameters before signing",
      },
      {
        title: "Gas Estimation",
        description: "Get accurate gas estimates to optimize your contracts",
      },
      {
        title: "Role-Based Testing",
        description: "Label accounts by role (owner, admin, user) for organized testing",
      },
      {
        title: "Error Simulation",
        description: "Catch reverts and errors before they happen on-chain",
      },
    ],
    recommendedFeatures: ["transaction-simulator", "multi-account", "walletconnect"],
  },
  "defi-testing": {
    challenges: [
      "Complex multi-step transactions (approve + swap)",
      "Need to test with various token amounts",
      "Risk of losing funds during testing",
      "Multiple protocols and chains to test",
    ],
    solutions: [
      {
        title: "ERC-20 Token Support",
        description: "Manage and track test tokens across protocols",
      },
      {
        title: "Multi-Chain Testing",
        description: "Test on Ethereum, Polygon, Arbitrum, and more",
      },
      {
        title: "Transaction Preview",
        description: "See token approvals and swaps before execution",
      },
      {
        title: "Balance Tracking",
        description: "Monitor balance changes across interactions",
      },
    ],
    recommendedFeatures: ["transaction-simulator", "multi-account", "walletconnect"],
  },
  "nft-development": {
    challenges: [
      "Testing minting flows end-to-end",
      "Verifying metadata displays correctly",
      "Testing marketplace integrations",
      "Need to test as different collectors",
    ],
    solutions: [
      {
        title: "NFT Transaction Support",
        description: "Full support for ERC-721 and ERC-1155 transactions",
      },
      {
        title: "Multi-Collector Testing",
        description: "Create multiple accounts to simulate collectors",
      },
      {
        title: "Marketplace Integration",
        description: "Connect to OpenSea, Blur, and other marketplaces via WalletConnect",
      },
      {
        title: "Gas Optimization",
        description: "See gas costs for minting before going to production",
      },
    ],
    recommendedFeatures: ["multi-account", "walletconnect", "transaction-simulator"],
  },
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params
  const useCaseData = useCaseSeoData[slug]

  if (!useCaseData) {
    notFound()
  }

  const content = useCaseContent[slug] || {
    challenges: [],
    solutions: [],
    recommendedFeatures: [],
  }

  const breadcrumbs = [
    { name: "Home", url: siteConfig.url },
    { name: "Use Cases", url: `${siteConfig.url}/use-cases` },
    { name: useCaseData.name, url: `${siteConfig.url}/use-cases/${slug}` },
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateWebPageSchema(
        useCaseData.title,
        useCaseData.description,
        `${siteConfig.url}/use-cases/${slug}`
      ),
      generateBreadcrumbSchema(breadcrumbs),
    ],
  }

  // Get other use cases for internal linking
  const otherUseCases = Object.entries(useCaseSeoData)
    .filter(([key]) => key !== slug)
    .slice(0, 3)

  // Get recommended feature details
  const recommendedFeatures = content.recommendedFeatures
    .map((key) => featureSeoData[key])
    .filter(Boolean)

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
            <Link href="/use-cases" className="text-muted-foreground hover:text-foreground">
              Use Cases
            </Link>
          </li>
          <span className="text-muted-foreground">/</span>
          <li className="font-medium">{useCaseData.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="border-b border-border bg-background px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/use-cases"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All Use Cases
          </Link>

          <h1 className="text-3xl font-bold md:text-4xl">{useCaseData.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{useCaseData.description}</p>

          <div className="mt-6">
            <Button asChild>
              <Link href="/">Start Testing</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          {/* Challenges */}
          {content.challenges.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">Common Challenges</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {content.challenges.map((challenge) => (
                  <div
                    key={challenge}
                    className="flex items-start gap-3 rounded-lg bg-muted/50 p-4"
                  >
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span className="text-sm">{challenge}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Solutions */}
          {content.solutions.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">How Mock Wallet Helps</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {content.solutions.map((solution) => (
                  <Card key={solution.title}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg">{solution.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{solution.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Recommended Features */}
          {recommendedFeatures.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">Recommended Features</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendedFeatures.map((feature) => (
                  <Link key={feature.slug} href={`/features/${feature.slug}`}>
                    <Card className="h-full transition-colors hover:border-primary">
                      <CardHeader>
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2">
                          {feature.description}
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
          )}

          {/* Related Use Cases */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">Related Use Cases</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {otherUseCases.map(([key, useCase]) => (
                <Link key={key} href={`/use-cases/${useCase.slug}`}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardHeader>
                      <CardTitle className="text-lg">{useCase.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        {useCase.description}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-sm text-primary">
                        Explore
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
            <h2 className="text-2xl font-bold">Ready for {useCaseData.name}?</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Mock Wallet is free, open-source, and designed for developers like you.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/">Open Mock Wallet</Link>
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
