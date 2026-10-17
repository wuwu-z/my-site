import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {year} 我的网站</p>
        <nav aria-label="页脚导航" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/" className="transition-colors hover:text-ink">
            首页
          </Link>
          <Link to="/titles" className="transition-colors hover:text-ink">
            标题工具
          </Link>
          <Link to="/data" className="transition-colors hover:text-ink">
            词库管理
          </Link>
          <Link to="/about" className="transition-colors hover:text-ink">
            关于
          </Link>
        </nav>
        <p className="text-muted/80">保持简单，慢慢构建。</p>
      </div>
    </footer>
  )
}
