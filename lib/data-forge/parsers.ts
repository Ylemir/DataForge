import type { DataFormat, ParsedData, QueryResult, TreeNode } from './types'
import * as YAML from 'yaml'
import * as TOML from '@iarna/toml'
import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser'
import Papa from 'papaparse'

type TomlRoot = TOML.JsonMap

// Module-level cached instances for parsers that are created frequently
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  parseTagValue: true,
})

const xmlBuilderCache = new Map<number, XMLBuilder>()

function getXmlBuilder(indent: number): XMLBuilder {
  let builder = xmlBuilderCache.get(indent)
  if (!builder) {
    builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      format: true,
      indentBy: ' '.repeat(indent),
    })
    xmlBuilderCache.set(indent, builder)
  }
  return builder
}

interface DetectionResult {
  format: DataFormat
  /** Pre-parsed data from detection to avoid re-parsing in parseContent */
  data?: unknown
}

// Detect data format from content
export function detectFormat(content: string): DataFormat
export function detectFormat(content: string, parse: true): DetectionResult
export function detectFormat(content: string, parse?: true): DataFormat | DetectionResult {
  const trimmed = content.trim()

  // JSON detection
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const data = JSON.parse(trimmed)
      if (parse) return { format: 'json', data }
      return 'json'
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // XML detection
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    const validation = XMLValidator.validate(trimmed)
    if (validation === true) {
      return parse ? { format: 'xml' } : 'xml'
    }
  }

  // TOML detection - check for typical TOML patterns
  if (/^\s*\[[\w.-]+\]\s*$/m.test(trimmed) ||
      /^\s*\[\[[\w.-]+\]\]\s*$/m.test(trimmed) ||
      /^\s*\w+\s*=\s*.+/m.test(trimmed)) {
    try {
      const data = TOML.parse(trimmed)
      if (parse) return { format: 'toml', data }
      return 'toml'
    } catch {
      // Not valid TOML
    }
  }

  // CSV detection - check for consistent comma/tab separated values
  const lines = trimmed.split('\n').filter(l => l.trim())
  if (lines.length > 1) {
    const firstLineCommas = (lines[0].match(/,/g) || []).length
    const secondLineCommas = (lines[1].match(/,/g) || []).length
    if (firstLineCommas > 0 && firstLineCommas === secondLineCommas) {
      return parse ? { format: 'csv' } : 'csv'
    }
  }

  // Default to YAML (most permissive)
  return parse ? { format: 'yaml' } : 'yaml'
}

// Parse content based on format
export function parseContent(content: string, format?: DataFormat): ParsedData {
  let detectedFormat: DataFormat
  let data: unknown

  if (format) {
    detectedFormat = format
    data = undefined
  } else {
    const result = detectFormat(content, true)
    detectedFormat = result.format
    data = result.data
  }

  try {
    // If detection already parsed the data, skip re-parsing
    if (data === undefined) {
      switch (detectedFormat) {
        case 'json':
          data = JSON.parse(content)
          break

        case 'yaml':
          data = YAML.parse(content)
          break

        case 'toml':
          data = TOML.parse(content)
          break

        case 'xml':
          data = xmlParser.parse(content)
          break

        case 'csv': {
          const result = Papa.parse(content, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
          })
          if (result.errors.length > 0) {
            throw new Error(result.errors[0].message)
          }
          data = result.data
          break
        }

        default:
          throw new Error(`Unsupported format: ${detectedFormat}`)
      }
    }

    return { data, format: detectedFormat }
  } catch (error) {
    return {
      data: null,
      format: detectedFormat,
      error: error instanceof Error ? error.message : 'Parse error',
    }
  }
}

// Stringify data to format
export function stringifyData(
  data: unknown,
  format: DataFormat,
  options: { indent?: number; csvDelimiter?: string; xmlRootName?: string } = {}
): string {
  const { indent = 2, csvDelimiter = ',', xmlRootName = 'root' } = options
  
  try {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, indent)
        
      case 'yaml':
        return YAML.stringify(data, { indent })
        
      case 'toml':
        if (typeof data !== 'object' || data === null) {
          throw new Error('TOML requires an object at the root level')
        }
        return TOML.stringify(data as unknown as TomlRoot)
        
      case 'xml':
        const builder = getXmlBuilder(indent)
        const wrapped = typeof data === 'object' && data !== null && !Array.isArray(data)
          ? data
          : { [xmlRootName]: data }
        return builder.build(wrapped)
        
      case 'csv':
        if (!Array.isArray(data)) {
          throw new Error('CSV requires an array at the root level')
        }
        return Papa.unparse(data, { delimiter: csvDelimiter })
        
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Stringify error')
  }
}

// Build tree structure from data
export function buildTree(data: unknown, path = '', key = 'root'): TreeNode {
  const id = path || 'root'
  const type = getType(data)
  
  const node: TreeNode = {
    id,
    key,
    value: data,
    type,
    path: path || '$',
  }
  
  if (type === 'object' && data !== null) {
    node.children = Object.entries(data as Record<string, unknown>).map(
      ([k, v]) => buildTree(v, path ? `${path}.${k}` : k, k)
    )
    node.expanded = path === '' // Expand root by default
  } else if (type === 'array') {
    node.children = (data as unknown[]).map((item, index) =>
      buildTree(item, path ? `${path}[${index}]` : `[${index}]`, `[${index}]`)
    )
    node.expanded = path === '' // Expand root by default
  }
  
  return node
}

// Get type of value
function getType(value: unknown): TreeNode['type'] {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  const type = typeof value
  if (type === 'object') return 'object'
  if (type === 'string') return 'string'
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'boolean'
  return 'string'
}

// Query data using path expression
export function queryData(data: unknown, path: string): QueryResult {
  if (!path || path === '$' || path === '.') {
    return { success: true, data }
  }
  
  try {
    // Remove leading $ or .
    let normalizedPath = path.replace(/^\$\.?/, '').replace(/^\./, '')
    
    // Handle wildcard queries like .items[*].name
    if (normalizedPath.includes('[*]')) {
      return handleWildcardQuery(data, normalizedPath)
    }
    
    // Simple path traversal
    const parts = parsePath(normalizedPath)
    let current = data
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return { success: false, data: undefined, error: `Path not found: ${path}` }
      }
      
      if (part.type === 'index') {
        if (!Array.isArray(current)) {
          return { success: false, data: undefined, error: `Cannot index non-array at ${part.value}` }
        }
        current = current[part.value as number]
      } else {
        if (typeof current !== 'object') {
          return { success: false, data: undefined, error: `Cannot access property on non-object at ${part.value}` }
        }
        current = (current as Record<string, unknown>)[part.value as string]
      }
    }

    if (current === undefined) {
      return { success: false, data: undefined, error: `Path not found: ${path}` }
    }

    return { success: true, data: current }
  } catch (error) {
    return {
      success: false,
      data: undefined,
      error: error instanceof Error ? error.message : 'Query error',
    }
  }
}

// Parse path into parts
function parsePath(path: string): Array<{ type: 'key' | 'index'; value: string | number }> {
  const parts: Array<{ type: 'key' | 'index'; value: string | number }> = []
  const tokenRegex = /\[(\d+)\]|\[(["'])(.*?)\2\]|\.?([^\.\[\]]+)/g

  let match: RegExpExecArray | null
  while ((match = tokenRegex.exec(path)) !== null) {
    if (match[1] !== undefined) {
      parts.push({ type: 'index', value: parseInt(match[1], 10) })
      continue
    }

    if (match[3] !== undefined) {
      parts.push({ type: 'key', value: match[3] })
      continue
    }

    if (match[4]) {
      parts.push({ type: 'key', value: match[4] })
    }
  }

  return parts
}

// Handle wildcard queries
function handleWildcardQuery(data: unknown, path: string): QueryResult {
  const parts = path.split('[*]')
  if (parts.length !== 2) {
    return { success: false, data: undefined, error: 'Only single wildcard supported' }
  }
  
  const [before, after] = parts
  
  // Get array
  const arrayResult = before ? queryData(data, before) : { success: true, data }
  if (!arrayResult.success || !Array.isArray(arrayResult.data)) {
    return { success: false, data: undefined, error: 'Wildcard target is not an array' }
  }
  
  // Apply after path to each element
  const afterPath = after.replace(/^\./, '')
  const results = arrayResult.data.map(item => {
    if (!afterPath) return item
    const result = queryData(item, afterPath)
    return result.success ? result.data : undefined
  })
  
  return { success: true, data: results }
}

// Navigate to the parent of the target node at the given path.
// Returns the parent object/array and the last path segment for operation.
interface PathTarget {
  parent: unknown
  lastPart: { type: 'key' | 'index'; value: string | number }
}

function navigateToParent(
  root: unknown,
  path: string
): { success: true; data: PathTarget } | { success: false; error: string } {
  const normalizedPath = path.replace(/^\$\.?/, '').replace(/^\./, '')
  const parts = parsePath(normalizedPath)

  if (parts.length === 0) {
    return { success: false, error: 'Invalid path' }
  }

  let current: unknown = root
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (part.type === 'index') {
      if (!Array.isArray(current)) {
        return { success: false, error: 'Cannot index non-array' }
      }
      current = current[part.value as number]
    } else {
      if (typeof current !== 'object' || current === null) {
        return { success: false, error: 'Cannot access property on non-object' }
      }
      current = (current as Record<string, unknown>)[part.value as string]
    }
  }

  return { success: true, data: { parent: current, lastPart: parts[parts.length - 1] } }
}

// Put value at path
export function putAtPath(data: unknown, path: string, value: unknown): { success: boolean; data: unknown; error?: string } {
  if (!path || path === '$') {
    return { success: true, data: value }
  }

  try {
    const cloned = structuredClone(data)
    const nav = navigateToParent(cloned, path)
    if (!nav.success) {
      return { success: false, data: cloned, error: nav.error }
    }

    const { parent, lastPart } = nav.data

    if (lastPart.type === 'index') {
      if (!Array.isArray(parent)) {
        return { success: false, data: cloned, error: 'Cannot index non-array' }
      }
      ;(parent as unknown[])[lastPart.value as number] = value
    } else {
      if (typeof parent !== 'object' || parent === null) {
        return { success: false, data: cloned, error: 'Cannot set property on non-object' }
      }
      ;(parent as Record<string, unknown>)[lastPart.value as string] = value
    }

    return { success: true, data: cloned }
  } catch (error) {
    return {
      success: false,
      data,
      error: error instanceof Error ? error.message : 'Put error',
    }
  }
}

// Delete at path
export function deleteAtPath(data: unknown, path: string): { success: boolean; data: unknown; error?: string } {
  if (!path || path === '$') {
    return { success: false, data, error: 'Cannot delete root' }
  }

  try {
    const cloned = structuredClone(data)
    const nav = navigateToParent(cloned, path)
    if (!nav.success) {
      return { success: false, data: cloned, error: nav.error }
    }

    const { parent, lastPart } = nav.data

    if (lastPart.type === 'index') {
      if (!Array.isArray(parent)) {
        return { success: false, data: cloned, error: 'Cannot index non-array' }
      }
      ;(parent as unknown[]).splice(lastPart.value as number, 1)
    } else {
      if (typeof parent !== 'object' || parent === null) {
        return { success: false, data: cloned, error: 'Cannot delete from non-object' }
      }
      delete (parent as Record<string, unknown>)[lastPart.value as string]
    }

    return { success: true, data: cloned }
  } catch (error) {
    return {
      success: false,
      data,
      error: error instanceof Error ? error.message : 'Delete error',
    }
  }
}
