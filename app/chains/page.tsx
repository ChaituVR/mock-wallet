import { Metadata } from "next"
import Link from "next/link"
import {
  chainSeoData,
  generateMetadata as genMeta,
  siteConfig,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = genMeta({
  title: "Supported Chains - Multi-Chain Web3 Testing",
  description:
    "Mock Wallet supports Ethereum, Polygon, Arbitrum, Optimism, Base, and their testnets. Test your dApps on any EVM-compatible chain.",
  keywords: [
    "multi-chain wallet",
    "ethereum chains",
    "polygon wallet",
    "arbitrum wallet",
    "layer 2 wallet",
    "testnet wallet",
  ],
  path: "/chains",
})

export default function ChainsPage() {
  const breadcrumbs = [
    { name: "Home", url: siteConfig.url },
    { name: "Chains", url: `${siteConfig.url}/chains` },
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateWebPageSchema(
        "Supported Chains",
        "Mock Wallet supports Ethereum, Polygon, Arbitrum, Optimism, Base, and their testnets.",
        `${siteConfig.url}/chains`
      ),
      generateBreadcrumbSchema(breadcrumbs),
    ],
  }

  const mainnets = Object.entries(chainSeoData).filter(([, data]) => !data.isTestnet)
  const testnets = Object.entries(chainSeoData).filter(([, data]) => data.isTestnet)

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
          <li className="font-medium">Chains</li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="border-b border-border bg-background px-4 py-12">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Supported Chains</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Mock Wallet supports all major EVM-compatible chains and their testnets. 
            Test your dApps on Ethereum, Polygon, Arbitrum, Optimism, Base, and more.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          {/* Mainnets */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Mainnets</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {mainnets.map(([key, chain]) => (
                <Link key={key} href={`/chains/${chain.slug}`}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{chain.name}</CardTitle>
                        <Badge>Mainnet</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        {chain.description}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-sm text-primary">
                        View chain details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Testnets */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">Testnets</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {testnets.map(([key, chain]) => (
                <Link key={key} href={`/chains/${chain.slug}`}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{chain.name}</CardTitle>
                        <Badge variant="secondary">Testnet</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        {chain.description}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-sm text-primary">
                        View chain details
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
            <h2 className="text-2xl font-bold">Need a Different Chain?</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Mock Wallet works with any EVM-compatible chain. You can add custom RPC endpoints 
              for chains not listed here.
            </p>
            <div className="mt-6">
              <Link
                href="https://tally.so/r/w4kBlA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Request a new chain →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
