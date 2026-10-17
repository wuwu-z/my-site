import { FASHION_BOOT_KEYWORDS } from '../data/fashionBootKeywords'

export const BOOT_TYPES = ['短靴', '中筒靴', '长靴', '过膝靴'] as const
export type BootType = (typeof BOOT_TYPES)[number]

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
  fixedWord: string
  bootType: BootType
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
  | 'pairing'
  | 'color'
  | 'function'
  | 'season'
  | 'audience'
  | 'detail'

type TokenGroup = {
  key: GroupKey
  tokens: readonly string[]
  chance: number
}

const KEYWORD_TEXTS = FASHION_BOOT_KEYWORDS.map((item) => item.keyword)

const TYPE_CORES: Record<BootType, readonly string[]> = {
  短靴: ['短靴'],
  中筒靴: ['中筒靴'],
  长靴: ['长靴', '长筒靴'],
  过膝靴: ['过膝靴', '过膝长靴'],
}

const COLOR_WORDS = ['黑', '白', '棕', '卡其']

const BASE_TOKEN_GROUPS: readonly TokenGroup[] = [
  {
    key: 'style',
    tokens: ['法式', '洋气', '气质', '高级感', '炸街', '中古', '韩里韩气', '巨好看', '超火', '绝美', '精致'],
    chance: 0.9,
  },
  {
    key: 'material',
    tokens: ['真皮', '小羊皮', '超软小羊皮'],
    chance: 0.8,
  },
  {
    key: 'design',
    tokens: ['高跟', '粗跟', '厚底', '尖头', '方头'],
    chance: 0.8,
  },
  {
    key: 'newness',
    tokens: ['新款'],
    chance: 0.55,
  },
  {
    key: 'pairing',
    tokens: ['配裙子', '配大衣'],
    chance: 0.25,
  },
  {
    key: 'color',
    tokens: ['黑色', '白色', '棕色', '卡其色'],
    chance: 0.85,
  },
  {
    key: 'function',
    tokens: ['加绒'],
    chance: 0.55,
  },
  {
    key: 'season',
    tokens: ['秋冬', '冬季', '早秋'],
    chance: 0.6,
  },
  {
    key: 'audience',
    tokens: ['女', '女款', '女士', '小个子', '大码'],
    chance: 0.9,
  },
]

const DETAIL_GROUP: TokenGroup = {
  key: 'detail',
  tokens: ['修饰腿型'],
  chance: 0.35,
}

function sourceContains(token: string): boolean {
  return KEYWORD_TEXTS.some((keyword) => keyword.includes(token))
}

export function countHanCharacters(value: string): number {
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

function buildTitle(
  fixedWord: string,
  bootType: BootType,
  typeToken: string,
  picks: Partial<Record<GroupKey, string>>,
): string {
  const chunks = [
    fixedWord,
    [picks.style, picks.material].filter(Boolean).join(''),
    [picks.design, picks.newness].filter(Boolean).join(''),
    [picks.pairing, picks.color, picks.function, typeToken, picks.season, picks.audience]
      .filter(Boolean)
      .join(''),
    bootType === '长靴' || bootType === '过膝靴' ? picks.detail : '',
  ]

  return chunks.filter((chunk): chunk is string => Boolean(chunk)).join(' ')
}

export function generateTitles(options: GenerateTitlesOptions): GenerationResult {
  const fixedWord = options.fixedWord.trim().replace(/\s+/g, ' ')
  const quantity = Number(options.quantity)
  const seed = options.seed ?? 20261008

  if (!fixedWord) {
    return { titles: [], error: '请先填写固定词。' }
  }
  if (!BOOT_TYPES.includes(options.bootType)) {
    return { titles: [], error: '请选择有效的鞋子类型。' }
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_TITLE_QUANTITY) {
    return {
      titles: [],
      error: `生成数量需为 1–${MAX_TITLE_QUANTITY} 之间的整数。`,
    }
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

  const typeCores = TYPE_CORES[options.bootType]
  const fixedHasType = typeCores.some((core) => fixedWord.includes(core))
  const typeToken = fixedHasType ? '' : typeCores[0]

  const fixedLength = countHanCharacters(fixedWord)
  const typeLength = countHanCharacters(typeToken)
  if (fixedLength + typeLength > TITLE_LENGTH_MAX) {
    return {
      titles: [],
      error: `固定词加鞋型已有 ${fixedLength + typeLength} 个汉字，无法控制在 ${TITLE_LENGTH_MIN}–${TITLE_LENGTH_MAX} 字。`,
    }
  }

  const availableGroups: TokenGroup[] = []
  const withDetails = [
    ...BASE_TOKEN_GROUPS,
    ...(options.bootType === '长靴' || options.bootType === '过膝靴' ? [DETAIL_GROUP] : []),
  ]

  for (const group of withDetails) {
    if (group.key === 'color' && options.exclusions.colors) continue
    const tokens = group.tokens.filter((token) => {
      if (!sourceContains(token)) return false
      if (fixedWord.includes(token)) return false
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

  const random = mulberry32(seed)
  const usedTitles = new Set(options.previousTitles ?? [])
  const titles: GeneratedTitle[] = []
  const maxAttempts = 60000

  for (let attempt = 0; attempt < maxAttempts && titles.length < quantity; attempt += 1) {
    const picks: Partial<Record<GroupKey, string>> = {}

    for (const group of availableGroups) {
      if (random() < group.chance) {
        const token = pick(group.tokens, random)
        if (token) picks[group.key] = token
      }
    }

    if (picks.season === '早秋' && picks.function === '加绒') continue
    if (picks.season === '早秋' && picks.pairing === '配大衣') continue
    if (picks.style === '中古' && picks.newness === '新款') continue

    const text = buildTitle(fixedWord, options.bootType, typeToken, picks)
    const charCount = countHanCharacters(text)

    if (charCount < TITLE_LENGTH_MIN || charCount > TITLE_LENGTH_MAX) continue
    if (usedTitles.has(text)) continue

    usedTitles.add(text)
    titles.push({ text, charCount })
  }

  if (titles.length < quantity) {
    return {
      titles: [],
      error: '当前固定词和限制条件下，无法生成足够数量的 19–21 字标题。请减少数量，或放宽排除条件。',
    }
  }

  return { titles, error: null }
}
