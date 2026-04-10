'use client'

import * as React from 'react'
import { Play, Clock, Star, StarOff, Trash2, Plus, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { queryExamples } from '@/lib/data-forge/samples'
import type { HistoryEntry } from '@/lib/data-forge/types'

interface QueryPanelProps {
  query: string
  onQueryChange: (query: string) => void
  onExecute: () => void
  history: HistoryEntry[]
  favorites: string[]
  onAddFavorite: (query: string) => void
  onRemoveFavorite: (query: string) => void
  onClearHistory: () => void
  selectedPath: string | null
  className?: string
  // Edit operations
  onPut?: (path: string, value: string) => void
  onDelete?: (path: string) => void
  // Controlled tabs
  activeTab?: string
  onTabChange?: (tab: string) => void
  // Edit value
  editValue?: string
  onEditValueChange?: (value: string) => void
}

export function QueryPanel({
  query,
  onQueryChange,
  onExecute,
  history,
  favorites,
  onAddFavorite,
  onRemoveFavorite,
  onClearHistory,
  selectedPath,
  className,
  onPut,
  onDelete,
  activeTab,
  onTabChange,
  editValue: controlledEditValue,
  onEditValueChange,
}: QueryPanelProps) {
  const [internalEditValue, setInternalEditValue] = React.useState('')
  const editValue = controlledEditValue ?? internalEditValue
  const setEditValue = onEditValueChange ?? setInternalEditValue
  const [editPath, setEditPath] = React.useState('')

  React.useEffect(() => {
    if (selectedPath) {
      setEditPath(selectedPath)
    }
  }, [selectedPath])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onExecute()
    }
  }

  const isFavorite = favorites.includes(query)

  return (
    <div className={cn('flex flex-col gap-3 md:gap-4', className)}>
      {/* Query input */}
      <div className="space-y-1.5 md:space-y-2">
        <label className="text-sm font-medium text-muted-foreground">路径查询</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=".users[0].name"
              className="h-9 font-mono text-sm pr-10"
            />
            <button
              onClick={() => {
                if (isFavorite) {
                  onRemoveFavorite(query)
                } else if (query) {
                  onAddFavorite(query)
                }
              }}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 transition-colors',
                isFavorite ? 'text-warning' : 'text-muted-foreground hover:text-warning'
              )}
              disabled={!query}
            >
              {isFavorite ? (
                <Star className="h-4 w-4 fill-current" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </button>
          </div>
          <Button size="sm" onClick={onExecute} className="h-9 gap-1.5 px-3">
            <Play className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">执行</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} defaultValue="examples" className="flex-1">
        <TabsList className="grid w-full grid-cols-4 h-8">
          <TabsTrigger value="examples" className="text-xs">示例</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">历史</TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs">收藏</TabsTrigger>
          <TabsTrigger value="edit" className="text-xs">编辑</TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="mt-2 md:mt-3">
          <ScrollArea className="h-[160px] md:h-[180px]">
            <div className="space-y-1">
              {queryExamples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => onQueryChange(example.query)}
                  className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted min-h-[40px]"
                >
                  <code className="font-mono text-sm text-primary">{example.query}</code>
                  <span className="text-xs text-muted-foreground">{example.description}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="mt-2 md:mt-3">
          <div className="mb-1.5 md:mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {history.length} 条记录
            </span>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive py-1"
              >
                <Trash2 className="h-3 w-3" />
                清空
              </button>
            )}
          </div>
          <ScrollArea className="h-[130px] md:h-[150px]">
            <div className="space-y-1">
              {history.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  暂无历史记录
                </p>
              ) : (
                history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => onQueryChange(entry.query)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted min-h-[40px]"
                  >
                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <code className="flex-1 truncate font-mono text-sm">{entry.query}</code>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(entry.timestamp)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="favorites" className="mt-2 md:mt-3">
          <ScrollArea className="h-[160px] md:h-[180px]">
            <div className="space-y-1">
              {favorites.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  暂无收藏的查询
                </p>
              ) : (
                favorites.map((fav, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-muted min-h-[40px]"
                  >
                    <button
                      onClick={() => onQueryChange(fav)}
                      className="flex-1 text-left"
                    >
                      <code className="font-mono text-sm">{fav}</code>
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(fav)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="edit" className="mt-2 md:mt-3">
          <div className="space-y-2.5 md:space-y-3">
            <div className="space-y-1 md:space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">路径</label>
              <Input
                value={editPath}
                onChange={(e) => setEditPath(e.target.value)}
                placeholder=".users[0].name"
                className="h-8 font-mono text-sm"
              />
            </div>
            <div className="space-y-1 md:space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">值 (JSON)</label>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder='"新值" 或 {"key": "value"}'
                className="h-8 font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 gap-1.5"
                onClick={() => onPut?.(editPath, editValue)}
                disabled={!editPath || !editValue}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">添加/更新</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 gap-1.5 text-destructive hover:text-destructive"
                onClick={() => onDelete?.(editPath)}
                disabled={!editPath}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">删除</span>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}
