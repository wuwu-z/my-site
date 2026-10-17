import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon } from '../components/Icons'

const siteDetails = [
  { label: '技术栈', value: 'React + Vite' },
  { label: '路由', value: 'HashRouter' },
  { label: '数据', value: '时装靴关键词库' },
  { label: '托管', value: 'GitHub Pages' },
]

export function AboutPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            About
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
            关于本站
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-[15px] leading-7 text-muted sm:text-base sm:leading-8">
            这是一个从零开始搭建的纯静态站点。现在，这里已经上线第一个实用工具：时装靴标题生成器。
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <section className="rounded-[26px] border border-line bg-surface p-6 shadow-soft sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">
                标题工具已上线
              </h2>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                <span className="size-1.5 rounded-full bg-accent" />
                可用
              </span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
              生成器直接使用 10.8 更新的 119 个时装靴关键词。输入固定词、鞋型和限制条件后，会在浏览器本地组合出
              19–21 个汉字的标题，不经过后端，也不会上传你的输入。
            </p>
            <div className="mt-8 border-t border-line pt-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Next
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">
                继续补充关键词分析能力，并支持更多鞋类关键词库。
              </p>
            </div>
          </section>

          <aside className="rounded-[26px] border border-line bg-surface-muted/60 p-6 sm:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              站点信息
            </h2>
            <dl className="mt-5 divide-y divide-line">
              {siteDetails.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-6 py-3.5 first:pt-0 last:pb-0"
                >
                  <dt className="text-sm text-muted">{item.label}</dt>
                  <dd className="text-right text-sm font-medium text-ink">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/titles"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            打开标题生成器
            <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            返回首页
          </Link>
        </div>
      </div>
    </main>
  )
}
