'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Paintbrush, Check } from 'lucide-react'

interface AccountLabelEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLabel: string
  currentColor?: string
  onSave: (label: string, color: string) => void
}

const PRESET_COLORS = [
  { name: 'Coral', value: '#f97316' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Gray', value: '#6b7280' },
]

export function AccountLabelEditor({ open, onOpenChange, currentLabel, currentColor, onSave }: AccountLabelEditorProps) {
  const [label, setLabel] = useState(currentLabel)
  const [color, setColor] = useState(currentColor || PRESET_COLORS[0].value)

  const handleSave = () => {
    onSave(label.trim() || currentLabel, color)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-[3px] border-foreground shadow-2xl">
        <DialogHeader className="border-b-2 border-foreground pb-3">
          <DialogTitle className="flex items-center gap-3 font-mono uppercase font-black text-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-black shadow-md">
              <Paintbrush className="h-5 w-5 text-primary-foreground" />
            </div>
            Customize Account
          </DialogTitle>
          <DialogDescription className="font-mono text-xs font-semibold mt-2">
            GIVE YOUR ACCOUNT A MEMORABLE NAME AND COLOR
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Label Input */}
          <div className="space-y-2">
            <Label htmlFor="account-label" className="text-xs font-bold font-mono uppercase">
              Account Label
            </Label>
            <Input
              id="account-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Main Wallet, Trading, Testing"
              className="border-2 font-mono"
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground">
              {label.length}/30 characters
            </p>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="text-xs font-bold font-mono uppercase">
              Color
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className="relative w-full aspect-square border-2 border-foreground hover:scale-110 transition-transform group"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white drop-shadow-lg" strokeWidth={3} />
                    </div>
                  )}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="border-2 border-border p-3 space-y-1">
            <p className="text-xs font-bold font-mono uppercase text-muted-foreground">Preview</p>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border-2 border-foreground"
                style={{ backgroundColor: color }}
              />
              <span className="font-mono font-bold text-sm">
                {label || currentLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t-2 border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-12 border-2 border-foreground font-mono font-bold uppercase"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="h-12 border-2 border-foreground font-mono font-bold uppercase bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
