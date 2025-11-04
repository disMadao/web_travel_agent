# 🚀 Docker 部署指南

本项目已经配置好 Docker，助教或任何人都可以轻松运行，无需手动安装 Python、Node.js 等环境。

---

## 📋 前置要求

只需要安装：
- **Docker** (20.10+)
- **Docker Compose** (2.0+)

### 安装 Docker

**Windows / macOS:**
- 下载 [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Linux:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

---

## 🔑 配置 API Keys（重要！）

### 步骤 1：复制配置模板

```bash
cp .env.example .env
```

### 步骤 2：编辑 `.env` 文件

用文本编辑器打开 `.env`，填写以下配置：

#### 1️⃣ Supabase（数据库）

访问 https://supabase.com/dashboard

1. 创建新项目
2. 进入 **Settings → API**
3. 复制：
   - `Project URL` → `SUPABASE_URL`
   - `service_role key` → `SUPABASE_KEY` ⚠️ 注意：用 service_role，不是 anon
4. 进入 **SQL Editor**，执行 `database/supabase_setup.sql`

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

#### 2️⃣ DeepSeek AI（行程规划）

访问 https://platform.deepseek.com

1. 注册并登录
2. 进入 **API Keys**
3. 创建新 Key
4. 充值 50-100 元（实际消耗很少）

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

#### 3️⃣ 高德地图（地理编码）

访问 https://console.amap.com/dev/key/app

1. 注册并实名认证
2. 创建应用
3. 添加 Key，选择 **"Web服务"** 类型（不是 Web 端）

```bash
AMAP_API_KEY=xxxxxxxxxxxxxxxx
```

#### 4️⃣ 安全密钥

生成一个随机字符串（至少 32 位）：

**Python 方式：**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**在线生成：**
- 访问 https://passwordsgenerator.net/

```bash
SECRET_KEY=你生成的随机字符串
```

### 步骤 3：验证配置

确保 `.env` 文件包含所有必需的值，没有 `your_` 开头的占位符：

```bash
# Linux/macOS
grep "your_" .env

# Windows PowerShell
Select-String -Pattern "your_" -Path .env
```

如果有输出，说明还有未填写的配置！

---

## 🏗️ 构建和运行

### 方式 1：一键启动（推荐）

```bash
docker-compose up -d
```

这会：
- ✅ 自动构建前端和后端镜像
- ✅ 启动所有服务
- ✅ 在后台运行

### 方式 2：逐步构建

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f
```

---

## 🌐 访问应用

服务启动后：

- 🎨 **前端**：http://localhost:3000
- 🔧 **后端 API**：http://localhost:8000
- 📚 **API 文档**：http://localhost:8000/docs
- 🏥 **健康检查**：http://localhost:8000/health

---

## 📊 管理容器

### 查看运行状态

```bash
docker-compose ps
```

应该看到：
```
NAME                       STATUS         PORTS
travel-agent-backend       Up (healthy)   0.0.0.0:8000->8000/tcp
travel-agent-frontend      Up             0.0.0.0:3000->80/tcp
```

### 查看日志

```bash
# 所有服务
docker-compose logs -f

# 仅后端
docker-compose logs -f backend

# 仅前端
docker-compose logs -f frontend

# 最近 100 行
docker-compose logs --tail=100
```

### 重启服务

```bash
# 重启所有
docker-compose restart

# 仅重启后端
docker-compose restart backend
```

### 停止服务

```bash
# 停止但不删除容器
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止、删除容器和网络，但保留镜像
docker-compose down -v
```

### 更新代码后重新构建

```bash
# 重新构建并启动
docker-compose up -d --build

# 仅重新构建特定服务
docker-compose build backend
docker-compose up -d backend
```

---

## 🔍 故障排除

### 问题 1：容器启动失败

**检查日志：**
```bash
docker-compose logs backend
```

**常见原因：**
- ❌ `.env` 文件未创建或配置错误
- ❌ API Key 无效
- ❌ 端口被占用（8000 或 3000）

**解决方法：**
```bash
# 检查端口占用
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :8000
lsof -i :3000

# 修改 docker-compose.yml 中的端口映射
ports:
  - "8001:8000"  # 改为 8001
```

### 问题 2：后端健康检查失败

```bash
docker exec travel-agent-backend curl http://localhost:8000/health
```

如果返回错误：
1. 检查 Supabase 配置是否正确
2. 检查 DeepSeek API Key 是否有效
3. 查看详细错误日志

### 问题 3：前端无法连接后端

**确认后端在运行：**
```bash
curl http://localhost:8000/health
```

**检查前端配置：**
确保 `frontend/.env` 中：
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

如果使用 Docker，应该是：
```bash
VITE_API_BASE_URL=http://backend:8000/api/v1
```

### 问题 4：数据库连接失败

```bash
# 进入后端容器
docker exec -it travel-agent-backend bash

# 测试 Supabase 连接
python -c "
from services.supabase_service import supabase_service
print('Supabase 连接成功！')
"
```

### 问题 5：权限错误（Linux）

```bash
sudo chown -R $USER:$USER .
```

---

## 📦 生产环境部署

### 1. 使用环境变量文件

```bash
docker-compose --env-file .env.production up -d
```

### 2. 配置域名和 HTTPS

使用 Nginx 反向代理 + Let's Encrypt：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. 资源限制

在 `docker-compose.yml` 中添加：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 4. 自动重启

```yaml
services:
  backend:
    restart: always  # 改为 always
```

---

## 🧹 清理

### 删除所有容器和镜像

```bash
# 停止并删除容器
docker-compose down

# 删除镜像
docker rmi travel-agent-backend travel-agent-frontend

# 清理所有未使用的资源
docker system prune -a
```

---

## 📚 相关文档

- [项目总览](README.md)
- [安全升级说明](SECURITY_UPGRADE.md)
- [地图迁移说明](docs/MAP_MIGRATION.md)
- [配置指南](docs/CONFIG_GUIDE.md)
- [故障排除](docs/TROUBLESHOOTING.md)

---

## ✅ 快速检查清单

部署前确认：

- [ ] 已安装 Docker 和 Docker Compose
- [ ] 已复制 `.env.example` 为 `.env`
- [ ] 已填写 Supabase 配置
- [ ] 已填写 DeepSeek API Key
- [ ] 已填写高德地图 API Key
- [ ] 已生成并填写 SECRET_KEY
- [ ] 已在 Supabase 中执行数据库初始化脚本
- [ ] 端口 3000 和 8000 未被占用

全部勾选后，运行：
```bash
docker-compose up -d
```

🎉 **部署完成！访问 http://localhost:3000 开始使用！**

