'use client'

import * as React from 'react'
import { toast } from 'sonner'

interface UseClipboardOptions {
  timeout?: number
  onSuccess?: (text: string) => void
  onError?: (error: Error) => void
}

interface UseClipboardReturn {
  copied: boolean
  copy: (text: string) => Promise<boolean>
  copyValue: (value: unknown) => Promise<boolean>
  copyPath: (path: string) => Promise<boolean>
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const copy = React.useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onSuccess?.(text)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setCopied(false)
      }, timeout)

      return true
    } catch (error) {
      const err = error instanceof Error ? error : new Error('复制失败')
      onError?.(err)
      console.error('Failed to copy:', err)
      return false
    }
  }, [timeout, onSuccess, onError])

  const copyValue = React.useCallback(async (value: unknown): Promise<boolean> => {
    const text = typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value)
    const success = await copy(text)
    if (success) {
      toast.success('值已复制')
    }
    return success
  }, [copy])

  const copyPath = React.useCallback(async (path: string): Promise<boolean> => {
    const success = await copy(path)
    if (success) {
      toast.success('路径已复制')
    }
    return success
  }, [copy])

  return { copied, copy, copyValue, copyPath }
}
