# 改内容改哪里

本文档对应当前版本。改完代码后在终端重新构建或刷新本地页面；上线时把改动推送即可。

## 1. 站点标题

### 浏览器标签页标题

文件：`index.html`

```html
<title>我的网站</title>
<meta name="description" content="我的网站，一个正在建设中的个人站点。" />
```

`<title>` 是标签页和搜索结果里的标题；`description` 是页面简介。可以把「我的网站」替换成你的站点名。

各路由的标签页标题在 `src/App.tsx` 的 `pageTitles` 中：

```ts
const pageTitles: Record<string, string> = {
  '/': '我的网站',
  '/about': '关于本站 · 我的网站',
}
```

### 页头的站点名

文件：`src/components/Header.tsx`

找到：

```tsx
<span className="truncate text-[15px] font-semibold tracking-[-0.01em] sm:text-base">
  我的网站
</span>
```

把 `我的网站` 改成你的站点名。

### 页脚版权文字

文件：`src/components/Footer.tsx`

```tsx
<p>© {year} 我的网站</p>
<p className="text-muted/80">保持简单，慢慢构建。</p>
```

`{year}` 会按当前年份自动显示，不需要手动改年份。

## 2. 首页文案

文件：`src/pages/HomePage.tsx`

- 小标题：`A small place on the web`
- 主标题：`网站正在建设中`
- 描述：`这里将用于展示我的作品与想法。目前还在准备中，先留一点空白，很快与你见面。`
- 按钮文字：`先了解本站`

按钮目前跳转到 `/about`，改跳转目标时同步修改 `<Link to="/about">`。

## 3. 关于页文案

文件：`src/pages/AboutPage.tsx`

- 大标题：`关于本站`
- 简介段落
- 卡片标题：`正在准备内容`
- 卡片正文和 `Next` 说明
- 右下角站点信息列表：

```tsx
const siteDetails = [
  { label: '技术栈', value: 'React + Vite' },
  { label: '路由', value: 'HashRouter' },
  { label: '托管', value: 'GitHub Pages' },
]
```

按需要改成真实的站点介绍即可，整个文件没有数据请求。

## 4. 404 页面

文件：`src/pages/NotFoundPage.tsx`

```tsx
<h1>这个页面还不存在</h1>
<p>你访问的地址可能已经失效，或者输入有误。回到首页继续看看吧。</p>
```

任何没有匹配到的 Hash 路由都会显示此页面。

## 5. 顶部导航

文件：`src/components/Header.tsx`

```tsx
const navItems = [
  { to: '/', label: '首页', end: true },
  { to: '/about', label: '关于', end: false },
]
```

添加导航项时，`to` 必须和 `App.tsx` 里的路由路径一致。首页的 `end: true` 表示只有精确匹配 `/` 时才高亮。

## 6. 颜色和主题

文件：`src/index.css`

浅色主题在 `:root`，深色主题在 `.dark`。颜色使用 RGB 三通道值，例如：

```css
:root {
  --canvas: 249 248 245;
  --ink: 24 31 43;
  --accent: 43 84 201;
}
```

修改主色时，建议同时修改浅色和深色里的 `--accent`、`--accent-soft`。Tailwind 类名（如 `bg-canvas`、`text-ink`、`bg-accent`）会自动使用这些变量。

主题按钮在 `src/components/ThemeToggle.tsx`，切换逻辑在 `src/hooks/useTheme.ts`。偏好保存在浏览器 `localStorage` 的 `my-site-theme` 键中。

## 7. 图标和 favicon

- 页头字母图标：`src/components/Header.tsx` 中的 `M` 字符。
- 浏览器标签页图标：`public/favicon.svg`。
- 首页装饰图标：`src/components/Icons.tsx` 的 `SparkIcon`。

替换 `public/favicon.svg` 即可更新 favicon。保留文件名时不用改 `index.html`。

## 8. 添加一个新页面

假设要添加「作品」页面，地址为 `/#/works`：

### 第一步：新建页面

新建 `src/pages/WorksPage.tsx`：

```tsx
export function WorksPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          Works
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-ink">
          作品
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted">
          这里以后会放我的作品。
        </p>
      </div>
    </main>
  )
}
```

### 第二步：注册路由

修改 `src/App.tsx`：

```tsx
import { WorksPage } from './pages/WorksPage'

// 在 Routes 内添加：
<Route path="works" element={<WorksPage />} />
```

同时把浏览器标题加入 `pageTitles`：

```ts
'/works': '作品 · 我的网站',
```

### 第三步：添加导航（可选）

修改 `src/components/Header.tsx` 的 `navItems`：

```tsx
{ to: '/works', label: '作品', end: false },
```

### 第四步：从其他页面链接过去

使用 React Router 的 `<Link>`，不要写原生 `<a href="/works">`：

```tsx
import { Link } from 'react-router-dom'

<Link to="/works">查看作品</Link>
```

最终线上地址是 `https://用户名.github.io/仓库名/#/works`。

## 9. 修改页面标题的默认值

`src/App.tsx` 里：

```ts
document.title = pageTitles[pathname] ?? '页面不存在 · 我的网站'
```

如果新增了路由但忘记加 `pageTitles`，会显示后面的兜底标题；建议新页面同时补上。

## 10. 修改完成后如何更新线上

```bash
npm run build
```

确认构建成功，再提交推送：

```bash
git add .
git commit -m "update: 修改首页文案"
git push
```

推送后 GitHub Actions 会自动部署。不要手动修改 `dist/`，它每次构建都会被覆盖。
