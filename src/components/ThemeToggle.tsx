import { MoonIcon, SunIcon } from './Icons'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? '切换到浅色模式' : '切换到深色模式'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface/70 text-muted transition-colors hover:bg-surface hover:text-ink"
    >
      {isDark ? (
        <SunIcon className="size-[17px]" />
      ) : (
        <MoonIcon className="size-[17px]" />
      )}
    </button>
  )
}
