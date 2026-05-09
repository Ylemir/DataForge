'use client'

import * as React from 'react'
import { Copy, Download, Check, ArrowRightLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CodeEditor } from './code-editor'
import { stringifyData } from '@/lib/data-forge/parsers'
import { useClipboard } from '@/hooks/use-clipboard'
import type { DataFormat } from '@/lib/data-forge/types'

interface OutputPanelProps {
  data: unknown
  sourceFormat: DataFormat
  selectedPath: string | null
  selectedValue: unknown
  queryResult: { success: boolean; data: unknown; error?: string } | null
  activeTab?: string
  onTabChange?: (tab: string) => void
  className?: string
}

const formatLabels: Record<DataFormat, string> = {
  json: 'JSON',
  yaml: 'YAML',
  toml: 'TOML',
  xml: 'XML',
  csv: 'CSV',
}

export function OutputPanel({
  data,
  sourceFormat,
  selectedPath,
  selectedValue,
  queryResult,
  activeTab = 'convert',
  onTabChange,
  className,
}: OutputPanelProps) {
  const [outputFormat, setOutputFormat] = React.useState<DataFormat>(sourceFormat)
  const { copied, copy } = useClipboard()

  React.useEffect(() => {
    setOutputFormat(sourceFormat)
  }, [sourceFormat])

  const convertedOutput = React.useMemo(() => {
    if (!data) return ''
    try {
      return stringifyData(data, outputFormat)
    } catch (error) {
      return error instanceof Error ? `转换错误: ${error.message}` : '转换错误'
    }
  }, [data, outputFormat])

  const queryOutput = React.useMemo(() => {
    if (!queryResult) return ''
    if (!queryResult.success) return queryResult.error || '查询失败'
    try {
      if (typeof queryResult.data === 'string') return queryResult.data
      const json = JSON.stringify(queryResult.data, null, 2)
      return json ?? ''
    } catch {
      return String(queryResult.data)
    }
  }, [queryResult])

  const selectedOutput = React.useMemo(() => {
    if (selectedValue === undefined) return ''
    try {
      return typeof selectedValue === 'string'
        ? selectedValue
        : JSON.stringify(selectedValue, null, 2)
    } catch {
      return String(selectedValue)
    }
  }, [selectedValue])

  const handleDownload = (content: string, format: DataFormat) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-2 md:px-4 py-2">
          <TabsList className="h-8">
            <TabsTrigger value="convert" className="text-xs gap-1.5">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              转换
            </TabsTrigger>
            <TabsTrigger value="query" className="text-xs">
              查询结果
            </TabsTrigger>
            <TabsTrigger value="selected" className="text-xs">
              选中节点
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="convert" className="mt-0 flex flex-1 flex-col overflow-hidden">
          {/* Format selector and actions */}
          <div className="flex items-center gap-1 md:gap-2 border-b border-border px-2 md:px-4 py-1.5 md:py-2">
            <span className="text-xs md:text-sm text-muted-foreground">转换为:</span>
            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as DataFormat)}>
              <SelectTrigger className="h-7 md:h-8 w-20 md:w-24 text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(formatLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 md:h-8 gap-1 px-2 md:px-3"
              onClick={() => copy(convertedOutput)}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  <span className="hidden sm:inline">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">复制</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 md:h-8 gap-1 px-2 md:px-3"
              onClick={() => handleDownload(convertedOutput, outputFormat)}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">下载</span>
            </Button>
          </div>

          {/* Output */}
          <div className="flex-1 overflow-hidden p-2 md:p-4">
            <CodeEditor
              value={convertedOutput}
              onChange={() => {}}
              format={outputFormat}
              readOnly
              className="h-full"
            />
          </div>
        </TabsContent>

        <TabsContent value="query" className="mt-0 flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-2 md:px-4 py-1.5 md:py-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              {queryResult?.success ? '查询成功' : queryResult?.error ? '查询失败' : '等待查询'}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 md:h-8 gap-1 px-2 md:px-3"
              onClick={() => copy(queryOutput)}
              disabled={!queryOutput}
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">复制</span>
            </Button>
          </div>
          <div className="flex-1 overflow-hidden p-2 md:p-4">
            {queryResult ? (
              <CodeEditor
                value={queryOutput}
                onChange={() => {}}
                format="json"
                readOnly
                error={queryResult.success ? null : queryResult.error}
                className="h-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                输入查询表达式并执行以查看结果
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="selected" className="mt-0 flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-2 md:px-4 py-1.5 md:py-2">
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-xs md:text-sm text-muted-foreground">路径:</span>
              {selectedPath && (
                <code className="rounded bg-muted px-1.5 md:px-2 py-0.5 font-mono text-xs max-w-[120px] md:max-w-none truncate">
                  {selectedPath}
                </code>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 md:h-8 gap-1 px-2 md:px-3"
              onClick={() => copy(selectedOutput)}
              disabled={!selectedOutput}
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">复制</span>
            </Button>
          </div>
          <div className="flex-1 overflow-hidden p-2 md:p-4">
            {selectedPath ? (
              <CodeEditor
                value={selectedOutput}
                onChange={() => {}}
                format="json"
                readOnly
                className="h-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                点击树形结构中的节点查看详情
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
