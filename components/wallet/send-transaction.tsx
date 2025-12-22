"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { ethers } from "ethers"
import { Send, Loader2, CheckCircle2, AlertCircle, ExternalLink, Eye } from "lucide-react"
import { getChainById } from "@/lib/wallet/chain-config"

interface SendTransactionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendTransaction({ open, onOpenChange }: SendTransactionProps) {
  const { activeAccount, getProvider, refreshBalance, chainId } = useWallet()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [gasLimit, setGasLimit] = useState("21000")
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const chain = getChainById(chainId)

  const resetForm = () => {
    setRecipient("")
    setAmount("")
    setGasLimit("21000")
    setError("")
    setTxHash("")
    setSuccess(false)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(resetForm, 200)
  }

  const sendTransaction = async () => {
    if (!activeAccount || !recipient || !amount) return

    if (activeAccount.isWatchOnly) {
      setError("Cannot send transactions from a watch-only account")
      return
    }

    if (!activeAccount.privateKey) {
      setError("Private key not available")
      return
    }

    setIsLoading(true)
    setError("")
    setTxHash("")
    setSuccess(false)

    try {
      const provider = getProvider()
      if (!provider) {
        throw new Error("Provider not available")
      }

      // Resolve ENS name if needed or validate recipient address
      let resolvedRecipient = recipient.trim()
      const ensPattern = /^[a-zA-Z0-9-]+\.(eth|xyz|luxe|kred|art|club)$/i
      
      if (ensPattern.test(resolvedRecipient)) {
        // Resolve ENS name using mainnet
        const mainnetProvider = new ethers.JsonRpcProvider("https://eth.llamarpc.com")
        const resolvedAddress = await mainnetProvider.resolveName(resolvedRecipient)
        if (!resolvedAddress) {
          throw new Error(`Could not resolve ENS name: ${resolvedRecipient}`)
        }
        resolvedRecipient = resolvedAddress
      } else if (!ethers.isAddress(resolvedRecipient)) {
        throw new Error("Invalid recipient address or ENS name")
      }

      // Create wallet instance with provider
      const wallet = new ethers.Wallet(activeAccount.privateKey, provider)

      // Prepare transaction
      const tx = {
        to: resolvedRecipient,
        value: ethers.parseEther(amount),
        gasLimit: BigInt(gasLimit),
      }

      console.log("[v0] Sending transaction:", tx)

      // Send transaction
      const txResponse = await wallet.sendTransaction(tx)
      setTxHash(txResponse.hash)

      console.log("[v0] Transaction sent:", txResponse.hash)

      // Wait for confirmation
      await txResponse.wait()

      setSuccess(true)
      await refreshBalance()

      console.log("[v0] Transaction confirmed")
    } catch (err) {
      console.error("[v0] Transaction error:", err)
      const errorMessage = err instanceof Error ? err.message : "Transaction failed"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const openExplorer = () => {
    if (chain && txHash) {
      window.open(`${chain.blockExplorers.default.url}/tx/${txHash}`, "_blank")
    }
  }

  const isWatchOnly = activeAccount?.isWatchOnly

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-[3px] border-foreground shadow-brutal bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase font-black">
            <Send className="h-5 w-5" />
            SEND TRANSACTION
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            SEND {chain?.nativeCurrency.symbol} TO ANY ADDRESS ON {chain?.name.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isWatchOnly && (
            <Alert className="border-[3px] border-foreground bg-warning/20">
              <Eye className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">
                THIS IS A WATCH-ONLY ACCOUNT. YOU CANNOT SEND TRANSACTIONS WITHOUT THE PRIVATE KEY.
              </AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 border-[3px] border-foreground bg-[#00ff00] flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3 className="font-mono font-black text-lg uppercase">TRANSACTION SENT!</h3>
                  <p className="font-mono text-sm text-muted-foreground mt-1">YOUR TRANSACTION HAS BEEN CONFIRMED</p>
                </div>
              </div>

              {txHash && (
                <Alert className="border-[3px] border-foreground bg-background">
                  <AlertDescription className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground uppercase">Transaction Hash</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={openExplorer}
                        className="h-7 font-mono text-xs border-2 border-foreground"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        EXPLORER
                      </Button>
                    </div>
                    <code className="block text-xs bg-muted p-2 border-2 border-foreground font-mono break-all">
                      {txHash}
                    </code>
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleClose} className="w-full border-2 border-foreground font-black uppercase">
                CLOSE
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="recipient" className="font-mono uppercase text-xs font-black">
                  RECIPIENT ADDRESS OR ENS NAME
                </Label>
                <Input
                  id="recipient"
                  placeholder="0x... or vitalik.eth"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="font-mono text-sm border-[3px] border-foreground"
                  disabled={isLoading || isWatchOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="font-mono uppercase text-xs font-black">
                  AMOUNT ({chain?.nativeCurrency.symbol})
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.0001"
                  placeholder="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-mono text-sm border-[3px] border-foreground"
                  disabled={isLoading || isWatchOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gas" className="font-mono uppercase text-xs font-black">
                  GAS LIMIT
                </Label>
                <Input
                  id="gas"
                  type="number"
                  value={gasLimit}
                  onChange={(e) => setGasLimit(e.target.value)}
                  className="font-mono text-sm border-[3px] border-foreground"
                  disabled={isLoading || isWatchOnly}
                />
                <p className="font-mono text-xs text-muted-foreground">DEFAULT: 21000 FOR SIMPLE TRANSFERS</p>
              </div>

              {error && (
                <Alert variant="destructive" className="border-[3px] border-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {txHash && !success && (
                <Alert className="border-[3px] border-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription className="font-mono text-sm">WAITING FOR CONFIRMATION...</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 bg-transparent border-[3px] border-foreground font-black uppercase"
                  disabled={isLoading}
                >
                  CANCEL
                </Button>
                <Button
                  onClick={sendTransaction}
                  className="flex-1 border-[3px] border-foreground font-black uppercase"
                  disabled={isLoading || !recipient || !amount || isWatchOnly}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      SENDING...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      SEND
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
