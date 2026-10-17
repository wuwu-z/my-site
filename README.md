# 我的网站

一个可以直接部署到 GitHub Pages 的纯静态 SEO 标题工具站，使用 Vite + React + TypeScript + Tailwind CSS 构建。

**线上地址：** <https://wuwu-z.github.io/my-site/>

**标题生成器：** <https://wuwu-z.github.io/my-site/#/titles>

**词库管理：** <https://wuwu-z.github.io/my-site/#/data>

当前包含：

- 首页：鞋类标题工作台入口、工具数据概览、自动年份页脚
- 标题生成器：`/#/titles`，支持 7 个鞋类类目，按固定词、鞋型、数量、排除条件生成 19–21 个汉字的标题，支持一键复制
- 关键词库：内置时装靴、毛毛鞋、勃肯鞋、雪地靴、时尚休闲鞋、骑士靴、棉鞋 7 个类目，可搜索，并保留原始搜索指数
- 词库管理：`/#/data`，可在浏览器内上传新的 `.xlsx` 替换某个类目的关键词库
- 关于页：`/#/about`
- 404 兜底页：未知地址会显示站内 404，不白屏
- 深色 / 浅色主题切换，并记住上次选择
- 响应式布局：电脑和手机均可正常使用
- GitHub Actions 自动部署配置

没有后端、数据库、密钥或付费服务。标题组合和 Excel 解析都在浏览器本地完成，不会上传用户文件。

## 技术栈

- Vite 7
- React 19 + TypeScript
- Tailwind CSS 3
- React Router（HashRouter）
- read-excel-file（浏览器端解析 `.xlsx`）
- GitHub Pages + GitHub Actions

## 本地运行

### 1. 安装 Node.js

需要 Node.js 22 LTS 或更高版本。安装后重新打开终端，确认：

```bash
node -v
npm -v
```

### 2. 安装依赖

在本项目目录打开终端，执行：

```bash
npm install
```

### 3. 启动本地开发服务器

```bash
npm run dev
```

终端会给出本地地址，通常是：

```text
http://localhost:5173/
```

可以顺便验证：

- 首页：`http://localhost:5173/`
- 标题生成器：`http://localhost:5173/#/titles`
- 词库管理：`http://localhost:5173/#/data`
- 关于页：`http://localhost:5173/#/about`
- 404 页：`http://localhost:5173/#/does-not-exist`

### 4. 验证生产构建

```bash
npm run build
npm run preview
```

`npm run build` 会生成 `dist/` 目录。`npm run preview` 默认在 `http://localhost:4173/` 预览构建结果。

> 不要直接双击 `dist/index.html` 用 `file://` 方式打开。浏览器会限制模块脚本，页面可能显示空白。请使用 `npm run preview` 或任意静态文件服务器。

## 标题生成器说明

内置 7 个鞋类关键词库：

| 类目 | 版本 | 关键词数 | 状态 |
| --- | --- | ---: | --- |
| 时装靴 | 10.8 更新 | 119 | 可生成 |
| 毛毛鞋 | 10.10 更新 | 7 | 数据偏少 |
| 勃肯鞋 | 10.10 更新 | 24 | 可生成 |
| 雪地靴 | 10.8 更新 | 108 | 可生成 |
| 时尚休闲鞋 | 10.8 更新 | 99 | 可生成 |
| 骑士靴 | 10.10 更新 | 0 | 暂无关键词 |
| 棉鞋 | 10.10 更新 | 1 | 数据偏少 |

> 骑士靴源表格为空，棉鞋源表格只有 1 条「老年人冬鞋」，毛毛鞋只有 7 条。页面不会为这些类目编造关键词，生成时会提示数据不足。可以在词库管理中替换为更完整的 `.xlsx`。

生成规则：

- 固定词由用户填写，并保证出现在每条标题开头。
- 选择关键词类目和鞋型；除固定词外，所有组合片段都必须是该当前类目某个关键词的子串。
- 每条标题按汉字计数，控制在 19–21 个汉字，固定词也计入。
- 同一批次标题不重复；继续点击生成会避开此前已生成过的标题。
- 支持排除颜色词、加绒、冬季词、高跟，也支持自定义排除词。
- 当前内置表格的搜索指数全部为 1，没有 0 指数样本，所以没有执行 1:1 搜索指数配比。页面会真实显示每个类目的指数分布。
- 这是纯前端的规则式组合器，不调用大模型接口。它优先保证关键词来源、类目、固定词和字数约束；最终标题仍应按商品真实属性复核。

### 在网站里替换 xlsx

打开 `/#/data`，在每个类目卡片里上传新的 `.xlsx`：

- 只读取第一个工作表。
- 表头需包含「关键词」和「搜索指数」，可以不在第一行。
- 重复关键词会自动去重，缺失搜索指数的行会跳过。
- 单文件上限 10 MB。
- 替换数据保存在当前浏览器的 `localStorage`，不会上传到服务器，也不会改变其他访客看到的版本。
- 可在对应卡片点「恢复默认」；回标题生成器刷新后立即使用新词库。

### 让公网所有访客看到新词库

因为站点是纯静态站（无后端/数据库），网页上传只能更新当前浏览器。要让所有访客都看到新数据，需要更新代码里的内置词库并重新部署：

1. 把最新 `.xlsx` 发到对话，或按相同结构更新 `src/data/keywordLibraries.ts` 中对应类目的 `keywords` 数组。
2. 核对表头、类目和关键词，保持「关键词 / 搜索指数」语义不变。
3. 运行 `npm run dev` 验证生成和搜索，运行 `npm run build` 验证构建。
4. 提交并推送到 `main`，等待 GitHub Actions 完成。

如果新数据同时包含 0 和 1 指数关键词，并且需要按比例选词，还需要在 `src/lib/titleGenerator.ts` 中扩展选词逻辑；当前版本不伪造指数比例。

## 目录结构

```text
.
├─ .github/workflows/deploy.yml   GitHub Pages 自动部署
├─ public/
│  ├─ .nojekyll                   GitHub Pages 静态文件标记
│  └─ favicon.svg                 字母图标
├─ src/
│  ├─ components/                 页头、页脚、主题切换、图标
│  ├─ data/keywordLibraries.ts    7 个类目的内置关键词与鞋型配置
│  ├─ hooks/useTheme.ts           主题状态与 localStorage
│  ├─ lib/keywordLibraryStore.ts  xlsx 解析、本地替换、恢复默认
│  ├─ lib/titleGenerator.ts       标题组合规则与去重
│  ├─ pages/                      首页、标题生成器、词库管理、关于页、404
│  ├─ App.tsx                     路由与页面标题
│  ├─ index.css                   主题颜色和全局样式
│  └─ main.tsx                    React 入口
├─ deploy.bat                     Windows 一键提交并推送
├─ index.html                     页面标题、描述、favicon
├─ tailwind.config.js
├─ vite.config.ts                 base: './'
├─ CONTENT-GUIDE.md               改内容改哪里
└─ FAQ.md                         常见问题
```

## 发布到 GitHub Pages

> 本项目已经通过 GitHub Actions 完成部署。以下步骤保留为迁移或其他仓库的参考。

下面以仓库名 `my-site` 为例。最终网址形如：

```text
https://你的GitHub用户名.github.io/my-site/
```

### 第 1 步：注册或登录 GitHub

1. 打开 <https://github.com/signup>，按提示注册账号并完成邮箱验证。
2. 如果已有账号，打开 <https://github.com/login> 登录。

📷 **截图位置：**记录 GitHub 右上角的头像菜单，之后创建仓库和查看网址都在这里。

### 第 2 步：安装 Git

Windows 用户下载并安装 Git for Windows：

<https://git-scm.com/download/win>

安装完成后，关闭并重新打开终端，确认：

```bash
git --version
```

第一次使用 Git 还需要配置提交身份：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的GitHub邮箱"
```

### 第 3 步：创建 GitHub 仓库

1. 打开 <https://github.com/new>。
2. **Repository name** 填写：`my-site`。
3. 可见性选择 **Public**。
4. 不要勾选 “Add a README file”，不要添加 `.gitignore` 或 License。
5. 点击 **Create repository**。

📷 **截图位置：**创建页中部的 Repository name 输入框和下方的 Public 选项。创建完成后，页面右上角会出现仓库地址。

### 第 4 步：把代码推送到 GitHub

先在本项目目录打开终端（PowerShell 或 Git Bash）。

**方式 A：双击 `deploy.bat`（Windows 推荐）**

脚本会自动执行 `git add`、`git commit`、`git push`。第一次运行时，它会询问：

- 你的 GitHub 用户名
- 仓库名（直接回车即使用 `my-site`）
- 如果 Git 尚未配置身份，还会询问名字和邮箱

推送时如果弹出 GitHub 登录窗口，请按提示登录授权。GitHub 已不支持用账号密码直接推送；推荐使用浏览器登录，或在 GitHub → Settings → Developer settings 中创建 Personal Access Token 作为密码。

**方式 B：手动在终端执行**

```bash
git init -b main
git add .
git commit -m "chore: initial site skeleton"
git remote add origin https://github.com/你的GitHub用户名/my-site.git
git push -u origin main
```

📷 **截图位置：**GitHub 仓库首页右上角绿色的 **Code** 按钮，点开后可以在 Local / HTTPS 下确认仓库地址。

### 第 5 步：开启 GitHub Pages

打开仓库页面：

1. 点击 **Settings**。
2. 左侧点击 **Pages**。
3. 在 **Build and deployment** 下，把 **Source** 选为 **GitHub Actions**。

📷 **截图位置：**`Settings → Pages` 页面中部的 **Build and deployment / Source** 下拉框，选择完成后应显示 GitHub Actions。

### 第 6 步：等待自动部署

1. 点击仓库顶部的 **Actions**。
2. 打开 **Deploy to GitHub Pages** 工作流。
3. 等待构建和部署都变成绿色勾。
4. 第一次部署大约需要 1～3 分钟。

📷 **截图位置：**Actions 列表里 **Deploy to GitHub Pages** 左侧的状态勾，以及点进去后 `build`、`deploy` 两个任务的状态。

如果失败，点进失败的任务查看日志；也可对照 [FAQ.md](FAQ.md) 排查。

### 第 7 步：打开公网网址

部署成功后有两种方式拿到网址：

- 回到 **Settings → Pages**，页面顶部会显示你的站点地址；
- 在 **Actions → Deploy to GitHub Pages → deploy** 的步骤里，也会显示部署网址。

地址格式：

```text
https://你的GitHub用户名.github.io/my-site/
```

关于页地址：

```text
https://你的GitHub用户名.github.io/my-site/#/about
```

📷 **截图位置：**`Settings → Pages` 顶部 **Visit site** 按钮旁边的完整 HTTPS 地址。

把网址发到手机浏览器，也应该能正常打开。手机和电脑访问的是同一份静态文件，不需要做额外配置。

## 日常更新

修改代码后，任选一种方式推送：

**双击 `deploy.bat`**，或手动执行：

```bash
git add .
git commit -m "update: 说明这次改了什么"
git push
```

推送到 `main` 后，GitHub Actions 会自动重新构建并发布。等待 Actions 再次变绿，然后刷新线上页面即可。详细排查见 [FAQ.md](FAQ.md)。

## 部署配置说明

- `vite.config.ts` 中的 `base: './'` 让所有资源使用相对路径，因此站点放在 `/<仓库名>/` 这种子路径下也能加载，不会白屏。
- 使用 `HashRouter`，页面地址是 `/#/about` 这类 Hash 路由。GitHub Pages 是纯静态托管，不提供服务端路由重写；Hash 路由可以避免刷新页面时出现服务器 404。
- `.github/workflows/deploy.yml` 使用 GitHub 官方 Pages Actions，先执行 `npm ci` 和 `npm run build`，再发布 `dist/`。
- 站点只使用浏览器本地存储保存主题偏好；标题生成在内存中完成，不上传固定词或限制条件；没有后端接口、API Key 或数据库。

## 继续修改

- 标题、文案、配色、添加新页面：见 [CONTENT-GUIDE.md](CONTENT-GUIDE.md)
- 白屏、404、部署失败、更新不生效：见 [FAQ.md](FAQ.md)
