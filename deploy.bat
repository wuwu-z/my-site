@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo ==========================================
echo    我的网站 - 推送到 GitHub
echo ==========================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [错误] 没有找到 Git。
  echo 请先安装 Git：https://git-scm.com/download/win
  echo 安装完成后，关闭并重新打开这个窗口。
  echo.
  pause
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [1/4] 正在初始化 Git 仓库...
  git init -b main
  if errorlevel 1 goto :failed
) else (
  echo [1/4] 已检测到 Git 仓库。
)

git config user.name >nul 2>nul
if errorlevel 1 (
  echo.
  echo [提示] 第一次使用 Git，需要设置提交者信息。
  set /p "GIT_NAME=你的名字或昵称: "
  if "!GIT_NAME!"=="" (
    echo [错误] 名字不能为空。
    pause
    exit /b 1
  )
  git config user.name "!GIT_NAME!"
)

git config user.email >nul 2>nul
if errorlevel 1 (
  set /p "GIT_EMAIL=你的邮箱: "
  if "!GIT_EMAIL!"=="" (
    echo [错误] 邮箱不能为空。
    pause
    exit /b 1
  )
  git config user.email "!GIT_EMAIL!"
)

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  echo.
  echo [2/4] 尚未连接远程仓库。
  echo 请先在 GitHub 创建一个名为 my-site 的空仓库。
  echo 创建地址：https://github.com/new
  echo.
  set /p "GH_USER=你的 GitHub 用户名: "
  if "!GH_USER!"=="" (
    echo [错误] GitHub 用户名不能为空。
    pause
    exit /b 1
  )
  set "REPO_NAME=my-site"
  set /p "REPO_INPUT=仓库名（直接回车使用 my-site）: "
  if not "!REPO_INPUT!"=="" set "REPO_NAME=!REPO_INPUT!"
  git remote add origin "https://github.com/!GH_USER!/!REPO_NAME!.git"
  if errorlevel 1 goto :failed
) else (
  echo [2/4] 已连接远程仓库。
)

git add -A
if errorlevel 1 goto :failed

git diff --cached --quiet
if errorlevel 1 (
  echo [3/4] 正在提交本地改动...
  git commit -m "chore: update website"
  if errorlevel 1 goto :failed
) else (
  echo [3/4] 没有需要提交的新改动。
)

git branch -M main
if errorlevel 1 goto :failed

echo [4/4] 正在推送到 GitHub...
echo.
git push -u origin main
if errorlevel 1 (
  echo.
  echo [错误] 推送失败。常见原因：
  echo   1. GitHub 仓库还没有创建，或仓库名写错了。
  echo   2. 首次推送需要登录 GitHub。请在弹窗中完成登录，
  echo      或使用 Personal Access Token 作为密码。
  echo   3. 远程地址已经配置成了别的仓库。
  echo      可以运行：git remote set-url origin https://github.com/用户名/仓库名.git
  echo.
  pause
  exit /b 1
)

echo.
echo ==========================================
echo    推送完成！
echo ==========================================
echo.
echo 接下来：
echo   1. 打开仓库的 Settings - Pages。
echo   2. 把 Source 设为 GitHub Actions。
echo   3. 在 Actions 页面等待部署出现绿色勾。
echo   4. 访问：https://你的用户名.github.io/仓库名/
echo.
echo 详细步骤见 README.md。
echo.
pause
exit /b 0

:failed
echo.
echo [错误] Git 命令执行失败，请根据上面的提示处理。
echo.
pause
exit /b 1
