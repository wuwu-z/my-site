import { useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  SearchIcon,
  SparkIcon,
} from '../components/Icons'
import type { KeywordLibrary } from '../data/keywordLibraries'
import {
  getLibraries,
  getLibraryStatus,
  getTotalKeywordCount,
  type LibraryWithStatus,
} from '../lib/keywordLibraryStore'
import {
  DEFAULT_TITLE_QUANTITY,
  MAX_TITLE_QUANTITY,
  TITLE_LENGTH_MAX,
  TITLE_LENGTH_MIN,
  generateTitles,
  type GenerationResult,
  type TitleExclusions,
} from '../lib/titleGenerator'

const DEFAULT_FIXED_WORD = '内增高'
const DEFAULT_EXCLUSIONS: TitleExclusions = {
  colors: false,
  fleece: false,
  winter: false,
  highHeel: false,
  customWords: [],
}

function getPreferredType(library: KeywordLibrary | undefined) {
  if (!library) return undefined

  return (
    library.types.find((type) =>
      type.cores.some((core) =>
        library.keywords.some((item) => item.keyword.includes(core)),
      ),
    ) ?? library.types[0]
  )
}

const inputClassName =
  'mt-2 h-11 w-full rounded-xl border border-line bg-canvas/50 px-3.5 text-sm text-ink placeholder:text-muted/50 transition-colors focus:border-accent/60'

const exclusionOptions: ReadonlyArray<{
  key: 'colors' | 'fleece' | 'winter' | 'highHeel'
  label: string
}> = [
  { key: 'colors', label: '不带颜色词' },
  { key: 'fleece', label: '不带加绒' },
  { key: 'winter', label: '不要冬季词' },
  { key: 'highHeel', label: '不要高跟' },
]

export function TitleGeneratorPage() {
  const [searchParams] = useSearchParams()
  const [libraries] = useState<LibraryWithStatus[]>(() => getLibraries())
  const requestedCategoryId = searchParams.get('category')
  const initialLibrary =
    libraries.find((library) => library.id === requestedCategoryId) ?? libraries[0]
  const initialType = getPreferredType(initialLibrary)

  const [categoryId, setCategoryId] = useState(initialLibrary?.id ?? '')
  const [typeId, setTypeId] = useState(initialType?.id ?? '')
  const [fixedWord, setFixedWord] = useState(DEFAULT_FIXED_WORD)
  const [quantity, setQuantity] = useState(String(DEFAULT_TITLE_QUANTITY))
  const [exclusions, setExclusions] = useState({
    colors: false,
    fleece: false,
    winter: false,
    highHeel: false,
  })
  const [customExclusions, setCustomExclusions] = useState('')
  const [keywordQuery, setKeywordQuery] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [copyMessage, setCopyMessage] = useState('')
  const [initialResult] = useState<GenerationResult>(() =>
    generateTitles({
      library: initialLibrary,
      typeId: initialType?.id ?? '',
      fixedWord: DEFAULT_FIXED_WORD,
      quantity: DEFAULT_TITLE_QUANTITY,
      exclusions: DEFAULT_EXCLUSIONS,
      seed: 20261008,
    }),
  )
  const [result, setResult] = useState<GenerationResult>(initialResult)

  const resultsRef = useRef<HTMLDivElement>(null)
  const seedRef = useRef(20261008)
  const seenTitlesRef = useRef(
    new Set(initialResult.titles.map((item) => item.text)),
  )

  const activeLibrary =
    libraries.find((library) => library.id === categoryId) ?? libraries[0]
  const activeType =
    activeLibrary?.types.find((type) => type.id === typeId) ??
    getPreferredType(activeLibrary)
  const activeStatus = activeLibrary ? getLibraryStatus(activeLibrary) : null
  const filteredKeywords =
    activeLibrary?.keywords.filter((item) =>
      item.keyword.toLowerCase().includes(keywordQuery.trim().toLowerCase()),
    ) ?? []

  const indexOne =
    activeLibrary?.keywords.filter((item) => item.searchIndex === 1).length ?? 0
  const indexZero =
    activeLibrary?.keywords.filter((item) => item.searchIndex === 0).length ?? 0
  const indexOther = (activeLibrary?.keywords.length ?? 0) - indexOne - indexZero

  function buildExclusions() {
    return {
      ...exclusions,
      customWords: customExclusions
        .split(/[\s,，、;；]+/)
        .map((word) => word.trim())
        .filter(Boolean),
    }
  }

  function addSeenTitles(nextResult: GenerationResult) {
    for (const title of nextResult.titles) {
      seenTitlesRef.current.add(title.text)
    }
  }

  function setGeneratedResult(
    library: LibraryWithStatus,
    nextTypeId: string,
  ): GenerationResult {
    seedRef.current += 7919
    const nextResult = generateTitles({
      library,
      typeId: nextTypeId,
      fixedWord,
      quantity: Number(quantity),
      exclusions: buildExclusions(),
      previousTitles: [...seenTitlesRef.current],
      seed: seedRef.current,
    })

    setResult(nextResult)
    setCopyState('idle')
    setCopyMessage('')
    addSeenTitles(nextResult)
    return nextResult
  }

  function handleCategoryChange(nextCategoryId: string) {
    const nextLibrary = libraries.find((library) => library.id === nextCategoryId)
    if (!nextLibrary) return

    const nextType = getPreferredType(nextLibrary)
    setCategoryId(nextLibrary.id)
    setTypeId(nextType?.id ?? '')
    setKeywordQuery('')
    setGeneratedResult(nextLibrary, nextType?.id ?? '')
  }

  function handleTypeChange(nextTypeId: string) {
    setTypeId(nextTypeId)
    if (activeLibrary) {
      setGeneratedResult(activeLibrary, nextTypeId)
    }
  }

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeLibrary) return

    setGeneratedResult(activeLibrary, activeType?.id ?? '')

    if (window.innerWidth < 1024) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        })
      })
    }
  }

  async function copyTitles() {
    if (result.titles.length === 0) return

    try {
      await navigator.clipboard.writeText(
        result.titles.map((item) => item.text).join('\n'),
      )
      setCopyState('copied')
      setCopyMessage(`已复制 ${result.titles.length} 条标题`)
      window.setTimeout(() => {
        setCopyState('idle')
        setCopyMessage('')
      }, 1800)
    } catch {
      setCopyState('error')
      setCopyMessage('复制失败，请手动选择标题复制。')
    }
  }

  function toggleExclusion(key: (typeof exclusionOptions)[number]['key']) {
    setExclusions((current) => ({ ...current, [key]: !current[key] }))
  }

  const totalKeywords = getTotalKeywordCount(libraries)

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12 lg:pb-24">
        <nav aria-label="面包屑" className="flex items-center gap-2 text-xs text-muted">
          <Link to="/" className="transition-colors hover:text-ink">
            首页
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">标题生成器</span>
        </nav>

        <div className="mt-6 flex flex-col gap-6 border-b border-line pb-8 sm:mt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              SEO title studio
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">
              鞋类标题生成器
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-[15px] leading-7 text-muted">
              从 {libraries.length} 个鞋类类目、{totalKeywords} 个真实关键词中组合标题。固定词必现，其余片段全部来自当前类目词库。
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
              <span className="size-1.5 rounded-full bg-accent" />
              {activeLibrary?.label ?? '未选择类目'} · {activeLibrary?.keywords.length ?? 0} 条
            </span>
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">
              {activeLibrary?.version ?? '无数据'}
            </span>
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">
              {libraries.length} 个类目
            </span>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section
            aria-labelledby="generator-settings-title"
            className="rounded-[26px] border border-line bg-surface p-5 shadow-soft sm:p-6 lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Settings
                </p>
                <h2
                  id="generator-settings-title"
                  className="mt-2 text-lg font-semibold tracking-[-0.02em] text-ink"
                >
                  生成设置
                </h2>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                <SparkIcon className="size-4" />
              </span>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleGenerate}>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="keyword-category"
                    className="text-xs font-semibold tracking-[0.08em] text-muted"
                  >
                    关键词类目
                  </label>
                  <Link
                    to="/data"
                    className="text-[11px] font-medium text-muted transition-colors hover:text-ink"
                  >
                    替换 xlsx
                  </Link>
                </div>
                <div className="relative">
                  <select
                    id="keyword-category"
                    value={activeLibrary?.id ?? ''}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                    className={`${inputClassName} appearance-none pr-10`}
                  >
                    {libraries.map((library) => (
                      <option key={library.id} value={library.id}>
                        {library.label}（{library.keywords.length} 条）
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute bottom-3.5 right-3.5 size-4 text-muted" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-5 text-muted">
                  <span>{activeLibrary?.source}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeLibrary?.version}</span>
                  {activeLibrary?.isCustom && (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">
                      本地替换
                    </span>
                  )}
                </div>
                {activeStatus && activeStatus.tone !== 'ready' && (
                  <p className="mt-2 rounded-lg bg-surface-muted/60 px-3 py-2 text-[11px] leading-5 text-muted">
                    {activeStatus.tone === 'empty'
                      ? '该类目还没有关键词，暂时无法生成标题。'
                      : '该类目关键词偏少，可能无法生成 19–21 字标题。'}
                    <Link to="/data" className="ml-1 font-medium text-ink underline underline-offset-2">
                      去替换 xlsx
                    </Link>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fixed-word"
                  className="text-xs font-semibold tracking-[0.08em] text-muted"
                >
                  固定词
                </label>
                <input
                  id="fixed-word"
                  type="text"
                  required
                  maxLength={24}
                  autoComplete="off"
                  value={fixedWord}
                  onChange={(event) => setFixedWord(event.target.value)}
                  placeholder="例如：内增高"
                  className={inputClassName}
                />
                <p className="mt-2 text-[11px] leading-5 text-muted">
                  会原样出现在每条标题中，不参与关键词表校验。
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold tracking-[0.08em] text-muted">
                  鞋子类型
                </span>
                <div
                  role="group"
                  aria-label="鞋子类型"
                  className="mt-2 flex flex-wrap gap-1 rounded-xl bg-surface-muted/80 p-1"
                >
                  {(activeLibrary?.types ?? []).map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleTypeChange(type.id)}
                      aria-pressed={activeType?.id === type.id}
                      className={[
                        'min-w-0 flex-1 whitespace-nowrap rounded-lg px-2 py-2 text-[11px] font-medium transition-colors sm:text-xs',
                        activeType?.id === type.id
                          ? 'bg-surface text-ink shadow-sm ring-1 ring-line'
                          : 'text-muted hover:text-ink',
                      ].join(' ')}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="title-quantity"
                  className="text-xs font-semibold tracking-[0.08em] text-muted"
                >
                  生成数量
                </label>
                <input
                  id="title-quantity"
                  type="number"
                  min={1}
                  max={MAX_TITLE_QUANTITY}
                  step={1}
                  required
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className={inputClassName}
                />
                <p className="mt-2 text-[11px] leading-5 text-muted">
                  1–{MAX_TITLE_QUANTITY} 条，按指定数量完整输出。
                </p>
              </div>

              <fieldset>
                <legend className="text-xs font-semibold tracking-[0.08em] text-muted">
                  额外限制
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {exclusionOptions.map((option) => (
                    <label
                      key={option.key}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-canvas/50 px-3 py-2.5 text-xs text-ink transition-colors hover:border-ink/20"
                    >
                      <input
                        type="checkbox"
                        checked={exclusions[option.key]}
                        onChange={() => toggleExclusion(option.key)}
                        className="size-3.5 accent-accent"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="custom-exclusions"
                  className="text-xs font-semibold tracking-[0.08em] text-muted"
                >
                  其他排除词
                </label>
                <input
                  id="custom-exclusions"
                  type="text"
                  autoComplete="off"
                  value={customExclusions}
                  onChange={(event) => setCustomExclusions(event.target.value)}
                  placeholder="例如：蝴蝶结 亮片"
                  className={inputClassName}
                />
                <p className="mt-2 text-[11px] leading-5 text-muted">
                  多个词用空格或逗号分隔；固定词包含排除词时会停止生成。
                </p>
              </div>

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-medium text-canvas transition-opacity hover:opacity-90"
              >
                <SparkIcon className="size-4" />
                生成标题
              </button>
            </form>

            <div className="mt-5 border-t border-line pt-4 text-[11px] leading-5 text-muted">
              词库数据保存在当前浏览器；替换入口在「
              <Link to="/data" className="font-medium text-ink underline underline-offset-2">
                词库管理
              </Link>
              」。
            </div>
          </section>

          <div ref={resultsRef} className="scroll-mt-24">
            <section
              aria-labelledby="generator-results-title"
              aria-live="polite"
              className="min-h-[420px] overflow-hidden rounded-[26px] border border-line bg-surface shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Results
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h2
                      id="generator-results-title"
                      className="text-lg font-semibold tracking-[-0.02em] text-ink"
                    >
                      生成结果
                    </h2>
                    <span className="text-xs text-muted">
                      {activeLibrary?.label ?? ''}
                      {activeType ? ` · ${activeType.label}` : ''} · {result.titles.length} 条 ·{' '}
                      {TITLE_LENGTH_MIN}–{TITLE_LENGTH_MAX} 汉字
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyTitles}
                  disabled={result.titles.length === 0}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-xs font-medium text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {copyState === 'copied' ? (
                    <CheckIcon className="size-3.5 text-accent" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                  {copyState === 'copied' ? '已复制' : '复制全部'}
                </button>
              </div>

              {copyMessage && (
                <p
                  role="status"
                  className="border-b border-line px-5 py-2.5 text-xs text-muted sm:px-6"
                >
                  {copyMessage}
                </p>
              )}

              {result.error ? (
                <div
                  role="alert"
                  className="m-5 rounded-2xl border border-line bg-surface-muted/60 px-4 py-4 text-sm leading-6 text-muted sm:m-6"
                >
                  <p>{result.error}</p>
                  <Link
                    to="/data"
                    className="mt-2 inline-flex text-xs font-medium text-ink underline underline-offset-2"
                  >
                    去词库管理替换 xlsx
                  </Link>
                </div>
              ) : (
                <ol className="divide-y divide-line">
                  {result.titles.map((title) => (
                    <li
                      key={title.text}
                      className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6"
                    >
                      <p className="select-text text-[15px] font-medium leading-7 text-ink sm:text-base">
                        {title.text}
                      </p>
                      <span className="mt-0.5 shrink-0 rounded-full bg-surface-muted px-2 py-0.5 font-mono text-[11px] text-muted">
                        {title.charCount} 汉字
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              <div className="border-t border-line px-5 py-4 sm:px-6">
                <p className="text-xs leading-6 text-muted">
                  复制内容为纯标题，每行一条，无编号、无引号、无空格。标题中的固定词与全部组合片段已通过来源校验。
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted/80">
                  <span>固定词必现</span>
                  <span>仅使用当前类目关键词</span>
                  <span>同批次去重</span>
                  <span>浏览器本地生成</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section
          aria-labelledby="keyword-library-title"
          className="mt-8 overflow-hidden rounded-[26px] border border-line bg-surface"
        >
          <div className="flex flex-col gap-4 border-b border-line p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                Keyword library
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2
                  id="keyword-library-title"
                  className="text-xl font-semibold tracking-[-0.025em] text-ink"
                >
                  {activeLibrary?.label ?? '关键词'}关键词库
                </h2>
                {activeLibrary?.isCustom && (
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-medium text-accent">
                    本地替换
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">
                当前生成器使用的全部关键词，保留表内原始搜索指数。
                {activeLibrary && (
                  <>
                    {' '}
                    <span className="text-muted/80">
                      {activeLibrary.source} · {activeLibrary.version}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
              <div className="relative w-full lg:w-64">
                <label htmlFor="keyword-search" className="sr-only">
                  搜索关键词
                </label>
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  id="keyword-search"
                  type="search"
                  value={keywordQuery}
                  onChange={(event) => setKeywordQuery(event.target.value)}
                  placeholder="搜索关键词"
                  className="h-10 w-full rounded-full border border-line bg-canvas/50 pl-10 pr-4 text-sm text-ink placeholder:text-muted/50 focus:border-accent/60"
                />
              </div>
              <Link
                to="/data"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface px-4 text-xs font-medium text-ink transition-colors hover:bg-surface-muted"
              >
                替换 xlsx
              </Link>
            </div>
          </div>

          <div className="max-h-[390px] overflow-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-surface">
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-muted">
                  <th scope="col" className="px-5 py-3.5 font-medium sm:px-6">
                    关键词
                  </th>
                  <th
                    scope="col"
                    className="w-32 px-5 py-3.5 text-right font-medium sm:px-6"
                  >
                    搜索指数
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/80">
                {filteredKeywords.map((item) => (
                  <tr key={item.keyword} className="transition-colors hover:bg-surface-muted/40">
                    <td className="px-5 py-3 text-ink sm:px-6">{item.keyword}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-muted sm:px-6">
                      {item.searchIndex}
                    </td>
                  </tr>
                ))}
                {filteredKeywords.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-5 py-12 text-center text-sm text-muted sm:px-6"
                    >
                      {keywordQuery.trim()
                        ? '没有匹配的关键词'
                        : '当前类目暂无关键词，请先替换 xlsx'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-line px-5 py-3.5 text-[11px] leading-5 text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              共 {activeLibrary?.keywords.length ?? 0} 条 · 搜索指数 1：{indexOne} 条 · 0：
              {indexZero} 条{indexOther > 0 ? ` · 其他：${indexOther} 条` : ''}
            </p>
            <p>
              {indexZero === 0
                ? '表内没有 0 指数样本，因此不执行 1:1 配比。'
                : '当前版本未提供按搜索指数比例选词。'}
            </p>
          </div>
        </section>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: '真实词库',
              text: '除固定词外，生成标题只使用当前类目表格中出现过的关键词或关键词片段。',
            },
            {
              title: '长度受控',
              text: `每条标题按汉字计数，固定在 ${TITLE_LENGTH_MIN}–${TITLE_LENGTH_MAX} 个汉字，固定词也计入。`,
            },
            {
              title: '数据可替换',
              text: '词库管理支持上传新的 xlsx，替换只保存在当前浏览器；当前生成会立即使用新数据。',
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className="rounded-2xl border border-line bg-surface/60 px-5 py-4"
            >
              <span className="font-mono text-[10px] text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-6 text-muted">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            返回首页
          </Link>
          <Link
            to="/data"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            管理关键词库
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  )
}
