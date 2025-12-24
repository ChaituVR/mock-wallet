"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ethers } from "ethers"
import { 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  ArrowRight, 
  Fuel, 
  DollarSign,
  Shield,
  AlertCircle,
  Zap,
  Info,
  Copy,
  Check
} from "lucide-react"
import { getChainById, SUPPORTED_CHAINS } from "@/lib/wallet/chain-config"

export interface TransactionData {
  to: string
  from?: string
  value?: string | bigint
  data?: string
  gasLimit?: string | bigint
  gasPrice?: string | bigint
  maxFeePerGas?: string | bigint
  maxPriorityFeePerGas?: string | bigint
  nonce?: number
  chainId?: number
}

export interface SimulationResult {
  success: boolean
  gasUsed: string
  gasEstimate: string
  effectiveGasPrice: string
  totalCost: string
  balanceAfter: string
  balanceChange: string
  error?: string
  warnings: string[]
  decodedFunction?: {
    name: string
    args: Record<string, any>
  }
  stateChanges?: {
    type: 'transfer' | 'approval' | 'contract_call' | 'native_transfer'
    description: string
  }[]
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
}

interface TransactionSimulatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: TransactionData | null
  chainId: number
  fromAddress: string
  onProceed: () => void
  onCancel: () => void
}

// Common ERC20 function signatures
const ERC20_SIGNATURES: Record<string, { name: string; args: string[] }> = {
  "0xa9059cbb": { name: "transfer", args: ["recipient", "amount"] },
  "0x095ea7b3": { name: "approve", args: ["spender", "amount"] },
  "0x23b872dd": { name: "transferFrom", args: ["from", "to", "amount"] },
  "0x70a08231": { name: "balanceOf", args: ["account"] },
  "0xdd62ed3e": { name: "allowance", args: ["owner", "spender"] },
}

// Known contract patterns
const KNOWN_PATTERNS = {
  UNLIMITED_APPROVAL: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
}

export function TransactionSimulator({
  open,
  onOpenChange,
  transaction,
  chainId,
  fromAddress,
  onProceed,
  onCancel,
}: TransactionSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [currentBalance, setCurrentBalance] = useState<string>("0")
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const chain = getChainById(chainId)

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  const chainConfig = SUPPORTED_CHAINS.find((c) => c.chainId === chainId)

  useEffect(() => {
    if (open && transaction) {
      runSimulation()
    } else {
      setSimulationResult(null)
    }
  }, [open, transaction])

  const runSimulation = async () => {
    if (!transaction || !chainConfig) return

    setIsSimulating(true)
    setSimulationResult(null)

    try {
      const rpcUrl = chainConfig.rpcUrls.default.http[0]
      const provider = new ethers.JsonRpcProvider(rpcUrl)

      // Fetch current balance
      const balance = await provider.getBalance(fromAddress)
      setCurrentBalance(ethers.formatEther(balance))

      // Analyze transaction
      const warnings: string[] = []
      const riskFactors: string[] = []
      let riskLevel: 'low' | 'medium' | 'high' = 'low'
      const stateChanges: SimulationResult['stateChanges'] = []
      let decodedFunction: SimulationResult['decodedFunction'] = undefined

      // Parse transaction value
      const txValue = transaction.value 
        ? (typeof transaction.value === 'string' 
            ? BigInt(transaction.value) 
            : transaction.value)
        : BigInt(0)

      // Decode function call if data exists
      if (transaction.data && transaction.data !== '0x' && transaction.data.length >= 10) {
        const selector = transaction.data.slice(0, 10).toLowerCase()
        const knownFunction = ERC20_SIGNATURES[selector]

        if (knownFunction) {
          decodedFunction = {
            name: knownFunction.name,
            args: {}
          }

          try {
            if (knownFunction.name === 'transfer') {
              const iface = new ethers.Interface([
                "function transfer(address to, uint256 amount)"
              ])
              const decoded = iface.decodeFunctionData('transfer', transaction.data)
              decodedFunction.args = {
                to: decoded[0],
                amount: ethers.formatUnits(decoded[1], 18)
              }
              stateChanges.push({
                type: 'transfer',
                description: `Transfer ${decodedFunction.args.amount} tokens to ${decoded[0].slice(0, 6)}...${decoded[0].slice(-4)}`
              })
            } else if (knownFunction.name === 'approve') {
              const iface = new ethers.Interface([
                "function approve(address spender, uint256 amount)"
              ])
              const decoded = iface.decodeFunctionData('approve', transaction.data)
              const amountHex = decoded[1].toString(16).padStart(64, '0')
              
              decodedFunction.args = {
                spender: decoded[0],
                amount: amountHex === KNOWN_PATTERNS.UNLIMITED_APPROVAL.slice(2) 
                  ? 'UNLIMITED' 
                  : ethers.formatUnits(decoded[1], 18)
              }
              
              stateChanges.push({
                type: 'approval',
                description: `Approve ${decodedFunction.args.amount} tokens for ${decoded[0].slice(0, 6)}...${decoded[0].slice(-4)}`
              })

              // Unlimited approval warning
              if (decodedFunction.args.amount === 'UNLIMITED') {
                warnings.push('⚠️ UNLIMITED APPROVAL: This approves unlimited tokens for the spender')
                riskFactors.push('Unlimited token approval detected')
                riskLevel = 'high'
              }
            } else if (knownFunction.name === 'transferFrom') {
              const iface = new ethers.Interface([
                "function transferFrom(address from, address to, uint256 amount)"
              ])
              const decoded = iface.decodeFunctionData('transferFrom', transaction.data)
              decodedFunction.args = {
                from: decoded[0],
                to: decoded[1],
                amount: ethers.formatUnits(decoded[2], 18)
              }
              stateChanges.push({
                type: 'transfer',
                description: `TransferFrom ${decodedFunction.args.amount} tokens from ${decoded[0].slice(0, 6)}... to ${decoded[1].slice(0, 6)}...`
              })
            }
          } catch (decodeError) {
            console.log("[v0] Could not decode function parameters:", decodeError)
          }
        } else {
          stateChanges.push({
            type: 'contract_call',
            description: `Contract call with selector ${selector}`
          })
          riskFactors.push('Unknown contract function')
          if (riskLevel === 'low') riskLevel = 'medium'
        }
      }

      // Native transfer detection
      if (txValue > BigInt(0)) {
        stateChanges.push({
          type: 'native_transfer',
          description: `Send ${ethers.formatEther(txValue)} ${chain?.nativeCurrency.symbol || 'ETH'}`
        })
      }

      // Estimate gas
      let gasEstimate: bigint
      try {
        gasEstimate = await provider.estimateGas({
          from: fromAddress,
          to: transaction.to,
          value: txValue,
          data: transaction.data || '0x',
        })
      } catch (estimateError) {
        // Transaction would fail
        const errorMessage = estimateError instanceof Error ? estimateError.message : 'Unknown error'
        setSimulationResult({
          success: false,
          gasUsed: '0',
          gasEstimate: '0',
          effectiveGasPrice: '0',
          totalCost: '0',
          balanceAfter: ethers.formatEther(balance),
          balanceChange: '0',
          error: `Transaction simulation failed: ${errorMessage}`,
          warnings: ['Transaction will likely fail on chain'],
          riskLevel: 'high',
          riskFactors: ['Transaction simulation failed'],
        })
        setIsSimulating(false)
        return
      }

      // Get gas price
      const feeData = await provider.getFeeData()
      const effectiveGasPrice = feeData.gasPrice || BigInt(0)

      // Calculate total cost
      const gasCost = gasEstimate * effectiveGasPrice
      const totalCost = gasCost + txValue

      // Balance checks
      if (balance < totalCost) {
        warnings.push(`⚠️ INSUFFICIENT BALANCE: You need ${ethers.formatEther(totalCost)} ${chain?.nativeCurrency.symbol}, but have ${ethers.formatEther(balance)}`)
        riskFactors.push('Insufficient balance for transaction')
        riskLevel = 'high'
      }

      // Large value transfer warning
      const valueInEth = parseFloat(ethers.formatEther(txValue))
      const balanceInEth = parseFloat(ethers.formatEther(balance))
      if (valueInEth > 0 && valueInEth > balanceInEth * 0.5) {
        warnings.push('⚠️ LARGE TRANSFER: This transaction sends more than 50% of your balance')
        if (riskLevel === 'low') riskLevel = 'medium'
      }

      // Check for zero address
      if (transaction.to?.toLowerCase() === KNOWN_PATTERNS.ZERO_ADDRESS) {
        warnings.push('⚠️ ZERO ADDRESS: Sending to the zero address (possible burn)')
        riskFactors.push('Sending to zero address')
        riskLevel = 'high'
      }

      // Calculate balance after
      const balanceAfter = balance - totalCost
      const balanceChange = totalCost

      setSimulationResult({
        success: true,
        gasUsed: gasEstimate.toString(),
        gasEstimate: gasEstimate.toString(),
        effectiveGasPrice: ethers.formatUnits(effectiveGasPrice, "gwei"),
        totalCost: ethers.formatEther(totalCost),
        balanceAfter: ethers.formatEther(balanceAfter),
        balanceChange: ethers.formatEther(balanceChange),
        warnings,
        decodedFunction,
        stateChanges,
        riskLevel,
        riskFactors,
      })
    } catch (err) {
      console.error("[v0] Simulation error:", err)
      setSimulationResult({
        success: false,
        gasUsed: '0',
        gasEstimate: '0',
        effectiveGasPrice: '0',
        totalCost: '0',
        balanceAfter: currentBalance,
        balanceChange: '0',
        error: err instanceof Error ? err.message : 'Simulation failed',
        warnings: [],
        riskLevel: 'high',
        riskFactors: ['Simulation failed'],
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const getRiskBadge = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500">LOW RISK</Badge>
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">MEDIUM RISK</Badge>
      case 'high':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500">HIGH RISK</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[3px] border-foreground shadow-2xl bg-background max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b-2 border-foreground pb-4">
          <DialogTitle className="flex items-center gap-3 font-mono uppercase font-black text-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-2 border-black shadow-md">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            TRANSACTION SIMULATOR
          </DialogTitle>
          <DialogDescription className="font-mono text-xs font-semibold mt-2">
            PREVIEW TRANSACTION OUTCOME BEFORE SIGNING
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {/* Transaction Overview */}
            {transaction && (
              <Card className="border-2 border-foreground">
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Transaction Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">FROM:</span>
                    <code className="bg-muted px-2 py-1 border flex-1">{fromAddress.slice(0, 10)}...{fromAddress.slice(-8)}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-muted"
                      onClick={() => copyToClipboard(fromAddress, 'from')}
                      title="Copy FROM address"
                    >
                      {copiedText === 'from' ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">TO:</span>
                    <code className="bg-muted px-2 py-1 border flex-1">{transaction.to?.slice(0, 10)}...{transaction.to?.slice(-8)}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-muted"
                      onClick={() => copyToClipboard(transaction.to!, 'to')}
                      title="Copy TO address"
                    >
                      {copiedText === 'to' ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  {transaction.value && BigInt(transaction.value.toString()) > BigInt(0) && (
                    <div className="flex items-center gap-2 pt-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-bold">
                        {ethers.formatEther(transaction.value.toString())} {chain?.nativeCurrency.symbol}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Simulation Status */}
            {isSimulating && (
              <Alert className="border-2 border-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription className="font-mono text-sm">
                  SIMULATING TRANSACTION...
                </AlertDescription>
              </Alert>
            )}

            {/* Simulation Results */}
            {simulationResult && (
              <>
                {/* Risk Assessment */}
                <Card className={`border-2 ${
                  simulationResult.riskLevel === 'high' ? 'border-red-500 bg-red-500/5' :
                  simulationResult.riskLevel === 'medium' ? 'border-yellow-500 bg-yellow-500/5' :
                  'border-green-500 bg-green-500/5'
                }`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-mono text-sm uppercase flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Risk Assessment
                      </div>
                      {getRiskBadge(simulationResult.riskLevel)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {simulationResult.riskFactors.length > 0 ? (
                      <ul className="space-y-1 font-mono text-xs">
                        {simulationResult.riskFactors.map((factor, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-mono text-xs text-green-500">No risk factors detected</p>
                    )}
                  </CardContent>
                </Card>

                {/* Decoded Function */}
                {simulationResult.decodedFunction && (
                  <Card className="border-2 border-foreground">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Decoded Function
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-mono text-xs space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="uppercase">
                            {simulationResult.decodedFunction.name}
                          </Badge>
                        </div>
                        <div className="bg-muted p-2 border-2 border-foreground space-y-1">
                          {Object.entries(simulationResult.decodedFunction.args).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">{key}:</span>
                              <div className="flex items-center gap-1">
                                <span className="truncate max-w-[150px]">{String(value)}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 hover:bg-background"
                                  onClick={() => copyToClipboard(String(value), `arg-${key}`)}
                                  title={`Copy ${key}`}
                                >
                                  {copiedText === `arg-${key}` ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* State Changes */}
                {simulationResult.stateChanges && simulationResult.stateChanges.length > 0 && (
                  <Card className="border-2 border-foreground">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Expected State Changes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 font-mono text-xs">
                        {simulationResult.stateChanges.map((change, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Badge variant="outline" className="uppercase text-[10px]">
                              {change.type.replace('_', ' ')}
                            </Badge>
                            <span>{change.description}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Gas & Cost Estimation */}
                <Card className="border-2 border-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      Gas & Cost Estimation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                      <div>
                        <p className="text-muted-foreground">Gas Estimate</p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{parseInt(simulationResult.gasEstimate).toLocaleString()}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={() => copyToClipboard(simulationResult.gasEstimate, 'gas')}
                            title="Copy gas estimate"
                          >
                            {copiedText === 'gas' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gas Price</p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{simulationResult.effectiveGasPrice} Gwei</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={() => copyToClipboard(simulationResult.effectiveGasPrice, 'gasprice')}
                            title="Copy gas price"
                          >
                            {copiedText === 'gasprice' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Cost</p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{simulationResult.totalCost} {chain?.nativeCurrency.symbol}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={() => copyToClipboard(simulationResult.totalCost, 'cost')}
                            title="Copy total cost"
                          >
                            {copiedText === 'cost' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance After</p>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold ${parseFloat(simulationResult.balanceAfter) < 0 ? 'text-red-500' : ''}`}>
                            {parseFloat(simulationResult.balanceAfter).toFixed(6)} {chain?.nativeCurrency.symbol}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={() => copyToClipboard(simulationResult.balanceAfter, 'balance')}
                            title="Copy balance after"
                          >
                            {copiedText === 'balance' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warnings */}
                {simulationResult.warnings.length > 0 && (
                  <Alert variant="destructive" className="border-2 border-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="space-y-1 font-mono text-xs">
                        {simulationResult.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error */}
                {simulationResult.error && (
                  <Alert variant="destructive" className="border-2 border-foreground">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="font-mono text-sm">
                      {simulationResult.error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success Indicator */}
                {simulationResult.success && !simulationResult.error && (
                  <Alert className="border-2 border-green-500 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="font-mono text-sm text-green-500">
                      SIMULATION SUCCESSFUL - Transaction is expected to succeed
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t-2 border-foreground">
          <Button
            variant="outline"
            onClick={() => {
              onCancel()
              onOpenChange(false)
            }}
            className="flex-1 bg-transparent border-[3px] border-foreground font-black uppercase hover:bg-muted transition-colors"
          >
            CANCEL
          </Button>
          <Button
            onClick={() => {
              onProceed()
              onOpenChange(false)
            }}
            className={`flex-1 border-[3px] border-foreground font-black uppercase transition-all shadow-md ${
              simulationResult?.riskLevel === 'high' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary'
            }`}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                SIMULATING...
              </>
            ) : simulationResult?.riskLevel === 'high' ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                PROCEED ANYWAY
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                PROCEED
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
