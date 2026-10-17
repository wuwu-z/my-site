import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { KeywordDataPage } from './pages/KeywordDataPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TitleGeneratorPage } from './pages/TitleGeneratorPage'

const pageTitles: Record<string, string> = {
  '/': '我的网站',
  '/titles': '鞋类标题生成器 · 我的网站',
  '/data': '关键词库管理 · 我的网站',
  '/about': '关于本站 · 我的网站',
}

function RouteEffects() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = pageTitles[pathname] ?? '页面不存在 · 我的网站'
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="titles" element={<TitleGeneratorPage />} />
          <Route path="data" element={<KeywordDataPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
