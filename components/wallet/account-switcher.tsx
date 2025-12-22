"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { WalletManager } from "@/lib/wallet/wallet-manager"
import { Check, Plus, Eye, Wallet, Download, AlertCircle, Users, Upload, GripVertical, Sparkles } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SortableAccountItemProps {
  account: any
  index: number
  activeAccountIndex: number
  balance: string
  onSwitch: (index: number) => void
}

function SortableAccountItem({ account, index, activeAccountIndex, balance, onSwitch }: SortableAccountItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.address })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 font-mono cursor-pointer border-2 border-transparent hover:border-foreground hover:bg-accent mb-1 rounded"
    >
      <div
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div
        onClick={() => onSwitch(index)}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="shrink-0">
          {account.isWatchOnly ? <Eye className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs truncate">
              {account.ensName || account.label || "Account"}
            </span>
            {account.ensName && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 border border-blue-500 text-blue-700 dark:text-blue-300 rounded">ENS</span>
            )}
            {account.isWatchOnly && !account.ensName && (
              <span className="text-[10px] px-1.5 py-0.5 bg-muted border border-foreground">WATCH</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">{account.address}</div>
          <div className="text-xs font-bold mt-0.5">{balance || "..."} ETH</div>
        </div>
        {index === activeAccountIndex && <Check className="w-4 h-4 shrink-0 text-primary" />}
      </div>
    </div>
  )
}

export function AccountSwitcher() {
  const { accounts, activeAccountIndex, switchAccount, reorderAccounts, addAccountFromSeed, addWallet, getAccountBalance } =
    useWallet()
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCsvImportDialog, setShowCsvImportDialog] = useState(false)
  const [importValue, setImportValue] = useState("")
  const [importError, setImportError] = useState("")
  const [csvImportError, setCsvImportError] = useState("")
  const [csvImportSuccess, setCsvImportSuccess] = useState(0)

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const newBalances: Record<string, string> = {}
        for (const account of accounts) {
          try {
            const balance = await getAccountBalance(account.address)
            newBalances[account.address] = balance
          } catch (error) {
            console.error(`[v0] Error fetching balance for ${account.address}:`, error)
            newBalances[account.address] = "0.0"
          }
        }
        setBalances(newBalances)
      } catch (error) {
        console.error("[v0] Error in fetchBalances:", error)
      }
    }

    if (accounts.length > 0) {
      fetchBalances()
    }
  }, [accounts, getAccountBalance])

  const activeAccount = accounts[activeAccountIndex]
  const canAddAccount = activeAccount?.mnemonic

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = accounts.findIndex((account) => account.address === active.id)
      const newIndex = accounts.findIndex((account) => account.address === over.id)

      const newOrder = arrayMove(accounts, oldIndex, newIndex)
      reorderAccounts(newOrder)
    }
  }

  const handleAddAccount = () => {
    try {
      addAccountFromSeed()
    } catch (error) {
      console.error("[v0] Failed to add account:", error)
    }
  }

  const handleImportWallet = async () => {
    try {
      setImportError("")
      await addWallet(importValue)
      setImportValue("")
      setShowImportDialog(false)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to import wallet")
    }
  }

  const handleGenerateSeedPhrase = () => {
    // Generate a new random wallet and extract the mnemonic
    const newWallet = WalletManager.createWallet(0)
    if (newWallet.mnemonic) {
      setImportValue(newWallet.mnemonic)
      setImportError("")
    }
  }

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        setCsvImportError("")
        setCsvImportSuccess(0)
        const text = e.target?.result as string
        const lines = text.split("\n").filter(line => line.trim())
        
        // Skip header row
        let imported = 0
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          // Parse CSV (handle quoted values)
          const values: string[] = []
          let currentValue = ""
          let inQuotes = false
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue)
              currentValue = ""
            } else {
              currentValue += char
            }
          }
          values.push(currentValue) // Push last value
          
          try {
            // Check if it's a watch-only account (Type column is "Watch Only" or empty key)
            const type = values[4]?.trim()
            const keyOrMnemonic = values[1]?.trim()
            
            if (type === "Watch Only" || !keyOrMnemonic) {
              // Import as watch-only using address from column 0
              const address = values[0]?.trim()
              if (address) {
                await addWallet(address)
                imported++
              }
            } else if (keyOrMnemonic) {
              // Import with private key or mnemonic
              await addWallet(keyOrMnemonic)
              imported++
            }
          } catch (error) {
            console.error(`Failed to import row ${i}:`, error)
          }
        }
        
        setCsvImportSuccess(imported)
        if (imported > 0) {
          setTimeout(() => {
            setShowCsvImportDialog(false)
            setCsvImportSuccess(0)
          }, 2000)
        } else {
          setCsvImportError("No valid wallets found in CSV file")
        }
      } catch (error) {
        setCsvImportError(error instanceof Error ? error.message : "Failed to parse CSV file")
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ""
  }

  // Show import button if no accounts
  if (!activeAccount) {
    return (
      <>
        <div className="flex gap-1 sm:gap-2">
          <Button
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="gap-1 sm:gap-2 border-[3px] border-foreground font-black uppercase brutalist-shadow hover:bg-accent h-9 sm:h-11 bg-transparent px-2 sm:px-4"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Import Wallet</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button
            onClick={() => setShowCsvImportDialog(true)}
            variant="outline"
            className="gap-1 sm:gap-2 border-[3px] border-foreground font-black uppercase brutalist-shadow hover:bg-accent h-9 sm:h-11 bg-transparent px-2 sm:px-4"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>

        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="border-4 border-foreground bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">Import Wallet</DialogTitle>
              <DialogDescription className="font-mono font-bold">
                Import using private key, mnemonic phrase, ENS name, or Ethereum address (watch-only).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Private key, mnemonic, ENS name (e.g. vitalik.eth), or 0x address..."
                  value={importValue}
                  onChange={(e) => {
                    setImportValue(e.target.value)
                    setImportError("")
                  }}
                  className="font-mono text-sm border-2 border-foreground"
                />
                <Button
                  onClick={handleGenerateSeedPhrase}
                  variant="outline"
                  size="sm"
                  className="w-full h-10 font-black uppercase border-2 border-foreground hover:bg-primary/10 transition-colors"
                  type="button"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate New Seed Phrase
                </Button>
              </div>
              {importError && (
                <Alert className="border-2 border-foreground bg-destructive">
                  <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                  <AlertDescription className="text-xs font-mono font-bold text-destructive-foreground">
                    {importError}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleImportWallet}
                size="lg"
                className="w-full h-12 font-black uppercase border-2 border-foreground brutalist-shadow"
                disabled={!importValue.trim()}
              >
                <Download className="w-4 h-4 mr-2" />
                Import Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCsvImportDialog} onOpenChange={setShowCsvImportDialog}>
          <DialogContent className="border-4 border-foreground bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">Import from CSV</DialogTitle>
              <DialogDescription className="font-mono font-bold">
                Upload a CSV file exported from the Accounts page to import multiple wallets at once.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-foreground rounded-lg p-6 text-center bg-muted/50">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="text-sm font-black uppercase mb-1">Choose CSV File</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    Accepts files with private keys or mnemonic phrases
                  </div>
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvImport}
                  className="hidden"
                />
              </div>
              {csvImportError && (
                <Alert className="border-2 border-foreground bg-destructive">
                  <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                  <AlertDescription className="text-xs font-mono font-bold text-destructive-foreground">
                    {csvImportError}
                  </AlertDescription>
                </Alert>
              )}
              {csvImportSuccess > 0 && (
                <Alert className="border-2 border-foreground bg-green-500 text-white">
                  <Check className="h-4 w-4" />
                  <AlertDescription className="text-xs font-mono font-bold">
                    Successfully imported {csvImportSuccess} wallet{csvImportSuccess !== 1 ? "s" : ""}!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-1 sm:gap-2 border-3 border-foreground font-black uppercase brutalist-shadow hover:bg-accent h-9 sm:h-11 bg-transparent px-2 sm:px-4 max-w-50 sm:max-w-none"
        >
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            {activeAccount.isWatchOnly ? (
              <Eye className="w-4 h-4 shrink-0" />
            ) : (
              <Wallet className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate text-xs sm:text-sm">
              {activeAccount.ensName || WalletManager.formatAddress(activeAccount.address)}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground hidden sm:inline">
              {balances[activeAccount.address] || "0.0"} ETH
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 border-[3px] border-foreground bg-card p-2">
        <div className="px-2 py-1.5 text-xs font-black uppercase text-muted-foreground">
          Accounts (Drag to reorder)
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={accounts.map((account) => account.address)}
            strategy={verticalListSortingStrategy}
          >
            {accounts.map((account, index) => (
              <SortableAccountItem
                key={account.address}
                account={account}
                index={index}
                activeAccountIndex={activeAccountIndex}
                balance={balances[account.address]}
                onSwitch={switchAccount}
              />
            ))}
          </SortableContext>
        </DndContext>

        <DropdownMenuSeparator className="my-2 bg-foreground h-0.5" />

        <DropdownMenuItem
          onSelect={() => {
            if (typeof window !== 'undefined' && (window as any).setActiveTab) {
              (window as any).setActiveTab('accounts')
            }
          }}
          className="flex items-center gap-2 p-3 font-black uppercase text-xs cursor-pointer border-2 border-foreground hover:bg-accent mb-1"
        >
          <Users className="w-4 h-4" />
          Manage Accounts
        </DropdownMenuItem>

        {canAddAccount && (
          <DropdownMenuItem
            onClick={handleAddAccount}
            className="flex items-center gap-2 p-3 font-black uppercase text-xs cursor-pointer border-2 border-foreground hover:bg-primary hover:text-primary-foreground mb-1"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => setShowImportDialog(true)}
          className="flex items-center gap-2 p-3 font-black uppercase text-xs cursor-pointer border-2 border-foreground hover:bg-secondary hover:text-secondary-foreground mb-1"
        >
          <Download className="w-4 h-4" />
          Import New Wallet
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setShowCsvImportDialog(true)}
          className="flex items-center gap-2 p-3 font-black uppercase text-xs cursor-pointer border-2 border-foreground hover:bg-secondary hover:text-secondary-foreground"
        >
          <Upload className="w-4 h-4" />
          Import from CSV
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="border-4 border-foreground bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Import Wallet</DialogTitle>
            <DialogDescription className="font-mono font-bold">
              Import using private key, mnemonic phrase, ENS name, or Ethereum address (watch-only).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Private key, mnemonic, ENS name (e.g. vitalik.eth), or 0x address..."
                value={importValue}
                onChange={(e) => {
                  setImportValue(e.target.value)
                  setImportError("")
                }}
                className="font-mono text-sm border-2 border-foreground"
              />
              <Button
                onClick={handleGenerateSeedPhrase}
                variant="outline"
                size="sm"
                className="w-full h-10 font-black uppercase border-2 border-foreground hover:bg-primary/10 transition-colors"
                type="button"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Seed Phrase
              </Button>
            </div>
            {importError && (
              <Alert className="border-2 border-foreground bg-destructive">
                <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                <AlertDescription className="text-xs font-mono font-bold text-destructive-foreground">
                  {importError}
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleImportWallet}
              size="lg"
              className="w-full h-12 font-black uppercase border-2 border-foreground brutalist-shadow"
              disabled={!importValue.trim()}
            >
              <Download className="w-4 h-4 mr-2" />
              Import Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCsvImportDialog} onOpenChange={setShowCsvImportDialog}>
        <DialogContent className="border-4 border-foreground bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Import from CSV</DialogTitle>
            <DialogDescription className="font-mono font-bold">
              Upload a CSV file exported from the Accounts page to import multiple wallets at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-foreground rounded-lg p-6 text-center bg-muted/50">
              <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <label htmlFor="csv-upload-dropdown" className="cursor-pointer">
                <div className="text-sm font-black uppercase mb-1">Choose CSV File</div>
                <div className="text-xs font-mono text-muted-foreground">
                  Accepts files with private keys or mnemonic phrases
                </div>
              </label>
              <input
                id="csv-upload-dropdown"
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                className="hidden"
              />
            </div>
            {csvImportError && (
              <Alert className="border-2 border-foreground bg-destructive">
                <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                <AlertDescription className="text-xs font-mono font-bold text-destructive-foreground">
                  {csvImportError}
                </AlertDescription>
              </Alert>
            )}
            {csvImportSuccess > 0 && (
              <Alert className="border-2 border-foreground bg-green-500 text-white">
                <Check className="h-4 w-4" />
                <AlertDescription className="text-xs font-mono font-bold">
                  Successfully imported {csvImportSuccess} wallet{csvImportSuccess !== 1 ? "s" : ""}!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
