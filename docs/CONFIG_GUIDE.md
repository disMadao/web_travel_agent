# 配置文件说明

## 配置系统架构

本项目使用 **Pydantic Settings** 管理配置，它会自动从以下来源加载配置（优先级从高到低）：

1. **环境变量** (最高优先级)
2. **.env 文件** (开发环境)
3. **代码默认值** (最低优先级)

---

## 配置文件：backend/config.py

### 工作原理

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = ""  # 默认值
    
    class Config:
        env_file = ".env"           # 从 .env 文件读取
        case_sensitive = False      # 不区分大小写
```

Pydantic Settings 会**自动**查找并加载环境变量！

### 环境变量命名规则

对于字段 `openai_api_key`，以下环境变量名都会被识别：

✅ `OPENAI_API_KEY` (推荐，大写)
✅ `openai_api_key` (小写)
✅ `OpenAI_API_Key` (混合大小写)

因为设置了 `case_sensitive = False`

---

## .env 文件配置

### 创建 .env 文件

```bash
cd backend
cp env.example.txt .env
```

### 编辑 .env 文件

```env
# Supabase Configuration
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_KEY=你的_supabase_anon_key

# DeepSeek API Configuration
OPENAI_API_KEY=sk-你的deepseek_api_key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat

# Amap Configuration
AMAP_API_KEY=你的高德地图key

# Application Configuration
APP_ENV=development
SECRET_KEY=你的密钥
API_PREFIX=/api/v1
CORS_ORIGINS_STR=["http://localhost:5173"]
```

---

## 常见配置场景

### 场景 1：本地开发

使用 `.env` 文件：

```env
# .env
OPENAI_API_KEY=sk-test123
APP_ENV=development
```

### 场景 2：生产部署

使用环境变量（更安全）：

```bash
# 在部署平台设置环境变量
export OPENAI_API_KEY=sk-prod456
export APP_ENV=production
export SECRET_KEY=super-secret-key
```

### 场景 3：切换不同的 LLM

#### 方法一：修改 .env 文件

```env
# 使用 GPT-4
OPENAI_API_KEY=sk-gpt4key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

# 使用通义千问
OPENAI_API_KEY=sk-qwenkey
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-turbo
```

#### 方法二：临时覆盖（不修改文件）

```bash
# Windows
set OPENAI_MODEL=gpt-3.5-turbo
python main.py

# Mac/Linux
OPENAI_MODEL=gpt-3.5-turbo python main.py
```

---

## ⚠️ 常见错误

### ❌ 错误 1：使用 os.getenv()

```python
# ❌ 不推荐
import os
openai_api_key: str = os.getenv("OPENAI_API_KEY")
```

**问题**：
- `os.getenv()` 返回 `None` 如果环境变量不存在
- 类型不匹配（`str` vs `None`）
- 不会从 `.env` 文件读取

```python
# ✅ 推荐
openai_api_key: str = ""  # Pydantic 自动加载
```

### ❌ 错误 2：硬编码敏感信息

```python
# ❌ 不要这样做
supabase_url: str = "https://xxx.supabase.co"
supabase_key: str = "sk-12345"
```

**问题**：
- 密钥暴露在代码中
- 提交到 Git 会泄露

```python
# ✅ 正确做法
supabase_url: str = ""  # 从环境变量加载
supabase_key: str = ""
```

### ❌ 错误 3：.env 文件提交到 Git

```bash
# ❌ 不要做
git add .env
git commit -m "add config"
```

**后果**：API 密钥泄露！

```bash
# ✅ 正确做法
# .env 已在 .gitignore 中排除
# 只提交 env.example.txt 作为模板
```

---

## 配置验证

### 启动时自动验证

Pydantic 会自动验证配置：

```python
class Settings(BaseSettings):
    openai_api_key: str = ""  # 如果缺失，使用默认值
    port: int = 8000          # 自动验证类型
    debug: bool = False       # 自动转换类型
```

### 添加必填字段

```python
from pydantic import Field

class Settings(BaseSettings):
    # 必须提供，否则启动失败
    openai_api_key: str = Field(..., description="DeepSeek API Key")
```

### 添加验证规则

```python
from pydantic import validator

class Settings(BaseSettings):
    port: int = 8000
    
    @validator('port')
    def validate_port(cls, v):
        if not 1024 <= v <= 65535:
            raise ValueError('端口必须在 1024-65535 之间')
        return v
```

---

## 调试配置

### 查看当前配置

```python
# backend/main.py
from config import settings

print(f"API Key: {settings.openai_api_key[:10]}...")
print(f"Model: {settings.openai_model}")
print(f"Environment: {settings.app_env}")
```

### 检查配置来源

```python
# 添加到 config.py
import os

print("Environment variables:")
print(f"OPENAI_API_KEY: {os.getenv('OPENAI_API_KEY', 'Not set')}")
print(f".env file exists: {os.path.exists('.env')}")
```

---

## 生产环境最佳实践

### 1. 使用环境变量（不用 .env 文件）

```bash
# 在服务器或部署平台设置
export OPENAI_API_KEY=sk-prod-key
export APP_ENV=production
export SECRET_KEY=strong-random-key
```

### 2. 使用密钥管理服务

- **AWS Secrets Manager**
- **Google Secret Manager**
- **Azure Key Vault**
- **HashiCorp Vault**

### 3. 定期轮换密钥

```bash
# 定期更新 API 密钥
export OPENAI_API_KEY=sk-new-key
# 重启服务
```

### 4. 最小权限原则

只给应用需要的权限，例如：
- Supabase: 使用 `anon` key，不用 `service_role` key
- OpenAI: 使用有限额度的 key

---

## 配置模板

### 开发环境 (.env)

```env
# Development Configuration
APP_ENV=development
DEBUG=true
LOG_LEVEL=debug

OPENAI_API_KEY=sk-dev-key
OPENAI_MODEL=deepseek-chat

SUPABASE_URL=http://localhost:54321  # 本地 Supabase
SUPABASE_KEY=local-key

CORS_ORIGINS_STR=["http://localhost:5173", "http://localhost:3000"]
```

### 生产环境 (环境变量)

```bash
# Production Environment Variables
export APP_ENV=production
export DEBUG=false
export LOG_LEVEL=warning

export OPENAI_API_KEY=sk-prod-key
export OPENAI_MODEL=deepseek-chat

export SUPABASE_URL=https://xxx.supabase.co
export SUPABASE_KEY=prod-key

export SECRET_KEY=super-long-random-string
export CORS_ORIGINS_STR='["https://yourdomain.com"]'
```

---

## 常见问题

### Q: 配置没有生效？

**检查顺序**：
1. 确认 `.env` 文件存在
2. 确认变量名正确（不区分大小写）
3. 重启服务器
4. 检查是否被环境变量覆盖

### Q: 如何在代码中使用配置？

```python
from config import settings

# 直接使用
api_key = settings.openai_api_key
model = settings.openai_model

# 动态修改（不推荐）
settings.openai_model = "gpt-4"
```

### Q: 如何支持多环境配置？

```python
# config.py
class Settings(BaseSettings):
    app_env: str = "development"
    
    class Config:
        # 根据环境加载不同文件
        env_file = f".env.{os.getenv('APP_ENV', 'development')}"

# 使用
# .env.development
# .env.production
# .env.test
```

---

## 总结

✅ **推荐做法**：
- 使用 Pydantic Settings 自动加载
- 敏感信息存在 `.env` 或环境变量
- `.env` 不提交到 Git
- 生产环境使用环境变量

❌ **避免做法**：
- 硬编码密钥
- 使用 `os.getenv()` 代替 Pydantic
- 提交 `.env` 到 Git
- 在代码中修改配置

🎉 现在你已经掌握了配置管理！

