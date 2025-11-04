# 🐳 本地构建 Docker 镜像并分享给助教

本指南说明如何**在本地构建 Docker 镜像**，然后**将镜像文件分享给助教**，助教可以直接导入使用，无需重新构建。

---

## 步骤 1：构建镜像（已完成）

如果你已经构建了镜像，可以跳过这一步。

```bash
# 确保在项目根目录
cd D:\code_2\web_travel_agent

# 构建后端镜像
docker build -t travel-agent-backend:latest ./backend

# 构建前端镜像
docker build -t travel-agent-frontend:latest ./frontend
```

**等待 2-5 分钟...**

---

## 步骤 2：验证镜像构建成功

检查镜像是否已成功构建：

```bash
docker images | findstr travel-agent
```

**Windows PowerShell:**
```powershell
docker images | Select-String travel-agent
```

你应该看到两个镜像：
```
travel-agent-backend      latest    xxxxx    2 minutes ago    500MB
travel-agent-frontend     latest    xxxxx    1 minute ago     300MB
```

---

## 步骤 3：导出镜像为文件

将镜像导出为 `.tar` 文件，方便传输：

```bash
# 导出后端镜像
docker save -o travel-agent-backend.tar travel-agent-backend:latest

# 导出前端镜像
docker save -o travel-agent-frontend.tar travel-agent-frontend:latest
```

**文件大小：**
- 后端镜像：约 400-600MB
- 前端镜像：约 200-400MB
- 总计：约 600MB-1GB

**等待导出完成...**

---

## 步骤 4：压缩镜像文件（可选）

为了减少传输时间，可以压缩镜像文件：

### Windows（使用 PowerShell）

```powershell
# 使用 7-Zip（如果已安装）
& "C:\Program Files\7-Zip\7z.exe" a -t7z travel-agent-backend.7z travel-agent-backend.tar
& "C:\Program Files\7-Zip\7z.exe" a -t7z travel-agent-frontend.7z travel-agent-frontend.tar

# 或者使用内置的压缩（文件大小可能不会减少太多）
Compress-Archive -Path travel-agent-backend.tar -DestinationPath travel-agent-backend.zip
Compress-Archive -Path travel-agent-frontend.tar -DestinationPath travel-agent-frontend.zip
```

### Linux/macOS

```bash
# 使用 gzip 压缩（推荐）
gzip travel-agent-backend.tar
gzip travel-agent-frontend.tar

# 或者使用 bzip2（压缩率更高，但更慢）
bzip2 travel-agent-backend.tar
bzip2 travel-agent-frontend.tar
```

**压缩后文件：**
- `travel-agent-backend.tar.gz` 或 `travel-agent-backend.7z`
- `travel-agent-frontend.tar.gz` 或 `travel-agent-frontend.7z`

---

## 步骤 5：创建助教使用包

创建一个文件夹，包含所有必需文件：

### Windows PowerShell

```powershell
# 确保在项目根目录
cd D:\code_2\web_travel_agent

# 1. 创建文件夹
New-Item -ItemType Directory -Path travel-agent-for-ta -Force

# 2. 复制镜像文件（压缩后的）
Copy-Item travel-agent-backend.tar.gz travel-agent-for-ta/ -ErrorAction Stop
Copy-Item travel-agent-frontend.tar.gz travel-agent-for-ta/ -ErrorAction Stop

# 或者如果未压缩（使用 .tar 文件）
Copy-Item travel-agent-backend.tar travel-agent-for-ta/ -ErrorAction Stop
Copy-Item travel-agent-frontend.tar travel-agent-for-ta/ -ErrorAction Stop

# 3. 复制配置文件
Copy-Item docker-compose.image.yml travel-agent-for-ta/ -ErrorAction Stop
Copy-Item env.template travel-agent-for-ta/ -ErrorAction Stop
Copy-Item README_FOR_TA.md travel-agent-for-ta/ -ErrorAction Stop

# 4. 复制数据库脚本
Copy-Item -Recurse database travel-agent-for-ta/ -ErrorAction Stop

# 5. 创建最终压缩包
Compress-Archive -Path travel-agent-for-ta -DestinationPath travel-agent-for-ta.zip -Force

Write-Host "✅ 打包完成！文件位置: $PWD\travel-agent-for-ta.zip" -ForegroundColor Green
```

### Linux/macOS

```bash
# 创建文件夹
mkdir travel-agent-for-ta

# 复制镜像文件（压缩后的）
cp travel-agent-backend.tar.gz travel-agent-for-ta/
cp travel-agent-frontend.tar.gz travel-agent-for-ta/

# 或者如果未压缩
cp travel-agent-backend.tar travel-agent-for-ta/
cp travel-agent-frontend.tar travel-agent-for-ta/

# 复制配置文件
cp docker-compose.yml env.template README_FOR_TA.md travel-agent-for-ta/
cp -r database travel-agent-for-ta/

# 创建最终压缩包
tar -czf travel-agent-for-ta.tar.gz travel-agent-for-ta/
```

**最终文件结构：**
```
travel-agent-for-ta/
├── travel-agent-backend.tar.gz        # 后端镜像（压缩后）
├── travel-agent-frontend.tar.gz      # 前端镜像（压缩后）
├── docker-compose.image.yml            # Docker 配置（使用已导入的镜像）
├── env.template                         # 环境变量模板
├── README_FOR_TA.md                     # 助教运行指南
└── database/
    └── supabase_setup.sql              # 数据库初始化脚本
```

---

## 步骤 6：分享给助教

将以下文件分享给助教：

- **Windows**: `travel-agent-for-ta.zip`
- **Linux/macOS**: `travel-agent-for-ta.tar.gz`

**文件大小：** 约 600MB-1GB（取决于压缩方式）

---

## 步骤 7：助教使用说明

助教收到文件后，需要按以下步骤操作：

### 1. 解压文件

**Windows:**
- 右键解压 `travel-agent-for-ta.zip`

**Linux/macOS:**
```bash
tar -xzf travel-agent-for-ta.tar.gz
cd travel-agent-for-ta
```

### 2. 导入镜像

**Windows PowerShell:**
```powershell
# 如果文件是压缩的，先解压
Expand-Archive -Path travel-agent-backend.tar.gz -DestinationPath .
Expand-Archive -Path travel-agent-frontend.tar.gz -DestinationPath .

# 导入镜像
docker load -i travel-agent-backend.tar
docker load -i travel-agent-frontend.tar
```

**Linux/macOS:**
```bash
# 如果文件是压缩的，先解压
gunzip travel-agent-backend.tar.gz
gunzip travel-agent-frontend.tar.gz

# 导入镜像
docker load -i travel-agent-backend.tar
docker load -i travel-agent-frontend.tar
```

**验证镜像导入成功：**
```bash
docker images | grep travel-agent
```

应该看到两个镜像。

### 3. 配置环境变量

```bash
# 复制模板
cp env.template .env

# Windows
copy env.template .env

# 编辑 .env 文件，填入 API Keys
# （详细说明见 README_FOR_TA.md）
```

### 4. 启动应用

```bash
docker-compose up -d
```

### 5. 访问应用

- 前端：http://localhost:3000
- 后端文档：http://localhost:8000/docs

---

## ✅ 完成检查清单

- [ ] 已成功构建后端镜像
- [ ] 已成功构建前端镜像
- [ ] 已验证镜像存在（`docker images`）
- [ ] 已导出后端镜像为 `.tar` 文件
- [ ] 已导出前端镜像为 `.tar` 文件
- [ ] 已压缩镜像文件（可选）
- [ ] 已创建助教使用包
- [ ] 已包含所有必需文件（docker-compose.yml, env.template, README_FOR_TA.md, database/）
- [ ] 已测试打包文件完整性

---

## 🎉 完成！

现在你已经：
- ✅ 构建了本地 Docker 镜像
- ✅ 导出了镜像文件
- ✅ 打包了所有必需文件

**助教只需要：**
1. 解压文件
2. 导入镜像（`docker load`）
3. 配置 `.env` 文件
4. 运行 `docker-compose up -d`

**优势：**
- ✅ 不需要网络拉取镜像（离线可用）
- ✅ 助教无需构建镜像（节省时间）
- ✅ 确保助教使用的是你构建的版本

---

## 💡 提示

### 更新镜像

如果代码有更新，需要重新构建和导出：

```bash
# 1. 重新构建
docker build -t travel-agent-backend:latest ./backend
docker build -t travel-agent-frontend:latest ./frontend

# 2. 重新导出
docker save -o travel-agent-backend.tar travel-agent-backend:latest
docker save -o travel-agent-frontend.tar travel-agent-frontend:latest

# 3. 重新压缩和打包
```

### 减小文件大小

如果镜像文件太大，可以尝试：

1. **使用多阶段构建优化**（已在 Dockerfile 中实现）
2. **压缩镜像**：
   ```bash
   # Linux/macOS
   gzip -9 travel-agent-backend.tar  # 最高压缩率
   ```
3. **使用 Docker 镜像压缩工具**（如 `docker-squash`）

### 版本管理

可以给镜像打版本标签：

```bash
docker tag travel-agent-backend:latest travel-agent-backend:v1.0
docker save -o travel-agent-backend-v1.0.tar travel-agent-backend:v1.0
```

这样可以在同一个包中包含多个版本。

---

## 📚 相关文档

- `BUILD_AND_SHARE.md` - 其他打包方式（包括 Docker Hub 方式）
- `DEPLOYMENT.md` - 详细部署说明
- `README_FOR_TA.md` - 助教运行指南
- `QUICK_START.md` - 5分钟快速启动
