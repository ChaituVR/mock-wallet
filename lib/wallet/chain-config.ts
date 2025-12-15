export interface ChainConfig {
  chainId: number
  name: string
  network: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: {
    default: { http: string[] }
    public: { http: string[] }
  }
  blockExplorers: {
    default: { name: string; url: string }
  }
  testnet: boolean
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    chainId: 11155111,
    name: "Sepolia",
    network: "sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://1rpc.io/sepolia"] },
      public: { http: ["https://1rpc.io/sepolia"] },
    },
    blockExplorers: {
      default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
    },
    testnet: true,
  },
  {
    chainId: 80002,
    name: "Polygon Amoy",
    network: "polygon-amoy",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://rpc-amoy.polygon.technology"] },
      public: { http: ["https://rpc-amoy.polygon.technology"] },
    },
    blockExplorers: {
      default: { name: "PolygonScan", url: "https://amoy.polygonscan.com" },
    },
    testnet: true,
  },
  {
    chainId: 84532,
    name: "Base Sepolia",
    network: "base-sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://sepolia.base.org"] },
      public: { http: ["https://sepolia.base.org"] },
    },
    blockExplorers: {
      default: { name: "BaseScan", url: "https://sepolia.basescan.org" },
    },
    testnet: true,
  },
  {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    network: "arbitrum-sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] },
      public: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] },
    },
    blockExplorers: {
      default: { name: "Arbiscan", url: "https://sepolia.arbiscan.io" },
    },
    testnet: true,
  },
  {
    chainId: 11155420,
    name: "Optimism Sepolia",
    network: "optimism-sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ["https://sepolia.optimism.io"] },
      public: { http: ["https://sepolia.optimism.io"] },
    },
    blockExplorers: {
      default: {
        name: "Optimism Explorer",
        url: "https://sepolia-optimism.etherscan.io",
      },
    },
    testnet: true,
  },
]

export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId)
}

export function getChainRpcUrl(chainId: number, projectId?: string): string {
  const chain = getChainById(chainId)
  if (!chain) return ""

  const rpcUrl = chain.rpcUrls.default.http[0]

  // Add Infura/Alchemy project ID if provided and it's an Infura/Alchemy URL
  if (projectId && (rpcUrl.includes("infura.io") || rpcUrl.includes("alchemy.com"))) {
    return `${rpcUrl}/${projectId}`
  }

  return rpcUrl
}
