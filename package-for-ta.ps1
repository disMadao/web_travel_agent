# 打包脚本 - 创建助教使用包
# 使用方法：在项目根目录运行 .\package-for-ta.ps1

# 检查是否在正确的目录
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本！" -ForegroundColor Red
    Write-Host "当前目录: $PWD" -ForegroundColor Yellow
    exit 1
}

# 检查镜像文件是否存在
$backendTar = "travel-agent-backend.tar"
$frontendTar = "travel-agent-frontend.tar"
$backendTarGz = "travel-agent-backend.tar.gz"
$frontendTarGz = "travel-agent-frontend.tar.gz"

$hasBackend = (Test-Path $backendTar) -or (Test-Path $backendTarGz)
$hasFrontend = (Test-Path $frontendTar) -or (Test-Path $frontendTarGz)

if (-not $hasBackend) {
    Write-Host "❌ 错误：找不到后端镜像文件！" -ForegroundColor Red
    Write-Host "请先执行：docker save -o $backendTar travel-agent-backend:latest" -ForegroundColor Yellow
    exit 1
}

if (-not $hasFrontend) {
    Write-Host "❌ 错误：找不到前端镜像文件！" -ForegroundColor Red
    Write-Host "请先执行：docker save -o $frontendTar travel-agent-frontend:latest" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 开始打包..." -ForegroundColor Cyan

# 1. 创建文件夹
$targetDir = "travel-agent-for-ta"
if (Test-Path $targetDir) {
    Write-Host "⚠️  文件夹已存在，删除旧文件..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $targetDir
}
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

# 2. 复制镜像文件
Write-Host "📋 复制镜像文件..." -ForegroundColor Cyan
if (Test-Path $backendTarGz) {
    Copy-Item $backendTarGz $targetDir\ -ErrorAction Stop
    Write-Host "  ✓ $backendTarGz" -ForegroundColor Green
} elseif (Test-Path $backendTar) {
    Copy-Item $backendTar $targetDir\ -ErrorAction Stop
    Write-Host "  ✓ $backendTar" -ForegroundColor Green
}

if (Test-Path $frontendTarGz) {
    Copy-Item $frontendTarGz $targetDir\ -ErrorAction Stop
    Write-Host "  ✓ $frontendTarGz" -ForegroundColor Green
} elseif (Test-Path $frontendTar) {
    Copy-Item $frontendTar $targetDir\ -ErrorAction Stop
    Write-Host "  ✓ $frontendTar" -ForegroundColor Green
}

# 3. 复制配置文件
Write-Host "📋 复制配置文件..." -ForegroundColor Cyan
$configFiles = @(
    "docker-compose.image.yml",
    "env.template",
    "README_FOR_TA.md"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item $file $targetDir\ -ErrorAction Stop
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  警告：找不到 $file" -ForegroundColor Yellow
    }
}

# 4. 复制数据库脚本
Write-Host "📋 复制数据库脚本..." -ForegroundColor Cyan
if (Test-Path "database") {
    Copy-Item -Recurse database $targetDir\ -ErrorAction Stop
    Write-Host "  ✓ database/" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  警告：找不到 database 目录" -ForegroundColor Yellow
}

# 5. 创建压缩包
Write-Host "📦 创建压缩包..." -ForegroundColor Cyan
$zipFile = "travel-agent-for-ta.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}
Compress-Archive -Path $targetDir -DestinationPath $zipFile -Force

# 完成
Write-Host ""
Write-Host "✅ 打包完成！" -ForegroundColor Green
Write-Host "📁 文件夹: $PWD\$targetDir" -ForegroundColor Cyan
Write-Host "📦 压缩包: $PWD\$zipFile" -ForegroundColor Cyan

# 显示文件大小
$zipSize = (Get-Item $zipFile).Length / 1MB
Write-Host "📊 文件大小: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Yellow

Write-Host ""
Write-Host "🎉 可以将 $zipFile 分享给助教了！" -ForegroundColor Green

