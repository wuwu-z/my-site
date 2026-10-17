import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../components/Icons'

export function NotFoundPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-20">
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 opacity-70"
      />
      <div className="relative text-center">
        <p className="text-[clamp(5rem,16vw,8.5rem)] font-semibold leading-none tracking-[-0.07em] text-ink">
          404<span className="text-accent">.</span>
        </p>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-ink sm:text-3xl">
          这个页面还不存在
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted">
          你访问的地址可能已经失效，或者输入有误。回到首页继续看看吧。
        </p>
        <Link
          to="/"
          className="group mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink shadow-sm transition-colors hover:border-ink/20 hover:bg-surface-muted"
        >
          返回首页
          <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </main>
  )
}
