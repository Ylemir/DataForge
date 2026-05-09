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
import pkg from '@/package.json'
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
  const version = pkg.version

  return (
    <header className={cn('flex h-14 items-center justify-between border-b border-border bg-card px-3 md:px-4', className)}>
      {/* Left: Logo and title */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileJson className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-semibold leading-none">DataForge</h1>
            {version ? (
              <span className="hidden sm:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                v{version}
              </span>
            ) : null}
          </div>
          <p className="hidden sm:block text-xs text-muted-foreground pt-1">多格式数据转换工具</p>
        </div>
      </div>

      {/* Center: Format selector and actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Format selector */}
        <Select value={format} onValueChange={(v) => onFormatChange(v as DataFormat)}>
          <SelectTrigger className="h-8 md:h-9 w-24 md:w-28 text-xs md:text-sm">
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

        <div className="hidden md:block mx-2 h-6 w-px bg-border" />

        {/* Import */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 md:h-9 md:w-9"
              onClick={onImport}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>导入文件</TooltipContent>
        </Tooltip>

        {/* Load sample */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="hidden md:flex h-9 w-9">
              <FileText className="h-4 w-4" />
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

        <div className="hidden md:block mx-2 h-6 w-px bg-border" />

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-9 w-9"
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
              className="hidden md:flex h-9 w-9"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>重做</TooltipContent>
        </Tooltip>

        <div className="hidden md:block mx-2 h-6 w-px bg-border" />

        {/* Format/Minify */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden md:flex h-9 w-9"
              onClick={onFormat}
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>美化代码格式</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden md:flex h-9 w-9"
              onClick={onMinify}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>压缩为单行</TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Theme and help */}
      <div className="flex items-center gap-0.5 md:gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 relative">
              <Sun className="h-4 w-4 md:h-[1.2rem] md:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 md:h-[1.2rem] md:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
            <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9">
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
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" asChild>
              <a href="https://github.com/Ylemir/DataForge" target="_blank" rel="noopener noreferrer">
                <Github className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>GitHub</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
