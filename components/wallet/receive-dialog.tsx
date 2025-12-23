"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Download, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReceiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiveDialog({ open, onOpenChange }: ReceiveDialogProps) {
  const { activeAccount } = useWallet()
  const { toast } = useToast()

  if (!activeAccount) return null

  const copyAddress = () => {
    navigator.clipboard.writeText(activeAccount.address)
    toast({
      title: "✓ Address Copied",
      description: `${activeAccount.address.slice(0, 10)}...${activeAccount.address.slice(-8)}`,
      variant: "success",
    })
  }

  const downloadQR = () => {
    const svg = document.getElementById("qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.download = `wallet-qr-${activeAccount.address.slice(0, 10)}.png`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)

          toast({
            title: "✓ QR Code Downloaded",
            description: "Saved to your downloads folder",
            variant: "success",
          })
        }
      })
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[3px] border-foreground shadow-2xl bg-background">
        <DialogHeader className="border-b-2 border-foreground pb-4">
          <DialogTitle className="flex items-center gap-3 font-mono uppercase font-black text-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center border-2 border-black shadow-md">
              <Download className="h-5 w-5 text-white rotate-180" />
            </div>
            RECEIVE FUNDS
          </DialogTitle>
          <DialogDescription className="font-mono text-xs font-semibold mt-2">
            SCAN QR CODE OR COPY ADDRESS TO RECEIVE FUNDS
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-6 bg-white border-[3px] border-foreground shadow-lg">
              <QRCodeSVG
                id="qr-code"
                value={activeAccount.address}
                size={256}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Address Display */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold uppercase text-muted-foreground">
              WALLET ADDRESS
            </div>
            <div className="p-4 bg-muted border-2 border-foreground font-mono text-xs break-all">
              {activeAccount.address}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={copyAddress}
              className="flex-1 brutalist-border font-mono font-bold uppercase h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Address
            </Button>
            <Button
              onClick={downloadQR}
              variant="outline"
              className="flex-1 brutalist-border font-mono font-bold uppercase h-12"
            >
              <Download className="mr-2 h-4 w-4" />
              Save QR Code
            </Button>
          </div>

          {/* Warning Message */}
          <div className="p-3 bg-warning/10 border-2 border-warning/50 rounded">
            <p className="text-xs font-mono font-semibold">
              ⚠️ Only send funds on the currently selected network. Cross-chain transfers may result in loss of funds.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
