import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  featureSeoData,
  generateMetadata as genMeta,
  getAllFeatureSlugs,
  siteConfig,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllFeatureSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const featureData = featureSeoData[slug]
  if (!featureData) return {}

  return genMeta({
    title: featureData.title,
    description: featureData.description,
    keywords: featureData.keywords,
    path: `/features/${slug}`,
  })
}

// Feature-specific content
const featureContent: Record<string, {
  benefits: string[]
  howItWorks: { step: number; title: string; description: string }[]
}> = {
  "multi-account": {
    benefits: [
      "Create unlimited test accounts from one HD wallet",
      "Label accounts for easy organization (e.g., 'Admin', 'User', 'Attacker')",
      "Switch accounts instantly with keyboard shortcuts",
      "Bulk import accounts via CSV",
      "Export accounts for backup or sharing",
    ],
    howItWorks: [
      { step: 1, title: "Create or Import Wallet", description: "Start with a seed phrase or generate a new one" },
      { step: 2, title: "Derive Accounts", description: "Create as many accounts as you need from the HD path" },
      { step: 3, title: "Label Accounts", description: "Give each account a meaningful label" },
      { step: 4, title: "Switch Instantly", description: "Use keyboard shortcuts or the dropdown to switch" },
    ],
  },
  walletconnect: {
    benefits: [
      "Connect to any WalletConnect v2 compatible dApp",
      "Scan QR codes or paste connection URIs",
      "Multi-session support for testing multiple dApps",
      "Session management with easy disconnect",
      "Automatic chain switching on request",
    ],
    howItWorks: [
      { step: 1, title: "Open Your dApp", description: "Navigate to the dApp you want to test" },
      { step: 2, title: "Click Connect Wallet", description: "Look for WalletConnect option in the dApp" },
      { step: 3, title: "Scan or Paste", description: "Use Mock Wallet to scan the QR or paste the URI" },
      { step: 4, title: "Approve Connection", description: "Confirm the connection request" },
    ],
  },
  "transaction-simulator": {
    benefits: [
      "Preview transaction outcomes before signing",
      "See gas cost estimates in real-time",
      "Decode function calls to readable format",
      "Risk assessment for suspicious transactions",
      "Balance change predictions",
    ],
    howItWorks: [
      { step: 1, title: "Receive Transaction Request", description: "Your dApp sends a transaction to sign" },
      { step: 2, title: "Auto-Simulation", description: "Mock Wallet simulates against the current state" },
      { step: 3, title: "Review Results", description: "Check gas, decoded data, and risk warnings" },
      { step: 4, title: "Sign or Reject", description: "Make an informed decision" },
    ],
  },
  "watch-only": {
    benefits: [
      "Monitor any address without private keys",
      "View dApp interfaces from any wallet's perspective",
      "Test UI for different account states",
      "Portfolio tracking and observation",
      "Impersonate any address for testing",
    ],
    howItWorks: [
      { step: 1, title: "Add Watch Address", description: "Enter any Ethereum address to watch" },
      { step: 2, title: "Browse as Address", description: "View dApps from that address's perspective" },
      { step: 3, title: "See Balances", description: "View token balances and NFTs" },
      { step: 4, title: "Test UI States", description: "See how dApps display for different users" },
    ],
  },
  "url-import": {
    benefits: [
      "Import wallet config via URL parameters",
      "Zero manual setup for CI/CD",
      "Share test configurations easily",
      "Reproducible test environments",
      "Support for private keys and mnemonics",
    ],
    howItWorks: [
      { step: 1, title: "Construct URL", description: "Add wallet parameters to the URL" },
      { step: 2, title: "Open URL", description: "Navigate to the parameterized URL" },
      { step: 3, title: "Auto-Import", description: "Wallet is automatically configured" },
      { step: 4, title: "Ready to Test", description: "Start testing immediately" },
    ],
  },
  "agent-mode": {
    benefits: [
      "Automatically approve all WalletConnect session proposals",
      "Auto-sign messages and transactions without manual interaction",
      "Essential for CI/CD pipelines and E2E testing (Cypress, Playwright)",
      "Enable via UI toggle, command palette (Cmd/Ctrl+K), or URL parameter (?agent=true)",
      "Combine with ?wc=URI for fully automated dApp connections",
      "Persisted across sessions via localStorage",
      "Falls back to manual mode on any error",
    ],
    howItWorks: [
      { step: 1, title: "Enable Agent Mode", description: "Toggle via WalletConnect panel, command palette (Cmd/Ctrl+K → 'Agent Mode'), or add ?agent=true to URL" },
      { step: 2, title: "Connect dApp", description: "Pair with your dApp as usual — or use ?wc=URI for auto-connect. Proposals are auto-approved." },
      { step: 3, title: "Auto-Sign", description: "All signing and transaction requests are approved automatically with toast notifications" },
      { step: 4, title: "Review & Export", description: "Check request history, copy results, and export logs as JSON" },
    ],
  },
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params
  const featureData = featureSeoData[slug]

  if (!featureData) {
    notFound()
  }

  const content = featureContent[slug] || {
    benefits: [],
    howItWorks: [],
  }

  const breadcrumbs = [
    { name: "Home", url: siteConfig.url },
    { name: "Features", url: `${siteConfig.url}/features` },
    { name: featureData.name, url: `${siteConfig.url}/features/${slug}` },
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateWebPageSchema(
        featureData.title,
        featureData.description,
        `${siteConfig.url}/features/${slug}`
      ),
      generateBreadcrumbSchema(breadcrumbs),
    ],
  }

  // Get other features for internal linking
  const otherFeatures = Object.entries(featureSeoData)
    .filter(([key]) => key !== slug)
    .slice(0, 3)

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
            <Link href="/features" className="text-muted-foreground hover:text-foreground">
              Features
            </Link>
          </li>
          <span className="text-muted-foreground">/</span>
          <li className="font-medium">{featureData.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="border-b border-border bg-background px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/features"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All Features
          </Link>

          <h1 className="text-3xl font-bold md:text-4xl">{featureData.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{featureData.description}</p>

          <div className="mt-6">
            <Button asChild>
              <Link href="/">Try It Now</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          {/* Benefits */}
          {content.benefits.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">Key Benefits</h2>
              <div className="space-y-3">
                {content.benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3 rounded-lg border border-border p-4"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* How It Works */}
          {content.howItWorks.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">How It Works</h2>
              <div className="space-y-4">
                {content.howItWorks.map((item) => (
                  <div key={item.step} className="flex gap-4 rounded-lg border border-border p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Features */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">Related Features</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {otherFeatures.map(([key, feature]) => (
                <Link key={key} href={`/features/${feature.slug}`}>
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

          {/* CTA */}
          <section className="mt-12 rounded-lg border-2 border-border bg-muted/30 p-8 text-center">
            <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Mock Wallet is free, open-source, and works entirely in your browser.
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
