"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { Key, Save, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ProjectIdSettings() {
  const { projectId, setProjectId } = useWallet()
  const [localValue, setLocalValue] = useState(projectId)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalValue(projectId)
  }, [projectId])

  const handleSave = () => {
    setProjectId(localValue)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="project-id" className="text-base font-semibold flex items-center gap-2">
        <Key className="h-4 w-4" />
        Reown Project ID
      </Label>
      <div className="flex gap-2">
        <Input
          id="project-id"
          type="text"
          placeholder="Enter your Reown/WalletConnect project ID..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="font-mono text-sm"
        />
        <Button onClick={handleSave} size="sm" className="px-4" disabled={localValue === projectId}>
          {saved ? (
            <>Saved</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save
            </>
          )}
        </Button>
      </div>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          A default project ID is set. You can update it with your own from{" "}
          <a
            href="https://cloud.reown.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            cloud.reown.com
          </a>
          {" "}for WalletConnect functionality.
        </AlertDescription>
      </Alert>
    </div>
  )
}
