# ⚡ 快速启动指南（助教版）

## 🎯 5 分钟启动应用

### 第 1 步：安装 Docker

**已安装？跳到第 2 步**

- Windows/macOS: 下载 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Linux: `curl -fsSL https://get.docker.com | sh`

### 第 2 步：获取 API Keys

#### 1. Supabase（数据库）- 免费

1. 访问 https://supabase.com/dashboard
2. 创建新项目（等待 2 分钟）
3. 进入 **Settings → API**，复制：
   - `Project URL`
   - `service_role` secret key ⚠️
4. 进入 **SQL Editor**，执行项目中的 `database/supabase_setup.sql`

#### 2. DeepSeek AI（推荐）- 便宜

1. 访问 https://platform.deepseek.com
2. 注册并创建 API Key
3. 充值 50 元（可用很久）

#### 3. 高德地图 - 免费额度

1. 访问 https://console.amap.com/dev/key/app
2. 实名认证后创建应用
3. 添加 **"Web服务"** Key（不是 Web 端）

### 第 3 步：配置环境变量

```bash
# 1. 复制模板
cp env.template .env

# 2. 编辑 .env 文件，填入你的 API Keys
# Windows: notepad .env
# macOS: open -e .env
# Linux: nano .env
```

**必填项**：
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
AMAP_API_KEY=xxxxxxxxxxxxxxxx
SECRET_KEY=随机生成一个32位字符串
```

**生成 SECRET_KEY**：
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 第 4 步：启动

```bash
docker-compose up -d
```

等待 1-2 分钟...

### 第 5 步：访问

🎉 打开浏览器：http://localhost:3000

---

## 📊 验证是否成功

```bash
# 查看服务状态
docker-compose ps

# 应该显示两个服务都是 "Up"
```

查看日志：
```bash
docker-compose logs -f
```

测试后端：
```bash
curl http://localhost:8000/health
# 应该返回: {"status":"healthy"}
```

---

## 🔧 常见问题

### ❌ 端口被占用

修改 `docker-compose.yml`：
```yaml
ports:
  - "8001:8000"  # 后端改为 8001
  - "3001:80"    # 前端改为 3001
```

### ❌ 容器启动失败

```bash
# 查看错误日志
docker-compose logs backend

# 常见原因：
# 1. .env 文件未创建或配置错误
# 2. API Key 无效
# 3. Supabase 数据库未初始化
```

### ❌ 前端白屏

1. 检查后端是否运行：`curl http://localhost:8000/health`
2. 查看浏览器控制台错误
3. 确认前端配置文件中的 API 地址正确

---

## 🛑 停止服务

```bash
# 停止但保留数据
docker-compose stop

# 完全删除（下次需重新构建）
docker-compose down
```

---

## 📖 完整文档

- 详细部署说明：[DEPLOYMENT.md](DEPLOYMENT.md)
- 项目介绍：[README.md](README.md)
- 安全说明：[SECURITY_UPGRADE.md](SECURITY_UPGRADE.md)

---

## ✅ 检查清单

启动前确认：

- [ ] Docker 已安装并运行
- [ ] 已获取 Supabase URL 和 Key
- [ ] 已获取 DeepSeek API Key
- [ ] 已获取高德地图 API Key
- [ ] 已复制 `env.template` 为 `.env`
- [ ] 已在 `.env` 中填写所有 API Keys
- [ ] 已生成并填写 SECRET_KEY
- [ ] 已在 Supabase 中执行 `database/supabase_setup.sql`

全部完成后，运行 `docker-compose up -d`，然后访问 http://localhost:3000 🚀

