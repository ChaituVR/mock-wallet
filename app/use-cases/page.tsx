import { Metadata } from "next"
import Link from "next/link"
import {
  useCaseSeoData,
  generateMetadata as genMeta,
  siteConfig,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = genMeta({
  title: "Use Cases - Web3 Development Testing Scenarios",
  description:
    "Mock Wallet supports dApp testing, smart contract development, DeFi protocol testing, NFT development, and more.",
  keywords: [
    "dapp testing",
    "smart contract development",
    "defi testing",
    "nft development",
    "web3 development",
  ],
  path: "/use-cases",
})

export default function UseCasesPage() {
  const breadcrumbs = [
    { name: "Home", url: siteConfig.url },
    { name: "Use Cases", url: `${siteConfig.url}/use-cases` },
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateWebPageSchema(
        "Use Cases",
        "Mock Wallet supports dApp testing, smart contract development, DeFi protocol testing, NFT development, and more.",
        `${siteConfig.url}/use-cases`
      ),
      generateBreadcrumbSchema(breadcrumbs),
    ],
  }

  const useCases = Object.entries(useCaseSeoData)

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
          <li className="font-medium">Use Cases</li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="border-b border-border bg-background px-4 py-12">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Use Cases</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Mock Wallet is designed for various Web3 development scenarios. 
            Find the best approach for your specific use case.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {useCases.map(([key, useCase]) => (
              <Link key={key} href={`/use-cases/${useCase.slug}`}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader>
                    <CardTitle className="text-xl">{useCase.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {useCase.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center text-sm text-primary">
                      Learn how to test
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <section className="mt-12 rounded-lg border-2 border-border bg-muted/30 p-8 text-center">
            <h2 className="text-2xl font-bold">Have a Different Use Case?</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Mock Wallet is flexible and can support many testing scenarios. 
              Let us know what you&apos;re building!
            </p>
            <div className="mt-6">
              <Link
                href="https://tally.so/r/w4kBlA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Share your use case →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
