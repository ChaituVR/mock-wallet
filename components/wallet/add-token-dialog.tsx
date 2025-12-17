"use client"

import { useState } from "react"
import { useWallet } from "@/lib/wallet/wallet-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Plus } from "lucide-react"

interface AddTokenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTokenDialog({ open, onOpenChange }: AddTokenDialogProps) {
  const { addCustomToken } = useWallet()
  const [tokenAddress, setTokenAddress] = useState("")
  const [error, setError] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    if (!tokenAddress.trim()) {
      setError("Please enter a token address")
      return
    }

    setError("")
    setIsAdding(true)

    try {
      await addCustomToken(tokenAddress.trim())
      setTokenAddress("")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add token")
    } finally {
      setIsAdding(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isAdding) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setTokenAddress("")
        setError("")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="brutalist-border border-4 border-black dark:border-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Add Custom Token
          </DialogTitle>
          <DialogDescription className="font-mono text-sm">
            Add any ERC20 token by entering its contract address
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tokenAddress" className="font-bold text-sm uppercase">
              Token Contract Address
            </Label>
            <Input
              id="tokenAddress"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => {
                setTokenAddress(e.target.value)
                setError("")
              }}
              disabled={isAdding}
              className="brutalist-border border-2 border-black dark:border-white font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isAdding) {
                  handleAdd()
                }
              }}
            />
            <p className="text-xs font-mono text-muted-foreground">
              The token will be automatically detected and added to your list
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="brutalist-border border-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="brutalist-border border-2 bg-blue-50 dark:bg-blue-950/20 border-blue-600">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-300 font-mono text-xs">
              <strong>Tip:</strong> Make sure you're on the correct network. The token must exist on the currently
              selected chain.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isAdding}
            className="border-2 border-black dark:border-white font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isAdding || !tokenAddress.trim()}
            className="border-2 border-black font-bold"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Token
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
