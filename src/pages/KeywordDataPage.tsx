import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ResetIcon,
  UploadIcon,
} from '../components/Icons'
import {
  getLibraries,
  getLibraryStatus,
  getTotalKeywordCount,
  parseKeywordWorkbook,
  resetAllLibraryOverrides,
  resetLibraryOverride,
  saveLibraryOverride,
  type LibraryWithStatus,
} from '../lib/keywordLibraryStore'

type Notice = {
  tone: 'success' | 'error'
  message: string
}

function indexCounts(library: LibraryWithStatus) {
  const one = library.keywords.filter((item) => item.searchIndex === 1).length
  const zero = library.keywords.filter((item) => item.searchIndex === 0).length
  return { one, zero, other: library.keywords.length - one - zero }
}

export function KeywordDataPage() {
  const [libraries, setLibraries] = useState<LibraryWithStatus[]>(() => getLibraries())
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  const totalKeywords = getTotalKeywordCount(libraries)
  const customCount = libraries.filter((library) => library.isCustom).length

  async function handleFile(
    library: LibraryWithStatus,
    file: File,
    input: HTMLInputElement,
  ) {
    setBusyId(library.id)
    setNotice(null)

    try {
      const parsed = await parseKeywordWorkbook(file)
      saveLibraryOverride(library.id, parsed)
      setLibraries(getLibraries())

      const notes = [`已读取 ${parsed.keywords.length} 条关键词`]
      if (parsed.duplicateRows > 0) notes.push(`跳过 ${parsed.duplicateRows} 条重复关键词`)
      if (parsed.skippedRows > 0) notes.push(`跳过 ${parsed.skippedRows} 条无效行`)

      setNotice({
        tone: 'success',
        message: `「${library.label}」替换成功：${notes.join('，')}。新数据只保存在当前浏览器。`,
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : '导入失败，请检查表格后重试。',
      })
    } finally {
      setBusyId(null)
      input.value = ''
    }
  }

  function handleFileChange(
    library: LibraryWithStatus,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (file) {
      void handleFile(library, file, input)
    }
  }

  function handleReset(library: LibraryWithStatus) {
    const confirmed = window.confirm(
      `恢复「${library.label}」的内置关键词库？当前浏览器里的替换数据会被移除。`,
    )
    if (!confirmed) return

    try {
      resetLibraryOverride(library.id)
      setLibraries(getLibraries())
      setNotice({
        tone: 'success',
        message: `「${library.label}」已恢复为内置关键词库。`,
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : '恢复默认词库失败。',
      })
    }
  }

  function handleResetAll() {
    const confirmed = window.confirm('清除所有本地替换，恢复全部 7 个内置关键词库？')
    if (!confirmed) return

    try {
      resetAllLibraryOverrides()
      setLibraries(getLibraries())
      setNotice({ tone: 'success', message: '全部类目已恢复为内置关键词库。' })
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : '清除本地词库失败。',
      })
    }
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12 lg:pb-24">
        <nav aria-label="面包屑" className="flex items-center gap-2 text-xs text-muted">
          <Link to="/" className="transition-colors hover:text-ink">
            首页
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/titles" className="transition-colors hover:text-ink">
            标题生成器
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">词库管理</span>
        </nav>

        <div className="mt-6 flex flex-col gap-6 border-b border-line pb-8 sm:mt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              Keyword library
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">
              关键词库管理
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-[15px] leading-7 text-muted">
              为 7 个鞋类类目替换新的 .xlsx 关键词表。表格只读取第一个工作表，保留「关键词 / 搜索指数」两列。
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">
              {libraries.length} 个类目
            </span>
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">
              {totalKeywords} 条关键词
            </span>
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">
              本地替换 {customCount} 个
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface-muted/50 px-4 py-4 text-sm leading-6 text-muted sm:px-5">
          <p className="font-medium text-ink">替换只保存在当前浏览器</p>
          <p className="mt-1">
            上传的表格不会发送到服务器，只写入本机 localStorage，因此不会影响其他访客。如果要让公网所有访客看到新词库，需要把新数据加入项目后重新部署。
          </p>
        </div>

        {notice && (
          <div
            role={notice.tone === 'error' ? 'alert' : 'status'}
            className={[
              'mt-4 rounded-xl border px-4 py-3 text-sm leading-6',
              notice.tone === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300'
                : 'border-line bg-surface text-ink',
            ].join(' ')}
          >
            {notice.message}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">
            仅支持 .xlsx，单文件不超过 10 MB；重复关键词会自动去重。
          </p>
          {customCount > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              disabled={busyId !== null}
              className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink disabled:opacity-45"
            >
              <ResetIcon className="size-3.5" />
              恢复所有默认词库
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {libraries.map((library) => {
            const status = getLibraryStatus(library)
            const counts = indexCounts(library)
            const isBusy = busyId === library.id
            const isDisabled = busyId !== null

            return (
              <section
                key={library.id}
                className="flex flex-col rounded-[24px] border border-line bg-surface p-5 shadow-soft sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">
                        {library.label}
                      </h2>
                      {library.isCustom && (
                        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-medium text-accent">
                          本地替换
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted">
                      {library.version} · {library.source}
                    </p>
                  </div>
                  <span
                    className={[
                      'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                      status.tone === 'ready'
                        ? 'border-line bg-surface-muted/60 text-ink'
                        : 'border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-300',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'size-1.5 rounded-full',
                        status.tone === 'ready' ? 'bg-accent' : 'bg-amber-500',
                      ].join(' ')}
                    />
                    {status.label}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-line bg-canvas/40 px-3 py-3 text-center">
                  <div>
                    <p className="font-mono text-lg text-ink">{library.keywords.length}</p>
                    <p className="mt-0.5 text-[10px] text-muted">关键词</p>
                  </div>
                  <div className="border-x border-line">
                    <p className="font-mono text-lg text-ink">{counts.one}</p>
                    <p className="mt-0.5 text-[10px] text-muted">指数 1</p>
                  </div>
                  <div>
                    <p className="font-mono text-lg text-ink">{counts.zero}</p>
                    <p className="mt-0.5 text-[10px] text-muted">指数 0</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {library.types.map((type) => (
                    <span
                      key={type.id}
                      className="rounded-full border border-line bg-surface-muted/40 px-2.5 py-1 text-[11px] text-muted"
                    >
                      {type.label}
                    </span>
                  ))}
                </div>

                {status.tone !== 'ready' && (
                  <p className="mt-3 text-xs leading-5 text-muted">
                    {status.tone === 'empty'
                      ? '当前表格没有关键词，暂时无法生成标题。请上传一个包含关键词的工作表。'
                      : '关键词数量偏少，可能无法组合出 19–21 字标题。建议上传更完整的表格。'}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                  <input
                    id={`library-upload-${library.id}`}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="sr-only"
                    disabled={isDisabled}
                    onChange={(event) => handleFileChange(library, event)}
                  />
                  <label
                    htmlFor={`library-upload-${library.id}`}
                    aria-disabled={isDisabled}
                    className={[
                      'inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-xs font-medium text-ink transition-colors',
                      isDisabled
                        ? 'pointer-events-none opacity-45'
                        : 'cursor-pointer hover:bg-surface-muted',
                    ].join(' ')}
                  >
                    <UploadIcon className="size-3.5" />
                    {isBusy ? '正在读取…' : '替换 xlsx'}
                  </label>

                  {library.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleReset(library)}
                      disabled={busyId !== null}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs text-muted transition-colors hover:text-ink disabled:opacity-45"
                    >
                      <ResetIcon className="size-3.5" />
                      恢复默认
                    </button>
                  )}

                  <Link
                    to={`/titles?category=${library.id}`}
                    className="ml-auto text-xs font-medium text-muted transition-colors hover:text-ink"
                  >
                    去生成 →
                  </Link>
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs leading-5 text-muted">
            表格格式：第一个工作表的 A 列「关键词」、B 列「搜索指数」。如果表头不在第一行，系统会读取前 20 行内匹配的表头。
          </p>
          <Link
            to="/titles"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            返回标题生成器
          </Link>
        </div>
      </div>
    </main>
  )
}
