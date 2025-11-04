# 完整安装指南

本指南将帮助您从零开始搭建 AI 智能旅行助手系统。

## 前置要求

### 必需软件
- **Node.js** 18.0 或更高版本
- **Python** 3.9 或更高版本
- **Git** (用于克隆代码)
- **npm** 或 **yarn** (Node 包管理器)

### 必需服务账号
1. **Supabase** - 数据库和认证服务
   - 注册地址: https://supabase.com
   - 免费套餐足够使用

2. **DeepSeek API** - AI 行程规划（默认）
   - 注册地址: https://platform.deepseek.com
   - 国内访问友好，性价比高
   - 也可使用其他兼容 OpenAI 格式的 API（GPT、通义千问、文心一言等）

3. **高德地图 API** - 地图服务
   - 注册地址: https://lbs.amap.com
   - 需要 Web 服务 Key 和 JS API Key

## 第一步：获取 API 密钥

### 1. Supabase

1. 访问 https://supabase.com 并注册
2. 创建新项目
3. 在项目设置 -> API 中获取：
   - `Project URL`
   - `anon public key`
4. 在 SQL Editor 中执行 `database/supabase_setup.sql` 初始化数据库

### 2. DeepSeek API（默认推荐）

1. 访问 https://platform.deepseek.com
2. 注册并充值（¥10 即可使用很久）
3. 创建 API Key
4. 默认使用 `deepseek-chat` 模型

**优势**：
- 国内访问速度快，无需代理
- 价格实惠（比 GPT-4 便宜 90%+）
- 性能优秀，适合中文场景
- 完全兼容 OpenAI API 格式

**替代方案**：
- **OpenAI GPT-4**: 修改 `OPENAI_BASE_URL=https://api.openai.com/v1` 和 `OPENAI_MODEL=gpt-4`
- **通义千问**: 使用阿里云的兼容接口
- **文心一言**: 使用百度的兼容接口
- 只需修改 `.env` 中的 `OPENAI_BASE_URL`、`OPENAI_API_KEY` 和 `OPENAI_MODEL`

### 3. 高德地图 API

1. 访问 https://lbs.amap.com 并注册
2. 进入控制台 -> 应用管理 -> 我的应用
3. 创建新应用
4. 添加 Key：
   - **Web 服务 API**: 用于后端
   - **Web 端（JS API）**: 用于前端
5. 设置安全密钥（前端需要）

## 第二步：后端设置

### 1. 进入后端目录

```bash
cd backend
```

### 2. 创建虚拟环境（推荐）

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 配置环境变量

```bash
# 复制示例文件
cp env.example.txt .env

# 编辑 .env 文件（使用任何文本编辑器）
```

在 `.env` 文件中填入：

```env
# Supabase
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_KEY=你的supabase_anon_key

# DeepSeek API (默认推荐)
OPENAI_API_KEY=sk-你的deepseek_api_key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat

# 高德地图
AMAP_API_KEY=你的高德web服务key

# 应用配置
SECRET_KEY=随机生成一个长字符串
```

### 5. 启动后端服务

```bash
# 开发模式（自动重载）
uvicorn main:app --reload --port 8000

# 或使用 Python 直接运行
python main.py
```

访问 http://localhost:8000/docs 查看 API 文档

## 第三步：前端设置

### 1. 打开新终端，进入前端目录

```bash
cd frontend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
# 复制示例文件
cp env.example.txt .env.local

# 编辑 .env.local 文件
```

在 `.env.local` 文件中填入：

```env
# Supabase
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的supabase_anon_key

# API
VITE_API_BASE_URL=http://localhost:8000/api/v1

# 高德地图
VITE_AMAP_KEY=你的高德JS_API_key
VITE_AMAP_SECURITY_CODE=你的高德安全密钥
```

### 4. 启动前端服务

```bash
npm run dev
```

访问 http://localhost:5173

## 第四步：测试系统

### 1. 注册账号
1. 访问 http://localhost:5173
2. 点击"注册新账号"
3. 填写邮箱和密码
4. 完成注册并登录

### 2. 创建第一个行程
1. 点击"创建新行程"
2. 填写基本信息：
   - 目的地：日本东京
   - 日期：选择未来的日期范围
   - 预算：10000
   - 人数：2
3. 选择偏好：美食、动漫
4. 点击"生成行程"
5. 等待 AI 生成（约 30-60 秒）

### 3. 测试语音功能
1. 在任何输入框旁边点击麦克风图标
2. 允许浏览器访问麦克风
3. 说话（中文）
4. 查看识别结果

### 4. 测试费用管理
1. 在行程详情页点击"费用预算"标签
2. 点击"添加实际花费"
3. 填写费用信息
4. 查看统计数据

## 常见问题

### Q1: 后端启动失败
**可能原因**:
- Python 版本不兼容（需要 3.9+）
- 依赖安装不完整
- 环境变量配置错误

**解决方案**:
```bash
# 检查 Python 版本
python --version

# 重新安装依赖
pip install -r requirements.txt --upgrade

# 检查 .env 文件是否存在
ls -la .env
```

### Q2: 前端无法连接后端
**可能原因**:
- 后端未启动
- CORS 配置问题
- API URL 配置错误

**解决方案**:
1. 确保后端在 8000 端口运行
2. 检查 `.env.local` 中的 `VITE_API_BASE_URL`
3. 检查浏览器控制台的错误信息

### Q3: AI 生成行程失败
**可能原因**:
- OpenAI API Key 无效或余额不足
- 网络连接问题
- API 请求超时

**解决方案**:
1. 检查 OpenAI API Key 是否正确
2. 访问 https://platform.openai.com/account/usage 检查余额
3. 尝试使用国内大模型替代

### Q4: 语音识别不工作
**可能原因**:
- 浏览器不支持 Web Speech API
- 未授予麦克风权限
- 使用 HTTP 而非 HTTPS (某些浏览器限制)

**解决方案**:
1. 使用 Chrome 或 Edge 浏览器
2. 允许浏览器访问麦克风
3. 在 localhost 开发环境中应该可以使用

### Q5: 地图不显示
**可能原因**:
- 高德地图 API Key 无效
- 安全密钥配置错误
- 域名未在高德控制台配置

**解决方案**:
1. 检查 API Key 和安全密钥
2. 在高德控制台添加 `localhost` 到白名单
3. 检查浏览器控制台的错误信息

### Q6: Supabase 连接失败
**可能原因**:
- URL 或 Key 错误
- 数据库未初始化
- RLS 策略问题

**解决方案**:
1. 检查 Supabase URL 和 Key
2. 确保执行了 `supabase_setup.sql`
3. 在 Supabase Dashboard 检查 RLS 策略

## 生产部署

### 后端部署 (Railway / Render / Fly.io)

```bash
# 1. 安装生产依赖
pip install gunicorn

# 2. 创建 Procfile
echo "web: gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker" > Procfile

# 3. 设置环境变量
# 在部署平台设置所有 .env 中的变量

# 4. 部署
git push
```

### 前端部署 (Vercel / Netlify)

```bash
# 1. 构建
npm run build

# 2. 设置环境变量
# 在部署平台设置所有 .env.local 中的变量

# 3. 部署
vercel --prod
# 或
netlify deploy --prod
```

## 性能优化建议

1. **数据库**: 为常用查询添加索引
2. **缓存**: 使用 Redis 缓存 API 响应
3. **CDN**: 使用 CDN 加速静态资源
4. **压缩**: 启用 Gzip 压缩
5. **懒加载**: 实现图片和组件懒加载

## 安全建议

1. **API Key**: 不要将 API Key 提交到 Git
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **CORS**: 正确配置 CORS 策略
4. **RLS**: 确保 Supabase RLS 策略正确
5. **输入验证**: 对所有用户输入进行验证

## 下一步

- 📚 阅读 [API 文档](backend/README.md)
- 🎨 自定义 UI 主题和样式
- 🌍 添加多语言支持
- 📱 开发移动端应用
- 🔔 添加实时通知功能

## 获取帮助

如果遇到问题：
1. 检查控制台错误信息
2. 查看日志文件
3. 参考各服务的官方文档
4. 搜索相关问题和解决方案

祝您使用愉快！🎉

