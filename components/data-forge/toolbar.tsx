'use client'

import * as React from 'react'
import { 
  Upload, 
  FileJson, 
  FileCode, 
  FileText, 
  Sun, 
  Moon, 
  Laptop,
  Undo2,
  Redo2,
  Wand2,
  Minimize2,
  HelpCircle,
  Github,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { DataFormat } from '@/lib/data-forge/types'

interface ToolbarProps {
  format: DataFormat
  onFormatChange: (format: DataFormat) => void
  onImport: () => void
  onLoadSample: (format: DataFormat) => void
  onFormat: () => void
  onMinify: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  className?: string
}

const formatOptions: { value: DataFormat; label: string; icon: React.ReactNode }[] = [
  { value: 'json', label: 'JSON', icon: <FileJson className="h-4 w-4" /> },
  { value: 'yaml', label: 'YAML', icon: <FileCode className="h-4 w-4" /> },
  { value: 'toml', label: 'TOML', icon: <FileCode className="h-4 w-4" /> },
  { value: 'xml', label: 'XML', icon: <FileCode className="h-4 w-4" /> },
  { value: 'csv', label: 'CSV', icon: <FileText className="h-4 w-4" /> },
]

export function Toolbar({
  format,
  onFormatChange,
  onImport,
  onLoadSample,
  onFormat,
  onMinify,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className,
}: ToolbarProps) {
  const { setTheme } = useTheme()

  return (
    <header className={cn('flex h-14 items-center justify-between border-b border-border bg-card px-4', className)}>
      {/* Left: Logo and title */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileJson className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-none">DataForge</h1>
          <p className="text-xs text-muted-foreground">多格式数据转换工具</p>
        </div>
      </div>

      {/* Center: Format selector and actions */}
      <div className="flex items-center gap-2">
        {/* Format selector */}
        <Select value={format} onValueChange={(v) => onFormatChange(v as DataFormat)}>
          <SelectTrigger className="h-9 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {formatOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex items-center gap-2">
                  {opt.icon}
                  {opt.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mx-2 h-6 w-px bg-border" />

        {/* Import */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5"
              onClick={onImport}
            >
              <Upload className="h-4 w-4" />
              导入
            </Button>
          </TooltipTrigger>
          <TooltipContent>导入文件</TooltipContent>
        </Tooltip>

        {/* Load sample */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9">
              示例数据
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {formatOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onLoadSample(opt.value)}
              >
                <span className="mr-2">{opt.icon}</span>
                {opt.label} 示例
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-2 h-6 w-px bg-border" />

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>撤销</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>重做</TooltipContent>
        </Tooltip>

        <div className="mx-2 h-6 w-px bg-border" />

        {/* Format/Minify */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5"
              onClick={onFormat}
            >
              <Wand2 className="h-4 w-4" />
              格式化
            </Button>
          </TooltipTrigger>
          <TooltipContent>美化代码格式</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5"
              onClick={onMinify}
            >
              <Minimize2 className="h-4 w-4" />
              压缩
            </Button>
          </TooltipTrigger>
          <TooltipContent>压缩为单行</TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Theme and help */}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">切换主题</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              浅色
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              深色
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Laptop className="mr-2 h-4 w-4" />
              跟随系统
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs space-y-1 text-xs">
              <p className="font-medium">快捷键</p>
              <p>Ctrl/Cmd + Enter: 执行查询</p>
              <p>Ctrl/Cmd + Z: 撤销</p>
              <p>Ctrl/Cmd + Shift + Z: 重做</p>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>GitHub</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
