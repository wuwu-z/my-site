import {
  DEFAULT_LIBRARIES,
  type KeywordEntry,
  type KeywordLibrary,
} from '../data/keywordLibraries'

const STORAGE_KEY = 'my-site:keyword-library-overrides:v1'
const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_SEARCH_ROWS = 20000

export type LibraryWithStatus = KeywordLibrary & {
  isCustom: boolean
  importedAt?: string
}

export type ImportedKeywordPayload = {
  keywords: KeywordEntry[]
  source: string
  skippedRows: number
  duplicateRows: number
}

type StoredOverride = {
  keywords: KeywordEntry[]
  source: string
  importedAt: string
}

function isKeywordEntry(value: unknown): value is KeywordEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as { keyword?: unknown; searchIndex?: unknown }
  return (
    typeof entry.keyword === 'string' &&
    entry.keyword.trim().length > 0 &&
    typeof entry.searchIndex === 'number' &&
    Number.isFinite(entry.searchIndex) &&
    entry.searchIndex >= 0
  )
}

function sanitizeStoredOverride(value: unknown): StoredOverride | null {
  if (typeof value !== 'object' || value === null) return null
  const override = value as {
    keywords?: unknown
    source?: unknown
    importedAt?: unknown
  }
  if (!Array.isArray(override.keywords) || typeof override.source !== 'string') {
    return null
  }

  const keywords = override.keywords.filter(isKeywordEntry)
  if (keywords.length === 0) return null

  return {
    keywords,
    source: override.source,
    importedAt:
      typeof override.importedAt === 'string'
        ? override.importedAt
        : new Date().toISOString(),
  }
}

function readOverrides(): Record<string, StoredOverride> {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {}
    }

    const result: Record<string, StoredOverride> = {}
    for (const [id, value] of Object.entries(parsed)) {
      const override = sanitizeStoredOverride(value)
      if (override) result[id] = override
    }
    return result
  } catch {
    return {}
  }
}

function writeOverrides(overrides: Record<string, StoredOverride>) {
  try {
    const serialized = JSON.stringify(overrides)
    window.localStorage.setItem(STORAGE_KEY, serialized)
  } catch {
    throw new Error('浏览器本地存储空间不足，无法保存关键词库。请清理站点数据后重试。')
  }
}

function formatImportedLabel(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return '本地导入'
  return `本地导入 · ${date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`
}

export function getLibraries(): LibraryWithStatus[] {
  const overrides = readOverrides()

  return DEFAULT_LIBRARIES.map((library) => {
    const override = overrides[library.id]
    if (!override) {
      return { ...library, isCustom: false }
    }

    return {
      ...library,
      keywords: override.keywords,
      source: override.source,
      version: formatImportedLabel(override.importedAt),
      importedAt: override.importedAt,
      isCustom: true,
    }
  })
}

export function getLibrary(id: string): LibraryWithStatus | undefined {
  return getLibraries().find((library) => library.id === id)
}

export function getTotalKeywordCount(libraries: KeywordLibrary[]): number {
  return libraries.reduce((total, library) => total + library.keywords.length, 0)
}

export function saveLibraryOverride(
  id: string,
  payload: ImportedKeywordPayload,
): LibraryWithStatus {
  const library = DEFAULT_LIBRARIES.find((item) => item.id === id)
  if (!library) throw new Error('找不到要替换的关键词类目。')
  if (payload.keywords.length === 0) throw new Error('表格中没有可导入的关键词。')

  const overrides = readOverrides()
  const importedAt = new Date().toISOString()
  overrides[id] = {
    keywords: payload.keywords,
    source: payload.source,
    importedAt,
  }
  writeOverrides(overrides)

  const saved = getLibraries().find((item) => item.id === id)
  if (!saved) throw new Error('关键词库保存失败，请重试。')
  return saved
}

export function resetLibraryOverride(id: string): LibraryWithStatus {
  const overrides = readOverrides()
  delete overrides[id]
  writeOverrides(overrides)

  const reset = getLibraries().find((library) => library.id === id)
  if (!reset) throw new Error('恢复默认词库失败，请重试。')
  return reset
}

export function resetAllLibraryOverrides() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    throw new Error('无法清除本地关键词库，请检查浏览器存储权限。')
  }
}

export function getLibraryStatus(library: KeywordLibrary): {
  tone: 'ready' | 'low' | 'empty'
  label: string
} {
  if (library.keywords.length === 0) {
    return { tone: 'empty', label: '暂无数据' }
  }
  if (library.keywords.length < 20) {
    return { tone: 'low', label: '数据偏少' }
  }
  return { tone: 'ready', label: '可生成' }
}

function isFile(input: unknown): input is File {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof (input as File).name === 'string' &&
    typeof (input as File).size === 'number'
  )
}

export async function parseKeywordWorkbook(file: File): Promise<ImportedKeywordPayload> {
  if (!isFile(file)) throw new Error('请选择一个有效的 .xlsx 文件。')
  if (!/\.xlsx$/i.test(file.name)) {
    throw new Error('仅支持 .xlsx 文件；请另存为 Excel 工作簿后再上传。')
  }
  if (file.size === 0) throw new Error('文件为空，请检查后再上传。')
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('文件不能超过 10 MB。')
  }

  let rows: unknown[][]

  try {
    const { readSheet } = await import('read-excel-file/browser')
    const sheet = await readSheet(file)
    rows = sheet as unknown[][]
  } catch {
    throw new Error('无法读取这个 xlsx，请确认文件没有损坏或加密。')
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('表格没有可读取的数据。')
  }

  const searchRows = Math.min(rows.length, 20)
  let headerRowIndex = -1
  let keywordColumn = -1
  let scoreColumn = -1

  for (let rowIndex = 0; rowIndex < searchRows; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue
    const cells = row.map((cell) => String(cell ?? '').trim())
    const keywordIndex = cells.findIndex(
      (cell) => cell === '关键词' || cell === '关键词 ',
    )
    const searchIndex = cells.findIndex((cell) => cell === '搜索指数')
    if (keywordIndex !== -1 && searchIndex !== -1) {
      headerRowIndex = rowIndex
      keywordColumn = keywordIndex
      scoreColumn = searchIndex
      break
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('没有找到表头「关键词 / 搜索指数」，请使用第一个工作表中的这两列。')
  }

  const keywords: KeywordEntry[] = []
  const seen = new Set<string>()
  let skippedRows = 0
  let duplicateRows = 0

  const endRow = Math.min(rows.length, headerRowIndex + 1 + MAX_SEARCH_ROWS)

  for (let rowIndex = headerRowIndex + 1; rowIndex < endRow; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!Array.isArray(row)) continue

    const rawKeyword = row[keywordColumn]
    if (rawKeyword === null || rawKeyword === undefined) continue

    const keyword = String(rawKeyword).trim()
    if (!keyword) continue

    const rawScore = row[scoreColumn]
    if (rawScore === null || rawScore === undefined || String(rawScore).trim() === '') {
      skippedRows += 1
      continue
    }

    const searchIndex =
      typeof rawScore === 'number'
        ? rawScore
        : Number(String(rawScore).replace(/,/g, '').trim())

    if (!Number.isFinite(searchIndex) || searchIndex < 0) {
      skippedRows += 1
      continue
    }
    if (seen.has(keyword)) {
      duplicateRows += 1
      continue
    }

    seen.add(keyword)
    keywords.push({ keyword, searchIndex })
  }

  if (keywords.length === 0) {
    throw new Error('没有读取到有效关键词，请检查「关键词 / 搜索指数」两列的内容。')
  }

  return {
    keywords,
    source: file.name,
    skippedRows,
    duplicateRows,
  }
}
