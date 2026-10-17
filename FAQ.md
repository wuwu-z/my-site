# 常见问题

## 一、本地打开是白屏

按顺序检查：

1. **不要直接双击 `dist/index.html`。**
   请使用：

   ```bash
   npm run dev
   # 或
   npm run build
   npm run preview
   ```

   `file://` 打开时，浏览器会拦截 Vite 生成的模块资源。

2. 终端是否有报错？在项目目录重新执行：

   ```bash
   npm install
   npm run build
   ```

3. 打开浏览器开发者工具，切换到 Console 面板，查看第一条红色报错。
   - 资源 404：检查 `vite.config.ts` 是否仍为 `base: './'`。
   - 入口脚本加载失败：检查 `index.html` 是否存在，且 `#root` 节点没有被删除。
   - 页面空白但无报错：确认 `src/main.tsx` 仍挂载 `<App />`。

4. 如果线上才白屏，见下一节。

## 二、线上白屏怎么办

1. 等待部署真正结束。GitHub Pages 首次发布可能需要 1～3 分钟。
2. 打开仓库的 **Actions → Deploy to GitHub Pages**，确认 `build` 和 `deploy` 都是绿色勾。
3. 打开 **Settings → Pages**，确认 **Source** 是 **GitHub Actions**。
4. 使用完整地址并带末尾斜杠：
   - 正确：`https://用户名.github.io/my-site/`
   - 也正确：`https://用户名.github.io/my-site/#/about`
5. 强制刷新页面：
   - Windows：`Ctrl + F5`
   - Mac：`Cmd + Shift + R`
   - 手机：关闭标签页后重新打开，或使用无痕窗口。
6. 打开开发者工具 Network 面板：
   - 如果 `assets/index-xxx.js` 返回 404，通常是资源路径问题。检查 `vite.config.ts` 中的 `base: './'`，重新推送。
   - 如果所有资源都成功但仍白屏，查看 Console 面板第一条 JS 报错。

## 三、打开后出现 404

先区分两种 404：

### 1. GitHub 的 404 页面（不是站内页面）

说明请求的仓库地址或 Pages 配置有问题：

- 确认仓库名拼写和大小写完全一致。
- 确认仓库是 Public，或你的账号有访问权限。
- 确认 **Settings → Pages** 已开启，且 Source 为 GitHub Actions。
- 确认 Actions 的 `deploy` 任务已成功。
- 地址必须以 `https://用户名.github.io/my-site/` 开头，不能写成别的用户名或仓库名。

### 2. 站内的 “这个页面还不存在” 页面

说明静态页面已经加载成功，只是 Hash 路由没有匹配到页面。本项目使用 HashRouter，地址必须包含 `#`：

- 正确：`https://用户名.github.io/my-site/#/about`
- 错误：`https://用户名.github.io/my-site/about`

对于本项目而言，直接访问不带 `#` 的 `/about` 不会经过前端路由，GitHub Pages 会返回它自己的 404。这是静态托管的正常行为，不是构建失败。

## 四、改了代码，线上没变化

1. 确认本地已经提交并推送：

   ```bash
   git add .
   git commit -m "update: 修改说明"
   git push
   ```

2. 打开仓库的 **Actions**，确认新的 **Deploy to GitHub Pages** 工作流已经运行。
3. 绿色勾出现后再刷新线上页面。
4. 浏览器缓存可能仍在生效，使用 `Ctrl + F5` 或无痕窗口访问。
5. 确认你看的是最新一次部署的网址（Pages 页面顶部显示）。

只看 `npm run dev` 的本地页面不会自动更新公网；本地和线上是两套独立文件。

## 五、`deploy.bat` 推送失败

- **提示找不到 Git**：安装 Git 后，关闭并重新打开窗口，再运行脚本。
- **提示身份未配置**：按脚本提示输入名字和邮箱，或手动执行：
  ```bash
  git config --global user.name "你的名字"
  git config --global user.email "你的GitHub邮箱"
  ```
- **登录失败**：GitHub 已不支持账号密码推送。请在弹窗中完成浏览器登录，或创建 Personal Access Token 作为密码。
- **remote origin already exists**：说明之前已经配置过远程仓库。检查或修改：
  ```bash
  git remote -v
  git remote set-url origin https://github.com/你的用户名/my-site.git
  ```
- **没有改动可以提交**：脚本会提示没有新改动，但仍会把已有提交推送上去。
- **仓库不存在 404**：先在 GitHub 创建名为 `my-site` 的空仓库，再重新运行。

## 六、仓库名不是 `my-site` 可以吗

可以。`base: './'` 使用相对路径，仓库名不需要写进构建配置。把 `deploy.bat` 提示中的仓库名改成实际名称，GitHub Pages 地址相应变为：

```text
https://用户名.github.io/实际仓库名/
```

如果已经配置了远程地址，可执行：

```bash
git remote set-url origin https://github.com/用户名/实际仓库名.git
```

## 七、手机上打开失败

- 请使用线上 `https://...` 地址，不要用 `localhost`；localhost 在手机浏览器里指手机自己。
- 确认手机连接网络正常。
- 如果页面能打开但菜单拥挤，请提供设备型号和浏览器版本；当前布局已针对 390px 宽度做响应式验证。
- 不要通过微信内置浏览器直接下载 `.html` 文件，直接打开 HTTPS 网址即可。

## 八、深色/浅色模式没有保存

主题偏好保存在当前浏览器的 `localStorage` 中：

- 换浏览器或清理站点数据后会恢复为系统主题。
- 首次访问会跟随系统深浅色设置。
- 点击页头右侧的太阳/月亮按钮即可切换。

## 九、部署会收集我的数据吗

不会。这是纯静态站，没有后端、数据库、登录鉴权或第三方统计。主题偏好只存在你自己的浏览器里。
