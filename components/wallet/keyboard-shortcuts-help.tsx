'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Keyboard, Command, Search, Zap, Users, Network, Copy, Send, Download, History, RefreshCw } from 'lucide-react'

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // ⌘? or Ctrl+? to open help
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '/') {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? '⌘' : 'Ctrl'

  const shortcuts = [
    {
      category: 'General',
      icon: Command,
      items: [
        { key: `${modKey} K`, description: 'Open command palette', icon: Search },
        { key: `${modKey} Shift /`, description: 'Show keyboard shortcuts', icon: Keyboard },
      ],
    },
    {
      category: 'Actions',
      icon: Zap,
      items: [
        { key: `${modKey} S`, description: 'Send transaction', icon: Send },
        { key: `${modKey} H`, description: 'Receive funds (QR code)', icon: Download },
        { key: `${modKey} C`, description: 'Copy wallet address', icon: Copy },
        { key: `${modKey} R`, description: 'Refresh balance', icon: RefreshCw },
      ],
    },
    {
      category: 'Navigation',
      icon: Network,
      items: [
        { key: `${modKey} 1-9`, description: 'Switch to account 1-9', icon: Users },
        { key: '? (in command palette)', description: 'Show command help' },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl border-[3px] border-foreground shadow-2xl">
        <DialogHeader className="border-b-2 border-foreground pb-4">
          <DialogTitle className="flex items-center gap-3 font-mono uppercase font-black text-lg">
            <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-black">
              <Keyboard className="h-5 w-5 text-primary-foreground" />
            </div>
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="font-mono text-xs font-semibold mt-2">
            MASTER THESE SHORTCUTS TO NAVIGATE MOCK WALLET LIKE A PRO
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {shortcuts.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.category}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="font-mono font-black uppercase text-sm">{section.category}</h3>
                </div>
                <div className="space-y-2">
                  {section.items.map((item, index) => {
                    const ItemIcon = item.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border-2 border-border hover:border-foreground transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {ItemIcon && <ItemIcon className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-sm">{item.description}</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs border-2 rounded-none px-2 py-1">
                          {item.key}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div className="border-t-2 border-border pt-4">
            <div className="p-3 bg-primary/5 border-2 border-primary/20">
              <p className="text-xs text-muted-foreground font-mono">
                <span className="font-black">Tip:</span> Press{' '}
                <Badge variant="outline" className="font-mono text-xs border-2 rounded-none px-1.5 py-0.5 mx-1">
                  {modKey} K
                </Badge>{' '}
                to access all actions through the command palette. You can search, filter, and execute any command with just your keyboard.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
