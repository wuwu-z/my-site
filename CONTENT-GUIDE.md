# 改内容改哪里

本文档对应当前版本。改完代码后在终端重新构建或刷新本地页面；上线时把改动推送即可。

## 1. 站点标题

### 浏览器标签页标题

文件：`index.html`

```html
<title>我的网站</title>
<meta name="description" content="我的网站，提供时装靴 SEO 标题生成与关键词查询。" />
```

`<title>` 是标签页和搜索结果里的标题；`description` 是页面简介。可以把「我的网站」替换成你的站点名。

各路由的标签页标题在 `src/App.tsx` 的 `pageTitles` 中：

```ts
const pageTitles: Record<string, string> = {
  '/': '我的网站',
  '/titles': '时装靴标题生成器 · 我的网站',
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
<nav aria-label="页脚导航" className="flex flex-wrap items-center gap-x-5 gap-y-2">
  <Link to="/">首页</Link>
  <Link to="/titles">标题工具</Link>
  <Link to="/about">关于</Link>
</nav>
```

`{year}` 会按当前年份自动显示，不需要手动改年份。

## 2. 首页文案

文件：`src/pages/HomePage.tsx`

- 小标题：`SEO title studio`
- 主标题：`时装靴标题工作台`
- 描述：`按固定词、鞋型和限制条件，从 10.8 更新的 119 个真实关键词中组合淘宝标题。`
- 主按钮：`打开标题生成器`，跳转 `/titles`
- 次按钮：`了解本站`，跳转 `/about`

主页底部的关键词数量来自 `FASHION_BOOT_META`，更新数据后无需手改首页数字。

## 3. 关于页文案

文件：`src/pages/AboutPage.tsx`

- 大标题：`关于本站`
- 简介段落
- 卡片标题：`标题工具已上线`
- 卡片正文和 `Next` 说明
- 右下角站点信息列表：

```tsx
const siteDetails = [
  { label: '技术栈', value: 'React + Vite' },
  { label: '路由', value: 'HashRouter' },
  { label: '数据', value: '时装靴关键词库' },
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
  { to: '/titles', label: '工具', end: false },
  { to: '/about', label: '关于', end: false, hideOnMobile: true },
]
```

手机上隐藏「关于」入口以节省横向空间，页脚仍然保留完整导航。

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

## 11. 标题生成器与关键词库

### 页面位置

- 页面：`/#/titles`
- 页面组件：`src/pages/TitleGeneratorPage.tsx`
- 关键词数据：`src/data/fashionBootKeywords.ts`
- 组合规则：`src/lib/titleGenerator.ts`

### 修改默认的固定词、鞋型、数量

打开 `src/pages/TitleGeneratorPage.tsx`，找到顶部的默认结果和组件内初始 state：

```tsx
const initialResult = generateTitles({
  fixedWord: '内增高',
  bootType: '短靴',
  quantity: DEFAULT_TITLE_QUANTITY,
  exclusions: DEFAULT_EXCLUSIONS,
  seed: 20261008,
})
```

以及：

```tsx
const [fixedWord, setFixedWord] = useState('内增高')
const [bootType, setBootType] = useState<BootType>('短靴')
const [quantity, setQuantity] = useState(String(DEFAULT_TITLE_QUANTITY))
```

两处同步修改，避免首屏示例与实际表单不一致。

### 更新关键词

关键词文件结构：

```ts
export const FASHION_BOOT_META = {
  category: '时装靴',
  source: '时装靴.xlsx',
  version: '10.8 更新',
  keywordCount: 119,
  searchIndexOneCount: 119,
  searchIndexZeroCount: 0,
} as const

export const FASHION_BOOT_KEYWORDS: readonly FashionBootKeyword[] = [
  { keyword: '棕色靴子', searchIndex: 1 },
  // ……
]
```

从最新 Excel 的 **Sheet1** 读取两列：

- A 列：关键词
- B 列：搜索指数

替换数据数组，并同步更新 `keywordCount`、`searchIndexOneCount`、`searchIndexZeroCount` 和 `version`。不要手工改写表格里不存在的关键词。

当前 Excel 全部 119 条的搜索指数都是 1，表里没有任何 0 指数记录，所以页面没有实现 1:1 搜索指数配比。如果以后的数据同时包含 0 和 1，并且需要按比例选词，需要在 `src/lib/titleGenerator.ts` 的选词逻辑中扩展，不能只在界面上加一个开关。

### 调整标题组合风格

`src/lib/titleGenerator.ts` 中：

- `TYPE_CORES`：不同鞋型使用的基础词。
- `BASE_TOKEN_GROUPS`：风格、材质、设计、颜色、人群、季节等可选片段。
- `DETAIL_GROUP`：长靴和过膝靴专用的修饰词。
- 各组的 `chance` 控制该组被选中的概率，影响生成结果的长度和风格。

新增任何组合片段之前，先确认它是现有某个关键词的子串。页面构建前请重新执行：

```bash
npm run dev
npm run build
```

