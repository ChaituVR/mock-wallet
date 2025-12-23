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
      <DialogContent className="max-w-md border-[3px] border-foreground shadow-2xl bg-background">
        <DialogHeader className="border-b-2 border-foreground pb-4">
          <DialogTitle className="flex items-center gap-3 font-mono uppercase font-black text-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-black shadow-md">
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
            Add Custom Token
          </DialogTitle>
          <DialogDescription className="font-mono text-xs font-semibold mt-2">
            ADD ANY ERC20 TOKEN BY ENTERING ITS CONTRACT ADDRESS
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

          <Alert className="brutalist-border border-2 bg-orange-50 dark:bg-orange-950/20 border-orange-600">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900 dark:text-orange-300 font-mono text-xs">
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
            className="h-12 border-2 border-black dark:border-white font-mono font-bold uppercase"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isAdding || !tokenAddress.trim()}
            className="h-12 border-2 border-black font-mono font-bold uppercase bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
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
