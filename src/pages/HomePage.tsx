import { Link } from 'react-router-dom'
import { ArrowRightIcon, SparkIcon } from '../components/Icons'

export function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="hero-glow absolute left-1/2 top-[44%] h-[620px] w-[900px] -translate-x-1/2 -translate-y-1/2" />
        <div className="hero-grid absolute inset-0 opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-canvas to-transparent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-8 sm:py-20 lg:py-24">
        <div className="relative mb-9" aria-hidden="true">
          <div className="grid size-[76px] place-items-center rounded-[24px] border border-line bg-surface shadow-soft">
            <SparkIcon className="size-8 text-accent" />
          </div>
          <span className="absolute -right-1.5 -top-1.5 size-4 rounded-full border-[3px] border-canvas bg-accent" />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          A small place on the web
        </p>

        <h1 className="mt-5 text-balance text-[clamp(2.6rem,7vw,4.6rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">
          网站正在建设中<span className="text-accent">。</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-[15px] leading-7 text-muted sm:text-base sm:leading-8">
          这里将用于展示我的作品与想法。目前还在准备中，先留一点空白，很快与你见面。
        </p>

        <Link
          to="/about"
          className="group mt-9 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-ink/90"
        >
          先了解本站
          <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </main>
  )
}
