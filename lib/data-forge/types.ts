export type DataFormat = 'json' | 'yaml' | 'toml' | 'xml' | 'csv'

export interface ParsedData {
  data: unknown
  format: DataFormat
  error?: string
}

export interface TreeNode {
  id: string
  key: string
  value: unknown
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  path: string
  children?: TreeNode[]
  expanded?: boolean
}

export interface QueryResult {
  success: boolean
  data: unknown
  path: string
  error?: string
}

export interface HistoryEntry {
  id: string
  query: string
  timestamp: number
  type: 'query' | 'put' | 'delete'
}

export interface ConversionOptions {
  indent?: number
  csvDelimiter?: string
  xmlRootName?: string
}

export interface EditorState {
  content: string
  format: DataFormat
  parsedData: unknown | null
  error: string | null
  isDirty: boolean
}

export interface AppState {
  editor: EditorState
  selectedPath: string | null
  queryHistory: HistoryEntry[]
  favorites: string[]
  outputFormat: DataFormat
  theme: 'light' | 'dark' | 'system'
}
