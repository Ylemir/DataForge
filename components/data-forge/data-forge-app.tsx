'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { PanelLeftClose, PanelLeft, Braces, Code, Table2 } from 'lucide-react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toolbar } from './toolbar'
import { TreeView } from './tree-view'
import { CodeEditor } from './code-editor'
import { QueryPanel } from './query-panel'
import { OutputPanel } from './output-panel'
import { parseContent, buildTree, queryData, stringifyData, putAtPath, deleteAtPath, detectFormat } from '@/lib/data-forge/parsers'
import { sampleData } from '@/lib/data-forge/samples'
import { useFormatter } from '@/hooks/use-formatter'
import { useIsMobile } from '@/hooks/use-mobile'
import type { DataFormat, TreeNode, HistoryEntry, QueryResult } from '@/lib/data-forge/types'
import type { ImperativePanelHandle } from 'react-resizable-panels'

interface HistoryState {
  content: string
  format: DataFormat
}

export function DataForgeApp() {
  const isMobile = useIsMobile()
  const isMounted = isMobile !== undefined
  
  // Mobile tab state
  const [mobileTab, setMobileTab] = React.useState('editor')

  // Editor state
  const [content, setContent] = React.useState(sampleData.json)
  const [format, setFormat] = React.useState<DataFormat>('json')
  const [parsedData, setParsedData] = React.useState<unknown>(null)
  const [parseError, setParseError] = React.useState<string | null>(null)
  const [treeData, setTreeData] = React.useState<TreeNode | null>(null)

  // Selection and query state
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null)
  const [selectedValue, setSelectedValue] = React.useState<unknown>(undefined)
  const [query, setQuery] = React.useState('')
  const [queryResult, setQueryResult] = React.useState<QueryResult | null>(null)
  
  // Output panel tab state
  const [outputTab, setOutputTab] = React.useState('convert')
  
  // Query panel tab state
  const [queryPanelTab, setQueryPanelTab] = React.useState('examples')
  
  // Edit value state (for tree node editing)
  const [editValue, setEditValue] = React.useState('')

  // History state
  const [history, setHistory] = React.useState<HistoryEntry[]>([])
  const [favorites, setFavorites] = React.useState<string[]>([])

  // Formatter hook
  const { formatData, minify } = useFormatter({
    data: parsedData,
    format,
    onFormat: (formatted) => setContent(formatted),
    onMinify: (minified) => setContent(minified),
  })

  // Undo/redo state
  const [undoStack, setUndoStack] = React.useState<HistoryState[]>([])
  const [redoStack, setRedoStack] = React.useState<HistoryState[]>([])
  const lastContentRef = React.useRef<string>(content)

  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  // Left panel ref and collapse state
  const leftPanelRef = React.useRef<ImperativePanelHandle>(null)
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = React.useState(false)
  
  const toggleLeftPanel = () => {
    const panel = leftPanelRef.current
    if (panel) {
      if (isLeftPanelCollapsed) {
        panel.expand()
      } else {
        panel.collapse()
      }
    }
  }

  // Parse content when it changes (debounced for performance)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Parse
      const result = parseContent(content, format)
      if (result.error) {
        setParseError(result.error)
        setParsedData(null)
        setTreeData(null)
      } else {
        setParseError(null)
        setParsedData(result.data)
        setTreeData(buildTree(result.data))
      }

      // Save to undo stack
      if (lastContentRef.current !== content) {
        setUndoStack((prev) => [...prev.slice(-49), { content: lastContentRef.current, format }])
        setRedoStack([])
        lastContentRef.current = content
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [content, format])

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  // Handle format change
  const handleFormatChange = (newFormat: DataFormat) => {
    // Try to convert current data to new format
    if (parsedData) {
      try {
        const converted = stringifyData(parsedData, newFormat)
        setContent(converted)
        setFormat(newFormat)
        toast.success(`已转换为 ${newFormat.toUpperCase()} 格式`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '转换失败')
      }
    } else {
      setFormat(newFormat)
    }
  }

  // Handle file import
  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const detectedFormat = detectFormat(text)
      setContent(text)
      setFormat(detectedFormat)
      toast.success(`已导入 ${file.name}`)
    }
    reader.onerror = () => {
      toast.error('文件读取失败')
    }
    reader.readAsText(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle load sample
  const handleLoadSample = (sampleFormat: DataFormat) => {
    setContent(sampleData[sampleFormat])
    setFormat(sampleFormat)
    toast.success(`已加载 ${sampleFormat.toUpperCase()} 示例数据`)
  }

  // Handle format (beautify)
  const handleFormat = () => {
    formatData()
  }

  // Handle minify
  const handleMinify = () => {
    minify()
  }

  // Handle undo
  const handleUndo = () => {
    if (undoStack.length === 0) return
    const previous = undoStack[undoStack.length - 1]
    setRedoStack((prev) => [...prev, { content, format }])
    setUndoStack((prev) => prev.slice(0, -1))
    setContent(previous.content)
    setFormat(previous.format)
    lastContentRef.current = previous.content
  }

  // Handle redo
  const handleRedo = () => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setUndoStack((prev) => [...prev, { content, format }])
    setRedoStack((prev) => prev.slice(0, -1))
    setContent(next.content)
    setFormat(next.format)
    lastContentRef.current = next.content
  }

  // Handle path selection
  const handleSelectPath = (path: string, value: unknown) => {
    setSelectedPath(path)
    setSelectedValue(value)
    setQuery(path)
  }

  // Handle query execution
  const handleExecuteQuery = () => {
    if (!parsedData) {
      toast.error('请先输入有效数据')
      return
    }
    if (!query) {
      toast.error('请输入查询表达式')
      return
    }

    const result = queryData(parsedData, query)
    setQueryResult(result)

    // Add to history
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      query,
      timestamp: Date.now(),
      type: 'query',
    }
    setHistory((prev) => [entry, ...prev.slice(0, 49)])

    // Switch to query result tab
    setOutputTab('query')

    if (result.success) {
      toast.success('查询成功')
    } else {
      toast.error(result.error || '查询失败')
    }
  }

  // Handle favorites
  const handleAddFavorite = (q: string) => {
    if (!favorites.includes(q)) {
      setFavorites((prev) => [...prev, q])
      toast.success('已添加到收藏')
    }
  }

  const handleRemoveFavorite = (q: string) => {
    setFavorites((prev) => prev.filter((f) => f !== q))
    toast.success('已从收藏移除')
  }

  const handleClearHistory = () => {
    setHistory([])
    toast.success('历史记录已清空')
  }

  // Ref for keyboard shortcut handler to always invoke the latest callback
  const executeQueryRef = React.useRef(handleExecuteQuery)
  executeQueryRef.current = handleExecuteQuery

  // Handle put operation
  const handlePut = (path: string, valueStr: string) => {
    if (!parsedData) {
      toast.error('请先输入有效数据')
      return
    }
    try {
      const value = JSON.parse(valueStr)
      const result = putAtPath(parsedData, path, value)
      if (result.success) {
        const newContent = stringifyData(result.data, format)
        setContent(newContent)
        toast.success('数据已更新')
      } else {
        toast.error(result.error || '更新失败')
      }
    } catch (error) {
      toast.error('无效的 JSON 值')
    }
  }

  // Handle delete operation
  const handleDelete = (path: string) => {
    if (!parsedData) {
      toast.error('请先输入有效数据')
      return
    }
    const result = deleteAtPath(parsedData, path)
    if (result.success) {
      const newContent = stringifyData(result.data, format)
      setContent(newContent)
      toast.success('数据已删除')
    } else {
      toast.error(result.error || '删除失败')
    }
  }

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          handleRedo()
        } else {
          e.preventDefault()
          handleUndo()
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        executeQueryRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoStack, redoStack])

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.yaml,.yml,.toml,.xml,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Toolbar */}
        <Toolbar
          format={format}
          onFormatChange={handleFormatChange}
          onImport={handleImport}
          onLoadSample={handleLoadSample}
          onFormat={handleFormat}
          onMinify={handleMinify}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {isMounted && isMobile ? (
          <div className="flex flex-1 flex-col min-h-0">
            {/* Mobile tab bar */}
            <div className="flex-shrink-0 border-b border-border px-2 py-1">
              <Tabs value={mobileTab} onValueChange={setMobileTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9">
                  <TabsTrigger value="editor" className="gap-1.5 text-xs">
                    <Code className="h-3.5 w-3.5" />
                    编辑
                  </TabsTrigger>
                  <TabsTrigger value="tree" className="gap-1.5 text-xs">
                    <Braces className="h-3.5 w-3.5" />
                    结构
                  </TabsTrigger>
                  <TabsTrigger value="output" className="gap-1.5 text-xs">
                    <Table2 className="h-3.5 w-3.5" />
                    输出
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Mobile content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {mobileTab === 'editor' && (
                <div className="flex h-full flex-col">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex h-10 items-center border-b border-border px-4">
                      <h2 className="text-sm font-medium">源数据</h2>
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {format.toUpperCase()}
                      </span>
                    </div>
                    <div className="h-[calc(100%-2.5rem)] p-3">
                      <CodeEditor
                        value={content}
                        onChange={handleContentChange}
                        format={format}
                        error={parseError}
                        className="h-full"
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 border-t border-border p-3">
                    <QueryPanel
                      query={query}
                      onQueryChange={setQuery}
                      onExecute={handleExecuteQuery}
                      history={history}
                      favorites={favorites}
                      onAddFavorite={handleAddFavorite}
                      onRemoveFavorite={handleRemoveFavorite}
                      onClearHistory={handleClearHistory}
                      selectedPath={selectedPath}
                      onPut={handlePut}
                      onDelete={handleDelete}
                      activeTab={queryPanelTab}
                      onTabChange={setQueryPanelTab}
                      editValue={editValue}
                      onEditValueChange={setEditValue}
                    />
                  </div>
                </div>
              )}

              {mobileTab === 'tree' && (
                <div className="flex h-full flex-col">
                  <div className="flex h-10 items-center justify-between border-b border-border px-4">
                    <h2 className="text-sm font-medium">数据结构</h2>
                  </div>
                  <TreeView
                    data={treeData}
                    selectedPath={selectedPath}
                    onSelectPath={handleSelectPath}
                    onEdit={(path, value) => {
                      setSelectedPath(path)
                      setSelectedValue(value)
                      setQuery(path)
                    }}
                    onSave={handlePut}
                    onDelete={handleDelete}
                    className="flex-1 overflow-hidden"
                  />
                </div>
              )}

              {mobileTab === 'output' && (
                <OutputPanel
                  data={parsedData}
                  sourceFormat={format}
                  selectedPath={selectedPath}
                  selectedValue={selectedValue}
                  queryResult={queryResult}
                  activeTab={outputTab}
                  onTabChange={setOutputTab}
                />
              )}
            </div>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Left panel: Tree view */}
            <ResizablePanel 
              ref={leftPanelRef}
              defaultSize={20} 
              minSize={15} 
              maxSize={35}
              collapsible
              collapsedSize={0}
              onCollapse={() => setIsLeftPanelCollapsed(true)}
              onExpand={() => setIsLeftPanelCollapsed(false)}
            >
              <div className="flex h-full flex-col border-r border-border">
                <div className="flex h-10 items-center justify-between border-b border-border px-4">
                  <h2 className="text-sm font-medium">数据结构</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={toggleLeftPanel}
                      >
                        <PanelLeftClose className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">折叠面板</TooltipContent>
                  </Tooltip>
                </div>
                <TreeView
                  data={treeData}
                  selectedPath={selectedPath}
                  onSelectPath={handleSelectPath}
                  onEdit={(path, value) => {
                    setSelectedPath(path)
                    setSelectedValue(value)
                    setQuery(path)
                  }}
                  onSave={handlePut}
                  onDelete={handleDelete}
                  className="flex-1 overflow-hidden"
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />
            
            {/* Collapsed panel toggle button */}
            {isLeftPanelCollapsed && (
              <div className="flex h-full items-start border-r border-border">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="m-1 h-8 w-8"
                      onClick={toggleLeftPanel}
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">展开数据结构面板</TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Center panel: Editor and query */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="flex h-full flex-col">
                {/* Editor */}
                <div className="flex-1 overflow-hidden border-b border-border">
                  <div className="flex h-10 items-center border-b border-border px-4">
                    <h2 className="text-sm font-medium">源数据</h2>
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {format.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-[calc(100%-2.5rem)] p-4">
                    <CodeEditor
                      value={content}
                      onChange={handleContentChange}
                      format={format}
                      error={parseError}
                      className="h-full"
                    />
                  </div>
                </div>

                {/* Query panel */}
                <div className="h-[320px] flex-shrink-0 p-4">
                  <QueryPanel
                    query={query}
                    onQueryChange={setQuery}
                    onExecute={handleExecuteQuery}
                    history={history}
                    favorites={favorites}
                    onAddFavorite={handleAddFavorite}
                    onRemoveFavorite={handleRemoveFavorite}
                    onClearHistory={handleClearHistory}
                    selectedPath={selectedPath}
                    onPut={handlePut}
                    onDelete={handleDelete}
                    activeTab={queryPanelTab}
                    onTabChange={setQueryPanelTab}
                    editValue={editValue}
                    onEditValueChange={setEditValue}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right panel: Output */}
            <ResizablePanel defaultSize={40} minSize={25}>
              <OutputPanel
                data={parsedData}
                sourceFormat={format}
                selectedPath={selectedPath}
                selectedValue={selectedValue}
                queryResult={queryResult}
                activeTab={outputTab}
                onTabChange={setOutputTab}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </TooltipProvider>
  )
}
