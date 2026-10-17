import type { KeywordLibrary, KeywordTypeOption } from '../data/keywordLibraries'

export const TITLE_LENGTH_MIN = 19
export const TITLE_LENGTH_MAX = 21
export const DEFAULT_TITLE_QUANTITY = 5
export const MAX_TITLE_QUANTITY = 50

export type TitleExclusions = {
  colors: boolean
  fleece: boolean
  winter: boolean
  highHeel: boolean
  customWords: readonly string[]
}

export type GenerateTitlesOptions = {
  library: KeywordLibrary
  typeId: string
  fixedWord: string
  quantity: number
  exclusions: TitleExclusions
  previousTitles?: readonly string[]
  seed?: number
}

export type GeneratedTitle = {
  text: string
  charCount: number
}

export type GenerationResult = {
  titles: GeneratedTitle[]
  error: string | null
}

type GroupKey =
  | 'style'
  | 'material'
  | 'design'
  | 'newness'
  | 'scene'
  | 'color'
  | 'function'
  | 'season'
  | 'audience'

type TokenGroup = {
  key: GroupKey
  tokens: readonly string[]
  chance: number
}

const COLOR_WORDS = ['黑', '白', '棕', '卡其', '灰']

const BASE_TOKEN_GROUPS: readonly TokenGroup[] = [
  {
    key: 'style',
    tokens: [
      '法式',
      '洋气',
      '气质',
      '高级感',
      '炸街',
      '中古',
      '韩里韩气',
      '巨好看',
      '超火',
      '绝美',
      '精致',
      '百搭',
      '流行',
      '今年流行',
      '爆款',
      '正版',
      '超好看',
    ],
    chance: 0.88,
  },
  {
    key: 'material',
    tokens: ['真皮', '小羊皮', '超软小羊皮', '皮毛一体', '毛绒', '毛毛'],
    chance: 0.62,
  },
  {
    key: 'design',
    tokens: ['高跟', '粗跟', '厚底', '尖头', '方头', '增高', '内增高', '松糕', '全包', '一脚蹬', '厚底全包', '绝美厚底'],
    chance: 0.82,
  },
  {
    key: 'newness',
    tokens: ['新款'],
    chance: 0.55,
  },
  {
    key: 'scene',
    tokens: ['配裙子', '配大衣', '配阔腿裤', '上班久站'],
    chance: 0.2,
  },
  {
    key: 'color',
    tokens: ['黑色', '白色', '棕色', '卡其色', '灰色'],
    chance: 0.8,
  },
  {
    key: 'function',
    tokens: [
      '加绒',
      '加厚',
      '保暖',
      '防水',
      '防滑',
      '防水防滑',
      '防滑防水',
      '不累脚',
      '软底',
      '超轻',
      '显高',
      '外穿',
      '加绒加厚',
      '加绒加厚防水防滑',
      '舒服不累脚',
      '软底不累脚',
    ],
    chance: 0.7,
  },
  {
    key: 'season',
    tokens: ['秋冬', '冬季', '早秋', '冬', '秋'],
    chance: 0.55,
  },
  {
    key: 'audience',
    tokens: ['女', '女款', '女士', '小个子', '大码', '孕妇', '初中生', '老年人'],
    chance: 0.88,
  },
]

function countHanCharacters(value: string): number {
  return (value.match(/[\u3400-\u4dbf\u4e00-\u9fff]/g) ?? []).length
}

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(values: readonly T[], random: () => number): T | undefined {
  if (values.length === 0) return undefined
  return values[Math.floor(random() * values.length)]
}

function getTypeOption(library: KeywordLibrary, typeId: string): KeywordTypeOption | null {
  return library.types.find((type) => type.id === typeId) ?? null
}

function resolveTypeToken(
  library: KeywordLibrary,
  type: KeywordTypeOption,
  fixedWord: string,
): { typeToken: string; error: string | null } {
  const matchingCores = type.cores.filter((core) =>
    library.keywords.some((item) => item.keyword.includes(core)),
  )

  if (matchingCores.length === 0) {
    return {
      typeToken: '',
      error: `当前「${library.label}」词库中找不到「${type.label}」相关关键词，请先在词库管理中替换 xlsx。`,
    }
  }

  const fixedHasType = type.cores.some((core) => fixedWord.includes(core))
  return {
    typeToken: fixedHasType ? '' : matchingCores[0],
    error: null,
  }
}

function buildTitle(
  fixedWord: string,
  typeToken: string,
  picks: Partial<Record<GroupKey, string>>,
): string {
  const chunks = [
    fixedWord,
    [picks.style, picks.material].filter(Boolean).join(''),
    [picks.design, picks.newness].filter(Boolean).join(''),
    [
      picks.scene,
      picks.color,
      picks.function,
      typeToken,
      picks.audience,
      picks.season,
    ]
      .filter(Boolean)
      .join(''),
  ]

  return chunks.filter(Boolean).join(' ')
}

export function generateTitles(options: GenerateTitlesOptions): GenerationResult {
  const fixedWord = options.fixedWord.trim().replace(/\s+/g, ' ')
  const quantity = Number(options.quantity)
  const seed = options.seed ?? 20261008
  const { library } = options

  if (!fixedWord) {
    return { titles: [], error: '请先填写固定词。' }
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_TITLE_QUANTITY) {
    return {
      titles: [],
      error: `生成数量需为 1–${MAX_TITLE_QUANTITY} 之间的整数。`,
    }
  }
  if (library.keywords.length === 0) {
    return {
      titles: [],
      error: `「${library.label}」当前没有关键词数据，请先在词库管理中替换 xlsx。`,
    }
  }

  const type = getTypeOption(library, options.typeId)
  if (!type) {
    return { titles: [], error: '请选择有效的鞋子类型。' }
  }

  const customWords = options.exclusions.customWords
    .map((word) => word.trim())
    .filter(Boolean)

  const fixedExclusions = [
    ...(options.exclusions.colors ? COLOR_WORDS : []),
    ...(options.exclusions.fleece ? ['加绒'] : []),
    ...(options.exclusions.winter ? ['冬'] : []),
    ...(options.exclusions.highHeel ? ['高跟'] : []),
    ...customWords,
  ]

  const blockedBy = fixedExclusions.find((word) => fixedWord.includes(word))
  if (blockedBy) {
    return {
      titles: [],
      error: `固定词与排除条件冲突：固定词中包含“${blockedBy}”。`,
    }
  }

  const { typeToken, error: typeError } = resolveTypeToken(library, type, fixedWord)
  if (typeError) {
    return { titles: [], error: typeError }
  }

  const fixedLength = countHanCharacters(fixedWord)
  if (fixedLength + countHanCharacters(typeToken) > TITLE_LENGTH_MAX) {
    return {
      titles: [],
      error: `固定词加鞋型已有 ${fixedLength + countHanCharacters(typeToken)} 个汉字，无法控制在 ${TITLE_LENGTH_MIN}–${TITLE_LENGTH_MAX} 字。`,
    }
  }

  const availableGroups: TokenGroup[] = []

  for (const group of BASE_TOKEN_GROUPS) {
    if (group.key === 'color' && options.exclusions.colors) continue

    const tokens = group.tokens.filter((token) => {
      if (!library.keywords.some((item) => item.keyword.includes(token))) return false
      if (fixedWord.includes(token) || token.includes(fixedWord)) return false
      if (typeToken && (typeToken.includes(token) || token.includes(typeToken))) return false
      if (options.exclusions.fleece && token.includes('加绒')) return false
      if (options.exclusions.winter && token.includes('冬')) return false
      if (options.exclusions.highHeel && token.includes('高跟')) return false
      if (customWords.some((word) => token.includes(word))) return false
      return true
    })

    if (tokens.length > 0) {
      availableGroups.push({ ...group, tokens })
    }
  }

  const maxOptionalLength = availableGroups.reduce(
    (total, group) =>
      total + Math.max(...group.tokens.map((token) => countHanCharacters(token))),
    0,
  )

  if (fixedLength + countHanCharacters(typeToken) + maxOptionalLength < TITLE_LENGTH_MIN) {
    return {
      titles: [],
      error: `「${library.label}」当前只有 ${library.keywords.length} 条关键词，可用组合不足以生成 ${TITLE_LENGTH_MIN}–${TITLE_LENGTH_MAX} 字标题。请先在词库管理中替换更完整的 xlsx。`,
    }
  }

  const random = mulberry32(seed)
  const usedTitles = new Set(options.previousTitles ?? [])
  const titles: GeneratedTitle[] = []
  const maxAttempts = 80000

  for (let attempt = 0; attempt < maxAttempts && titles.length < quantity; attempt += 1) {
    const picks: Partial<Record<GroupKey, string>> = {}

    for (const group of availableGroups) {
      if (random() < group.chance) {
        const token = pick(group.tokens, random)
        if (token) picks[group.key] = token
      }
    }

    if (picks.season === '早秋' && picks.function?.includes('加绒')) continue
    if (picks.season === '早秋' && picks.scene === '配大衣') continue
    if (picks.style === '中古' && picks.newness === '新款') continue

    const selectedTokens = Object.values(picks).filter(
      (token): token is string => Boolean(token),
    )
    const hasOverlap = selectedTokens.some((token, index) =>
      selectedTokens.some(
        (other, otherIndex) =>
          index < otherIndex && (token.includes(other) || other.includes(token)),
      ),
    )
    if (hasOverlap) continue

    const text = buildTitle(fixedWord, typeToken, picks)
    const charCount = countHanCharacters(text)

    if (charCount < TITLE_LENGTH_MIN || charCount > TITLE_LENGTH_MAX) continue
    if (usedTitles.has(text)) continue

    usedTitles.add(text)
    titles.push({ text, charCount })
  }

  if (titles.length < quantity) {
    return {
      titles: [],
      error: `当前固定词、类目和限制条件下，无法生成足够数量的 ${TITLE_LENGTH_MIN}–${TITLE_LENGTH_MAX} 字标题。请减少数量，或放宽排除条件。`,
    }
  }

  return { titles, error: null }
}

export { countHanCharacters }
