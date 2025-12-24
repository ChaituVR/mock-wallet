"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, ChevronDown, ChevronRight, FileJson, Eye, Code } from "lucide-react"
import { ethers } from "ethers"

interface DataVerifierProps {
  data: any
  title?: string
  className?: string
}

export function DataVerifier({ data, title = "Transaction Data", className = "" }: DataVerifierProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([]))

  const copyToClipboard = async (text: string, path: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPath(path)
      setTimeout(() => setCopiedPath(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const formatValue = (value: any): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') {
      // Try to parse as BigInt or hex value
      if (value.startsWith('0x')) {
        try {
          const bn = BigInt(value)
          if (bn > BigInt(Number.MAX_SAFE_INTEGER)) {
            return `${value} (${bn.toString()})`
          }
          return `${value} (${parseInt(value, 16)})`
        } catch {
          return value
        }
      }
      return value
    }
    if (typeof value === 'bigint') return value.toString()
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  const decodeValue = (key: string, value: any): string | null => {
    // Decode common patterns
    if (key === 'value' && typeof value === 'string' && value.startsWith('0x')) {
      try {
        const ethValue = ethers.formatEther(value)
        return `${ethValue} ETH`
      } catch {
        return null
      }
    }
    if (key === 'gasLimit' || key === 'gas') {
      try {
        const gasValue = BigInt(value)
        return `${gasValue.toLocaleString()} units`
      } catch {
        return null
      }
    }
    if (key === 'gasPrice' || key === 'maxFeePerGas' || key === 'maxPriorityFeePerGas') {
      try {
        const gweiValue = ethers.formatUnits(value, 'gwei')
        return `${gweiValue} Gwei`
      } catch {
        return null
      }
    }
    if (key === 'data' && typeof value === 'string' && value.startsWith('0x') && value.length > 10) {
      const methodId = value.slice(0, 10)
      return `Method: ${methodId} + ${(value.length - 10) / 2} bytes`
    }
    return null
  }

  const renderTree = (obj: any, path: string = 'root', level: number = 0): JSX.Element[] => {
    const elements: JSX.Element[] = []

    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return elements
    }

    const entries = Array.isArray(obj) 
      ? obj.map((item, i) => [String(i), item])
      : Object.entries(obj)

    entries.forEach(([key, value]) => {
      const currentPath = `${path}.${key}`
      const isExpanded = expandedPaths.has(currentPath)
      const isObject = value !== null && typeof value === 'object'
      const decoded = decodeValue(key, value)

      elements.push(
        <div key={currentPath} style={{ marginLeft: `${level * 16}px` }} className="py-1">
          <div className="flex items-start gap-2 font-mono text-xs group">
            {isObject && (
              <button
                onClick={() => toggleExpand(currentPath)}
                className="shrink-0 hover:bg-muted p-0.5 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
            {!isObject && <div className="w-4" />}
            
            <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">
              {key}:
            </span>
            
            {!isObject && (
              <div className="flex-1 flex items-center gap-2">
                <code className="text-foreground break-all">
                  {formatValue(value)}
                </code>
                {decoded && (
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {decoded}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => copyToClipboard(String(value), currentPath)}
                  title="Copy value"
                >
                  {copiedPath === currentPath ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
            
            {isObject && (
              <span className="text-muted-foreground">
                {Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`}
              </span>
            )}
          </div>
          
          {isObject && isExpanded && (
            <div className="mt-1">
              {renderTree(value, currentPath, level + 1)}
            </div>
          )}
        </div>
      )
    })

    return elements
  }

  const renderPrettyJson = () => {
    return (
      <div className="relative">
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 h-7 text-xs z-10"
          onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'full-json')}
        >
          {copiedPath === 'full-json' ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy All
            </>
          )}
        </Button>
        <pre className="font-mono text-xs bg-muted p-4 rounded border-2 border-foreground overflow-x-auto">
          {JSON.stringify(data, (key, value) => {
            // Convert BigInt to string for JSON
            if (typeof value === 'bigint') {
              return value.toString()
            }
            return value
          }, 2)}
        </pre>
      </div>
    )
  }

  const renderReadable = () => {
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => {
          const decoded = decodeValue(key, value)
          return (
            <div key={key} className="flex flex-col gap-1 p-3 bg-muted rounded border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(String(value), key)}
                  title={`Copy ${key}`}
                >
                  {copiedPath === key ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <code className="font-mono text-xs break-all">
                {formatValue(value)}
              </code>
              {decoded && (
                <Badge variant="secondary" className="text-xs w-fit">
                  = {decoded}
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className={`border-2 border-foreground ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
          <FileJson className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="readable" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="readable" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Readable
            </TabsTrigger>
            <TabsTrigger value="tree" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Tree
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs">
              <FileJson className="h-3 w-3 mr-1" />
              Raw JSON
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] w-full">
            <TabsContent value="readable" className="mt-0">
              {renderReadable()}
            </TabsContent>
            
            <TabsContent value="tree" className="mt-0">
              <div className="bg-muted p-4 rounded border-2 border-foreground">
                {renderTree(data)}
              </div>
            </TabsContent>
            
            <TabsContent value="json" className="mt-0">
              {renderPrettyJson()}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
