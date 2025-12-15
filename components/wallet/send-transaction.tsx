"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { ethers } from "ethers"
import { Send, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"
import { getChainById } from "@/lib/wallet/chain-config"

interface SendTransactionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendTransaction({ open, onOpenChange }: SendTransactionProps) {
  const { account, getProvider, refreshBalance, chainId } = useWallet()
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
    if (!account || !recipient || !amount) return

    setIsLoading(true)
    setError("")
    setTxHash("")
    setSuccess(false)

    try {
      const provider = getProvider()
      if (!provider) {
        throw new Error("Provider not available")
      }

      // Validate recipient address
      if (!ethers.isAddress(recipient)) {
        throw new Error("Invalid recipient address")
      }

      // Create wallet instance with provider
      const wallet = new ethers.Wallet(account.privateKey, provider)

      // Prepare transaction
      const tx = {
        to: recipient,
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Transaction
          </DialogTitle>
          <DialogDescription>
            Send {chain?.nativeCurrency.symbol} to any address on {chain?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {success ? (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Transaction Sent!</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your transaction has been confirmed</p>
                </div>
              </div>

              {txHash && (
                <Alert>
                  <AlertDescription className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Transaction Hash</span>
                      <Button variant="ghost" size="sm" onClick={openExplorer} className="h-7">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Explorer
                      </Button>
                    </div>
                    <code className="block text-xs bg-muted p-2 rounded font-mono break-all">{txHash}</code>
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="font-mono text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({chain?.nativeCurrency.symbol})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.0001"
                  placeholder="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gas">Gas Limit</Label>
                <Input
                  id="gas"
                  type="number"
                  value={gasLimit}
                  onChange={(e) => setGasLimit(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Default: 21000 for simple transfers</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {txHash && !success && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription className="text-sm">Waiting for confirmation...</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent" disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={sendTransaction} className="flex-1" disabled={isLoading || !recipient || !amount}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
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
