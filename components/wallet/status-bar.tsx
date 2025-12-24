'use client'

import { useWallet } from '@/lib/wallet/wallet-provider'
import { SUPPORTED_CHAINS, getChainById } from '@/lib/wallet/chain-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe, Wallet, Coins, Zap, MessageSquarePlus } from 'lucide-react'

export function StatusBar() {
  const { 
    activeAccount, 
    chainId, 
    balance, 
    balanceLoading,
    switchChain,
    accounts,
    activeAccountIndex
  } = useWallet()

  if (!activeAccount || !chainId) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b-[3px] border-foreground/20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>No wallet connected</span>
          </div>
        </div>
      </div>
    )
  }

  const currentChain = getChainById(chainId)
  const currentAccount = accounts?.[activeAccountIndex]
  const accountLabel = currentAccount?.label || `Account ${activeAccountIndex + 1}`

  // Format balance
  const balanceDisplay = balance 
    ? parseFloat(balance).toFixed(4)
    : '0.0000'

  // Check if balance is zero for warning
  const isZeroBalance = parseFloat(balance) === 0

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b-[3px] border-foreground">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Left: Chain Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select
              value={chainId.toString()}
              onValueChange={(value) => switchChain(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-45 border-2 focus:ring-offset-0">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-none bg-primary"
                    />
                    <span className="font-mono text-xs">
                      {currentChain?.name || 'Unknown'}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border-[3px]">
                <SelectGroup>
                  <SelectLabel className="font-mono text-xs">Switch Chain</SelectLabel>
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem 
                      key={chain.chainId} 
                      value={chain.chainId.toString()}
                      className="font-mono text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-none bg-primary"
                        />
                        {chain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Network Type Badge */}
          {currentChain?.testnet ? (
            <Badge 
              variant="outline" 
              className="border-2 rounded-none px-2 py-0.5 text-xs font-mono bg-warning/10 text-warning dark:text-warning border-warning/50"
            >
              TESTNET
            </Badge>
          ) : (
            <Badge 
              variant="outline" 
              className="border-2 rounded-none px-2 py-0.5 text-xs font-mono bg-primary/10 text-primary border-primary/50"
            >
              MAINNET
            </Badge>
          )}
        </div>

        {/* Center: Account Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Account Color Indicator */}
            {currentAccount?.color && (
              <div 
                className="w-3 h-3 rounded-full border-2 border-foreground"
                style={{ backgroundColor: currentAccount.color }}
              />
            )}
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">
              {accountLabel}
            </span>
            <Badge 
              variant="secondary" 
              className="border-2 rounded-none px-2 py-0.5 text-xs font-mono"
            >
              {activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}
            </Badge>
          </div>
        </div>

        {/* Right: Balance & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-muted-foreground" />
            <span 
              className={`font-mono text-sm font-semibold ${
                isZeroBalance ? 'text-yellow-500' : 'text-foreground'
              }`}
            >
              {balanceDisplay} {currentChain?.nativeCurrency.symbol || 'ETH'}
            </span>
          </div>

          {/* Loading indicator */}
          {balanceLoading && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Syncing...</span>
            </div>
          )}

          {/* Zero balance warning with quick faucet link */}
          {isZeroBalance && !balanceLoading && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs border-2 border-warning bg-warning  hover:bg-warning/90 font-mono font-bold uppercase"
              onClick={() => {
                // Get faucet URL based on chain
                const faucetUrls: Record<number, string> = {
                  11155111: 'https://sepoliafaucet.com', // Sepolia
                  80002: 'https://faucet.polygon.technology/', // Polygon Amoy
                  84532: 'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet', // Base Sepolia
                  421614: 'https://faucet.quicknode.com/arbitrum/sepolia', // Arbitrum Sepolia
                  10: 'https://app.optimism.io/faucet', // Optimism (Mainnet but has faucet)
                }
                const faucetUrl = faucetUrls[chainId] || 'https://faucetlink.to/sepolia'
                window.open(faucetUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              Get Test Funds
            </Button>
          )}
        </div>

        {/* Right: Feature Request */}
        <div className="hidden sm:flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://tally.so/r/jabg9R', '_blank')}
            className="h-8 font-mono text-xs hover:bg-primary/10 gap-1.5"
            title="Request a feature or report an issue"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Feedback</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
