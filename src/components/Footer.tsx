export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {year} 我的网站</p>
        <p className="text-muted/80">保持简单，慢慢构建。</p>
      </div>
    </footer>
  )
}
