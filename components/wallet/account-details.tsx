"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { Eye, EyeOff, Copy, Key, FileText, AlertTriangle } from "lucide-react"

export function AccountDetails() {
  const { activeAccount } = useWallet()
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [copiedPk, setCopiedPk] = useState(false)
  const [copiedMn, setCopiedMn] = useState(false)

  const copyPrivateKey = async () => {
    if (activeAccount?.privateKey) {
      await navigator.clipboard.writeText(activeAccount.privateKey)
      setCopiedPk(true)
      setTimeout(() => setCopiedPk(false), 2000)
    }
  }

  const copyMnemonic = async () => {
    if (activeAccount?.mnemonic) {
      await navigator.clipboard.writeText(activeAccount.mnemonic)
      setCopiedMn(true)
      setTimeout(() => setCopiedMn(false), 2000)
    }
  }

  if (activeAccount?.isWatchOnly) {
    return (
      <div className="space-y-3">
        <Label className="font-mono uppercase text-xs font-black flex items-center gap-2">
          <Eye className="h-4 w-4" />
          WATCH-ONLY ACCOUNT
        </Label>
        <Alert className="border-[3px] border-foreground bg-muted/50">
          <Eye className="h-4 w-4" />
          <AlertDescription className="font-mono text-xs">
            THIS IS A WATCH-ONLY ADDRESS. NO PRIVATE KEY AVAILABLE. YOU CAN VIEW BALANCE BUT CANNOT SIGN TRANSACTIONS.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label className="font-mono uppercase text-xs font-black flex items-center gap-2">
        <Key className="h-4 w-4" />
        ACCOUNT CREDENTIALS
      </Label>

      <div className="space-y-3">
        {/* Private Key - Always shown for non-watch-only accounts */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 border-[3px] border-foreground bg-background hover:bg-accent"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center bg-[#ff3333]">
                  <Key className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-mono font-black text-sm uppercase">PRIVATE KEY</div>
                  <div className="font-mono text-xs text-muted-foreground">VIEW AND EXPORT YOUR KEY</div>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl border-[3px] border-foreground shadow-brutal bg-background">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono uppercase font-black">
                <Key className="h-5 w-5 text-[#ff3333]" />
                PRIVATE KEY
              </DialogTitle>
              <DialogDescription className="font-mono text-xs">
                YOUR PRIVATE KEY GRANTS FULL ACCESS. NEVER SHARE IT.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="border-[3px] border-foreground bg-[#ff3333]/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-mono text-xs">
                  ANYONE WITH THIS KEY CAN ACCESS YOUR FUNDS. KEEP IT SECURE.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-mono uppercase text-xs font-black">KEY</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="font-mono text-xs border-2 border-foreground"
                  >
                    {showPrivateKey ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        HIDE
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        SHOW
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <code className="block w-full p-3 bg-muted border-[3px] border-foreground font-mono text-xs break-all">
                    {showPrivateKey ? activeAccount?.privateKey : "•".repeat(activeAccount?.privateKey?.length || 64)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPrivateKey}
                    className="absolute top-2 right-2 border-2 border-foreground"
                  >
                    {copiedPk ? <span className="text-xs font-mono">COPIED!</span> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mnemonic Phrase - Only shown if available */}
        {activeAccount?.mnemonic && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 border-[3px] border-foreground bg-background hover:bg-accent"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center bg-[#ffff00]">
                    <FileText className="h-4 w-4 text-black" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-mono font-black text-sm uppercase">RECOVERY PHRASE</div>
                    <div className="font-mono text-xs text-muted-foreground">VIEW YOUR 12/24 WORD MNEMONIC</div>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-[3px] border-foreground shadow-brutal bg-background">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-mono uppercase font-black">
                  <FileText className="h-5 w-5 text-[#ffff00]" />
                  RECOVERY PHRASE
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  YOUR RECOVERY PHRASE CAN RESTORE YOUR WALLET. STORE IT SAFELY.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="border-[3px] border-foreground bg-[#ffff00]/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-xs">
                    WRITE DOWN YOUR PHRASE AND STORE IT SECURELY. NEVER SHARE ONLINE.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono uppercase text-xs font-black">MNEMONIC</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className="font-mono text-xs border-2 border-foreground"
                    >
                      {showMnemonic ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          HIDE
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          SHOW
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="p-4 bg-muted border-[3px] border-foreground">
                      <div className="grid grid-cols-3 gap-3">
                        {(showMnemonic
                          ? activeAccount.mnemonic.split(" ")
                          : Array(activeAccount.mnemonic.split(" ").length).fill("•••••")
                        ).map((word, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 bg-background border-2 border-foreground text-sm font-mono"
                          >
                            <span className="text-muted-foreground text-xs w-5">{i + 1}.</span>
                            <span>{word}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyMnemonic}
                      className="absolute top-2 right-2 border-2 border-foreground"
                    >
                      {copiedMn ? <span className="text-xs font-mono">COPIED!</span> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {!activeAccount?.mnemonic && (
          <div className="p-3 border-[3px] border-dashed border-foreground/50 bg-muted/50">
            <p className="font-mono text-xs text-muted-foreground">
              RECOVERY PHRASE NOT AVAILABLE (IMPORTED VIA PRIVATE KEY)
            </p>
          </div>
        )}
      </div>

      <p className="font-mono text-xs text-muted-foreground">CREDENTIALS STORED LOCALLY. ALWAYS KEEP SECURE BACKUPS.</p>
    </div>
  )
}
