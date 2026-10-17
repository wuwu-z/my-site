# 改内容改哪里

本文档对应当前版本。改完代码后在终端重新构建或刷新本地页面；上线时把改动推送即可。

## 1. 站点标题

### 浏览器标签页标题

文件：`index.html`

```html
<title>我的网站</title>
<meta name="description" content="我的网站，提供 7 类鞋类 SEO 标题生成、关键词查询与 xlsx 词库替换。" />
```

`<title>` 是标签页和搜索结果里的标题；`description` 是页面简介。可以把「我的网站」替换成你的站点名。

各路由的标签页标题在 `src/App.tsx` 的 `pageTitles` 中：

```ts
const pageTitles: Record<string, string> = {
  '/': '我的网站',
  '/titles': '鞋类标题生成器 · 我的网站',
  '/data': '关键词库管理 · 我的网站',
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
  <Link to="/data">词库管理</Link>
  <Link to="/about">关于</Link>
</nav>
```

`{year}` 会按当前年份自动显示，不需要手动改年份。

## 2. 首页文案

文件：`src/pages/HomePage.tsx`

- 小标题：`SEO title studio`
- 主标题：`鞋类标题工作台`
- 描述：按固定词、鞋型和限制条件，从 7 个鞋类词库、358 个真实关键词中组合淘宝标题。
- 主按钮：`打开标题生成器`，跳转 `/titles`
- 次按钮：`了解本站`，跳转 `/about`

主页的关键词数量来自 `getLibraries()` 和 `getTotalKeywordCount()`，本地替换词库后也会自动反映。

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
  { label: '数据', value: '7 类鞋类关键词库' },
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

## 11. 标题生成器和关键词库

### 页面位置

- 标题生成器：`/#/titles`
- 词库管理：`/#/data`
- 生成器页面：`src/pages/TitleGeneratorPage.tsx`
- 词库管理页面：`src/pages/KeywordDataPage.tsx`
- 内置关键词数据：`src/data/keywordLibraries.ts`
- xlsx 解析与本地保存：`src/lib/keywordLibraryStore.ts`
- 组合规则：`src/lib/titleGenerator.ts`

### 修改默认的固定词和数量

打开 `src/pages/TitleGeneratorPage.tsx`，修改：

```tsx
const DEFAULT_FIXED_WORD = '内增高'
const [quantity, setQuantity] = useState(String(DEFAULT_TITLE_QUANTITY))
```

同时修改 `useState` 里的固定词初始值：

```tsx
const [fixedWord, setFixedWord] = useState(DEFAULT_FIXED_WORD)
```

### 在浏览器内替换 xlsx

访问 `/#/data`，在对应类目卡片里上传 `.xlsx`。数据会写入浏览器 `localStorage`，刷新页面后仍然有效，并能立即被标题生成器使用。

- 只读取第一个工作表。
- 表头必须同时包含「关键词」和「搜索指数」；表头可以不在第一行。
- 重复关键词会去重，缺少搜索指数的行会跳过。
- 单文件上限 10 MB。
- 每个类目可以点「恢复默认」，回到内置数据。
- 这是本地替换，不会影响公网其他访客。

### 更新全站内置关键词库

文件：`src/data/keywordLibraries.ts`

每个类目的结构：

```ts
{
  id: 'snow-boots',
  label: '雪地靴',
  source: '雪地靴.xlsx',
  version: '10.8 更新',
  types: [
    { id: 'snow-boots', label: '雪地靴', cores: ['雪地靴', '雪地鞋'] },
  ],
  keywords: [
    { keyword: '长筒雪地靴', searchIndex: 1 },
    // ……
  ],
}
```

当前 7 个内置类目及数据量：

| 类目 | 关键词数 | 版本 | 现状 |
| --- | ---: | --- | --- |
| 时装靴 | 119 | 10.8 更新 | 可用 |
| 毛毛鞋 | 7 | 10.10 更新 | 不足 19–21 字组合 |
| 勃肯鞋 | 24 | 10.10 更新 | 可用 |
| 雪地靴 | 108 | 10.8 更新 | 可用 |
| 时尚休闲鞋 | 99 | 10.8 更新 | 可用 |
| 骑士靴 | 0 | 10.10 更新 | 源表为空 |
| 棉鞋 | 1 | 10.10 更新 | 源表只有 1 条 |

更新时：

1. 从最新 Excel 的第一个工作表读取 A 列「关键词」、B 列「搜索指数」。
2. 只替换对应类目的 `keywords`，同步修改 `source` 和 `version`。
3. 不要给缺失的类目编造数据。
4. 修改后运行 `npm run dev` 和 `npm run build`，再提交推送。

### 修改鞋型选项

每个类目的 `types` 控制页面上的「鞋子类型」按钮。`cores` 是用于匹配该鞋型的关键词片段，至少有一个必须能在该类目关键词中找到，否则生成器会提示数据不足。

例如：

```ts
{ id: 'short-boots', label: '短靴', cores: ['短靴'] },
{ id: 'dad-shoes', label: '老爹鞋', cores: ['老爹鞋'] },
```

### 调整标题组合风格

文件：`src/lib/titleGenerator.ts`

- `BASE_TOKEN_GROUPS`：风格、材质、设计、功能、颜色、场景、季节、人群等可组合片段。
- 各组的 `chance` 控制被选中的概率，影响标题长度和风格。
- 片段必须能在当前类目关键词中找到，否则会被过滤，不会出现在标题里。
- 生成器固定按「固定词 + 风格/材质 + 设计/新款 + 场景/颜色/功能/鞋型/人群/季节」拼接，并再次检查片段重叠、19–21 汉字、固定词和去重。

### 搜索指数

当前所有内置表格的搜索指数都是 1，没有 0 指数样本，因此页面没有实现 1:1 或按比例选词。页面会如实展示每个类目的「指数 1 / 指数 0」数量。如果以后的数据同时包含 0 和 1，并需要按搜索指数比例选词，需要在 `src/lib/titleGenerator.ts` 的选词逻辑中扩展，不能只在界面上加一个开关。

### 提交前检查

```bash
npm run dev
npm run build
```

至少检查：类目切换、鞋型切换、19–21 汉字、固定词、排除词、复制结果、xlsx 替换、恢复默认。

