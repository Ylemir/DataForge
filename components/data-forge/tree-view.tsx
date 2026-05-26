'use client'

import * as React from 'react'
import { ChevronRight, ChevronDown, Search, Hash, Type, ToggleLeft, List, Braces, XCircle, MoreHorizontal, Copy, Pencil, Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useClipboard } from '@/hooks/use-clipboard'
import type { TreeNode } from '@/lib/data-forge/types'

interface TreeViewProps {
  data: TreeNode | null
  selectedPath: string | null
  onSelectPath: (path: string, value: unknown) => void
  onCopyPath?: (path: string) => void
  onCopyValue?: (value: unknown) => void
  onEdit?: (path: string, value: unknown) => void
  onSave?: (path: string, value: string) => void
  onDelete?: (path: string) => void
  className?: string
}

export function TreeView({ data, selectedPath, onSelectPath, onCopyPath, onCopyValue, onEdit, onSave, onDelete, className }: TreeViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set(['root']))
  const [editingPath, setEditingPath] = React.useState<string | null>(null)
  const [editValue, setEditValue] = React.useState('')

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const expandAll = () => {
    if (!data) return
    const allIds = new Set<string>()
    const collect = (node: TreeNode) => {
      allIds.add(node.id)
      node.children?.forEach(collect)
    }
    collect(data)
    setExpandedNodes(allIds)
  }

  const collapseAll = () => {
    setExpandedNodes(new Set(['root']))
  }

  // Auto-expand ancestor nodes when searching so matching results are visible
  React.useEffect(() => {
    if (!data || !searchQuery) return

    const query = searchQuery.toLowerCase()
    const ancestorsToExpand = new Set<string>()

    const collectAncestors = (node: TreeNode): boolean => {
      const selfMatch = node.key.toLowerCase().includes(query) ||
        (typeof node.value === 'string' && node.value.toLowerCase().includes(query)) ||
        (typeof node.value === 'number' && node.value.toString().includes(query))

      const childMatch = node.children?.some((child) => collectAncestors(child)) || false

      if (childMatch && node.children?.length) {
        ancestorsToExpand.add(node.id)
      }

      return selfMatch || childMatch
    }

    collectAncestors(data)

    setExpandedNodes((prev) => {
      let changed = false
      for (const id of ancestorsToExpand) {
        if (!prev.has(id)) {
          changed = true
          break
        }
      }
      if (!changed) return prev
      const next = new Set(prev)
      for (const id of ancestorsToExpand) next.add(id)
      return next
    })
  }, [searchQuery, data])

  const matchesSearch = (node: TreeNode): boolean => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    if (node.key.toLowerCase().includes(query)) return true
    if (typeof node.value === 'string' && node.value.toLowerCase().includes(query)) return true
    if (typeof node.value === 'number' && node.value.toString().includes(query)) return true
    return node.children?.some(matchesSearch) || false
  }

  const handleStartEdit = (path: string, value: unknown) => {
    setEditingPath(path)
    const valueStr = typeof value === 'string' 
      ? `"${value}"` 
      : JSON.stringify(value)
    setEditValue(valueStr)
  }

  const handleSaveEdit = () => {
    if (editingPath && onSave) {
      onSave(editingPath, editValue)
    }
    setEditingPath(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingPath(null)
    setEditValue('')
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      {/* Search */}
      <div className="flex-shrink-0 border-b border-border p-2 md:p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索节点..."
            className="h-8 pl-8 pr-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-1.5 flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-muted-foreground hover:text-foreground py-1"
          >
            展开全部
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-muted-foreground hover:text-foreground py-1"
          >
            折叠全部
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="p-2">
            {data ? (
              <TreeNodeComponent
                node={data}
                level={0}
                expandedNodes={expandedNodes}
                selectedPath={selectedPath}
                onToggle={toggleNode}
                onSelect={onSelectPath}
                onCopyPath={onCopyPath}
                onCopyValue={onCopyValue}
                onEdit={onEdit}
                onDelete={onDelete}
                searchQuery={searchQuery}
                matchesSearch={matchesSearch}
                editingPath={editingPath}
                editValue={editValue}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditValueChange={setEditValue}
              />
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                暂无数据
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

interface TreeNodeComponentProps {
  node: TreeNode
  level: number
  expandedNodes: Set<string>
  selectedPath: string | null
  onToggle: (nodeId: string) => void
  onSelect: (path: string, value: unknown) => void
  onCopyPath?: (path: string) => void
  onCopyValue?: (value: unknown) => void
  onEdit?: (path: string, value: unknown) => void
  onDelete?: (path: string) => void
  searchQuery: string
  matchesSearch: (node: TreeNode) => boolean
  editingPath: string | null
  editValue: string
  onStartEdit: (path: string, value: unknown) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditValueChange: (value: string) => void
}

function TreeNodeComponent({
  node,
  level,
  expandedNodes,
  selectedPath,
  onToggle,
  onSelect,
  onCopyPath,
  onCopyValue,
  onEdit,
  onDelete,
  searchQuery,
  matchesSearch,
  editingPath,
  editValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
}: TreeNodeComponentProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const isExpanded = expandedNodes.has(node.id)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedPath === node.path
  const isMatch = matchesSearch(node)
  const { copyPath, copyValue } = useClipboard()
  
  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCopyPath) {
      onCopyPath(node.path)
    } else {
      copyPath(node.path)
    }
  }
  
  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCopyValue) {
      onCopyValue(node.value)
    } else {
      copyValue(node.value)
    }
  }
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStartEdit(node.path, node.value)
  }
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(node.path)
    }
  }

  if (!isMatch && searchQuery) return null

  const getTypeIcon = () => {
    switch (node.type) {
      case 'object':
        return <Braces className="h-3.5 w-3.5 text-chart-1" />
      case 'array':
        return <List className="h-3.5 w-3.5 text-chart-2" />
      case 'string':
        return <Type className="h-3.5 w-3.5 text-chart-3" />
      case 'number':
        return <Hash className="h-3.5 w-3.5 text-chart-4" />
      case 'boolean':
        return <ToggleLeft className="h-3.5 w-3.5 text-chart-5" />
      default:
        return <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const getValueDisplay = () => {
    if (node.type === 'object') {
      const count = Object.keys(node.value as object).length
      return <span className="text-muted-foreground">{`{${count}}`}</span>
    }
    if (node.type === 'array') {
      return <span className="text-muted-foreground">{`[${(node.value as unknown[]).length}]`}</span>
    }
    if (node.type === 'string') {
      const str = node.value as string
      const display = str.length > 30 ? str.substring(0, 30) + '...' : str
      return <span className="text-chart-3">{`"${display}"`}</span>
    }
    if (node.type === 'number') {
      return <span className="text-chart-4">{String(node.value)}</span>
    }
    if (node.type === 'boolean') {
      return <span className="text-chart-5">{String(node.value)}</span>
    }
    return <span className="text-muted-foreground">null</span>
  }

  return (
    <div>
      <div
        className={cn(
          'group relative flex w-full items-center rounded text-sm transition-colors',
          'hover:bg-tree-highlight',
          isSelected && 'bg-primary/10 text-primary'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {editingPath === node.path ? (
          <div className="flex items-center gap-1 flex-1 px-2 py-1.5 md:py-1" style={{ paddingLeft: `${level * 12 + 8}px` }}>
            {/* Type icon */}
            {getTypeIcon()}
            {/* Key */}
            <span className="font-medium">{node.key}</span>
            {/* Separator */}
            <span className="text-muted-foreground">:</span>
            <input
              type="text"
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              className="flex-1 h-7 md:h-6 px-2 text-sm border rounded bg-background"
              autoFocus
              onBlur={onSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSaveEdit()
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  onCancelEdit()
                }
              }}
            />
            <button
              onClick={onSaveEdit}
              className="h-7 w-7 md:h-6 md:w-6 flex items-center justify-center text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              <Check className="h-3.5 w-3.5 md:h-3 md:w-3" />
            </button>
            <button
              onClick={onCancelEdit}
              className="h-7 w-7 md:h-6 md:w-6 flex items-center justify-center text-xs bg-muted text-muted-foreground rounded hover:bg-muted/90"
            >
              <X className="h-3.5 w-3.5 md:h-3 md:w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (hasChildren) onToggle(node.id)
              onSelect(node.path, node.value)
            }}
            className="flex flex-1 items-center gap-1.5 px-2 py-1.5 md:py-1 text-left min-h-[36px] md:min-h-0"
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            {/* Expand/collapse icon */}
            <span className="w-5 md:w-4 flex-shrink-0 flex items-center justify-center">
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              ) : null}
            </span>

            {/* Type icon */}
            {getTypeIcon()}

            {/* Key */}
            <span className="font-medium">{node.key}</span>

            {/* Separator */}
            {!hasChildren && <span className="text-muted-foreground">:</span>}

            {/* Value */}
            <span className="truncate">{getValueDisplay()}</span>
          </button>
        )}
        
        {/* Action menu */}
        {(isHovered || isMenuOpen) && editingPath !== node.path && (
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="mr-2 flex h-7 w-7 md:h-6 md:w-6 items-center justify-center rounded hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleCopyPath}>
                <Copy className="mr-2 h-4 w-4" />
                复制路径
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyValue}>
                <Copy className="mr-2 h-4 w-4" />
                复制值
              </DropdownMenuItem>
              {((onEdit && !hasChildren) || onDelete) && <DropdownMenuSeparator />}
              {onEdit && !hasChildren && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
              )}
              {onDelete && node.path !== 'root' && (
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
</div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              selectedPath={selectedPath}
              onToggle={onToggle}
              onSelect={onSelect}
              onCopyPath={onCopyPath}
              onCopyValue={onCopyValue}
              onEdit={onEdit}
              onDelete={onDelete}
              searchQuery={searchQuery}
              matchesSearch={matchesSearch}
              editingPath={editingPath}
              editValue={editValue}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onEditValueChange={onEditValueChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
