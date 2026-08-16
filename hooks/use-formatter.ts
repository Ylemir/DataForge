'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { stringifyData } from '@/lib/data-forge/parsers'
import type { DataFormat } from '@/lib/data-forge/types'

interface UseFormatterOptions {
  data: unknown
  format: DataFormat
  onFormat?: (formatted: string) => void
  onMinify?: (minified: string) => void
  onError?: (error: Error) => void
}

interface UseFormatterReturn {
  formatData: () => string | null
  minify: () => string | null
  convert: (targetFormat: DataFormat) => string | null
  isFormattable: boolean
}

export function useFormatter(options: UseFormatterOptions): UseFormatterReturn {
  const { data, format: sourceFormat, onFormat, onMinify, onError } = options

  // undefined 表示"无有效数据";null 是合法的数据值(如 JSON 的 null)
  const isFormattable = React.useMemo(() => {
    return data !== undefined
  }, [data])

  const formatData = React.useCallback((): string | null => {
    if (!isFormattable) {
      toast.error('请先输入有效数据')
      return null
    }
    try {
      const formatted = stringifyData(data, sourceFormat, { indent: 2 })
      onFormat?.(formatted)
      toast.success('格式化完成')
      return formatted
    } catch (error) {
      const err = error instanceof Error ? error : new Error('格式化失败')
      onError?.(err)
      toast.error(err.message)
      return null
    }
  }, [data, sourceFormat, isFormattable, onFormat, onError])

  const minify = React.useCallback((): string | null => {
    if (!isFormattable) {
      toast.error('请先输入有效数据')
      return null
    }
    // YAML/TOML/CSV 依赖换行作为语法,删除换行会破坏数据
    if (sourceFormat === 'yaml' || sourceFormat === 'toml' || sourceFormat === 'csv') {
      toast.error(`${sourceFormat.toUpperCase()} 格式依赖换行,不支持压缩`)
      return null
    }
    try {
      const minified = stringifyData(data, sourceFormat, { indent: 0 }).replace(/\n\s*/g, '')
      onMinify?.(minified)
      toast.success('压缩完成')
      return minified
    } catch (error) {
      const err = error instanceof Error ? error : new Error('压缩失败')
      onError?.(err)
      toast.error(err.message)
      return null
    }
  }, [data, sourceFormat, isFormattable, onMinify, onError])

  const convert = React.useCallback((targetFormat: DataFormat): string | null => {
    if (!isFormattable) {
      toast.error('请先输入有效数据')
      return null
    }
    try {
      const converted = stringifyData(data, targetFormat)
      toast.success(`已转换为 ${targetFormat.toUpperCase()} 格式`)
      return converted
    } catch (error) {
      const err = error instanceof Error ? error : new Error('转换失败')
      onError?.(err)
      toast.error(err.message)
      return null
    }
  }, [data, isFormattable, onError])

  return { formatData, minify, convert, isFormattable }
}
