import { Link, NavLink } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

const navItems: Array<{
  to: string
  label: string
  end: boolean
  hideOnMobile?: boolean
}> = [
  { to: '/', label: '首页', end: true },
  { to: '/titles', label: '工具', end: false },
  { to: '/about', label: '关于', end: false, hideOnMobile: true },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-5 sm:h-20 sm:px-8">
        <Link
          to="/"
          aria-label="我的网站，返回首页"
          className="inline-flex min-w-0 items-center gap-2.5"
        >
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-ink text-[16px] font-semibold leading-none text-canvas"
          >
            M
          </span>
          <span className="truncate text-[15px] font-semibold tracking-[-0.01em] sm:text-base">
            我的网站
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <nav
            aria-label="主导航"
            className="flex items-center gap-0.5 rounded-full bg-surface-muted/80 p-1"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors sm:px-3.5 sm:text-sm',
                    item.hideOnMobile ? 'hidden sm:inline-flex' : '',
                    isActive
                      ? 'bg-surface text-ink shadow-sm ring-1 ring-line'
                      : 'text-muted hover:text-ink',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
