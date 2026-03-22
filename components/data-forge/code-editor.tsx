'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { DataFormat } from '@/lib/data-forge/types'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  format: DataFormat
  error?: string | null
  readOnly?: boolean
  className?: string
  placeholder?: string
}

export function CodeEditor({
  value,
  onChange,
  format,
  error,
  readOnly = false,
  className,
  placeholder = '在此输入或粘贴数据...',
}: CodeEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = React.useRef<HTMLDivElement>(null)
  const [lineCount, setLineCount] = React.useState(1)

  React.useEffect(() => {
    const lines = value.split('\n').length
    setLineCount(Math.max(lines, 20))
  }, [value])

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      // Set cursor position after tab
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div
        className={cn(
          'relative flex flex-1 overflow-hidden rounded-md border bg-editor-bg font-mono text-sm',
          error ? 'border-destructive' : 'border-border'
        )}
      >
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 select-none overflow-hidden bg-muted/30 py-3 text-right text-muted-foreground"
          style={{ width: '3rem' }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="h-5 px-2 leading-5"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className={cn(
            'flex-1 resize-none bg-transparent p-3 leading-5 outline-none',
            'placeholder:text-muted-foreground/50',
            readOnly && 'cursor-default'
          )}
          style={{
            lineHeight: '1.25rem',
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 flex-shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span className="break-all">{error}</span>
        </div>
      )}
    </div>
  )
}
