export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  logoURI?: string
  isCustom?: boolean
}

// Standard ERC20 ABI for balance and transfer
export const ERC20_ABI = [
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  // Write functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

// Common tokens per chain
export const DEFAULT_TOKENS: Record<number, Token[]> = {
  // Ethereum Mainnet
  1: [
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 1,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      chainId: 1,
      logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      chainId: 1,
      logoURI: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
    },
    {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      chainId: 1,
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    },
  ],
  // Sepolia Testnet
  11155111: [
    {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      symbol: "USDC",
      name: "USD Coin (Testnet)",
      decimals: 6,
      chainId: 11155111,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    },
    {
      address: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
      symbol: "WETH",
      name: "Wrapped Ether (Testnet)",
      decimals: 18,
      chainId: 11155111,
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    },
  ],
  // Polygon Mainnet
  137: [
    {
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 137,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    },
    {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      chainId: 137,
      logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    },
    {
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      chainId: 137,
      logoURI: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
    },
    {
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      chainId: 137,
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    },
    {
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      symbol: "WMATIC",
      name: "Wrapped Matic",
      decimals: 18,
      chainId: 137,
      logoURI: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
    },
  ],
  // Polygon Amoy Testnet
  80002: [
    {
      address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
      symbol: "USDC",
      name: "USD Coin (Testnet)",
      decimals: 6,
      chainId: 80002,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    },
  ],
  // BSC Mainnet
  56: [
    {
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 18,
      chainId: 56,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    },
    {
      address: "0x55d398326f99059fF775485246999027B3197955",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 18,
      chainId: 56,
      logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    },
    {
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      symbol: "BUSD",
      name: "Binance USD",
      decimals: 18,
      chainId: 56,
      logoURI: "https://assets.coingecko.com/coins/images/9576/small/BUSD.png",
    },
    {
      address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      chainId: 56,
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    },
    {
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      symbol: "WBNB",
      name: "Wrapped BNB",
      decimals: 18,
      chainId: 56,
      logoURI: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    },
  ],
  // BSC Testnet
  97: [
    {
      address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
      symbol: "USDT",
      name: "Tether USD (Testnet)",
      decimals: 18,
      chainId: 97,
      logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    },
  ],
  // Arbitrum One
  42161: [
    {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 42161,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    },
    {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      chainId: 42161,
      logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    },
    {
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      chainId: 42161,
      logoURI: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
    },
    {
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      chainId: 42161,
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    },
  ],
  // Optimism
  10: [
    {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 10,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    },
    {
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      chainId: 10,
      logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    },
    {
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      chainId: 10,
      logoURI: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
    },
    {
      address: "0x4200000000000000000000000000000000000006",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      chainId: 10,
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    },
  ],
  // Base
  8453: [
    {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 8453,
      logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    },
    {
      address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      chainId: 8453,
      logoURI: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
    },
    {
      address: "0x4200000000000000000000000000000000000006",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      chainId: 8453,
      logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    },
  ],
}

// Get tokens for a specific chain
export function getTokensForChain(chainId: number): Token[] {
  return DEFAULT_TOKENS[chainId] || []
}

// Get token by address
export function getTokenByAddress(chainId: number, address: string): Token | undefined {
  const tokens = getTokensForChain(chainId)
  return tokens.find((t) => t.address.toLowerCase() === address.toLowerCase())
}
