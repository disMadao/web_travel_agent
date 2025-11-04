# 常见问题排查指南

本文档记录了开发过程中遇到的常见问题及解决方案。

---

## 🐛 前端错误：Cannot read properties of undefined (reading '0')

### 问题描述
在创建行程页面点击"生成行程"时，前端报错：
```
Cannot read properties of undefined (reading '0')
```

### 根本原因
**"下一步"按钮没有验证表单字段**，用户可以跳过第一步的必填字段直接进入下一步。

当点击"生成行程"时，尝试访问 `values.dateRange[0]` 但 `dateRange` 是 `undefined`，导致报错。

### 解决方案
修改 `frontend/src/pages/CreateTrip.tsx`：

1. **添加步骤验证函数**
```typescript
const validateCurrentStep = async () => {
  try {
    if (currentStep === 0) {
      await form.validateFields(['destination', 'dateRange', 'budget', 'travelers'])
      return true
    }
    return true
  } catch (error) {
    message.error('请填写所有必填项')
    return false
  }
}
```

2. **修改"下一步"按钮**
```typescript
const handleNext = async () => {
  const isValid = await validateCurrentStep()
  if (isValid) {
    setCurrentStep(currentStep + 1)
  }
}

// 按钮调用
<Button onClick={handleNext}>下一步</Button>
```

3. **添加额外检查**
```typescript
const handleSubmit = async () => {
  const values = await form.validateFields()
  
  // 双重检查
  if (!values.dateRange || !values.dateRange[0]) {
    message.error('请选择旅行日期')
    return
  }
  
  // 继续处理...
}
```

### 教训
- ✅ **分步表单必须验证每一步**
- ✅ **在提交前做最终检查**
- ✅ **提供友好的错误提示**

---

## 🔐 认证错误：缺少 access_token 字段

### 问题描述
用户注册时后端返回 400 错误，提示缺少 `access_token` 字段。

### 根本原因
Supabase **默认开启邮箱验证**，注册后不会立即返回 session，而是要求用户先验证邮箱。

### 解决方案

#### 方案 1：关闭邮箱验证（开发环境）⭐
1. 登录 Supabase Dashboard
2. Authentication → Settings → Email Auth
3. **关闭** `Enable email confirmations`
4. 保存设置

#### 方案 2：修改代码处理邮箱验证
```python
# backend/api/auth.py
if not response.session:
    raise HTTPException(
        status_code=400,
        detail="注册成功！请检查邮箱并点击确认链接后再登录。"
    )
```

#### 方案 3：手动验证用户
```sql
-- 在 Supabase SQL Editor 中运行
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### 相关文档
- 📖 [Supabase 认证配置](SUPABASE_AUTH_SETUP.md)

---

## 👻 用户已注册但查不到

### 问题描述
前端提示"邮箱已注册"，但在 Supabase 的 `auth.users` 表中查不到用户。

### 可能原因
1. 用户已注册但未验证邮箱（`email_confirmed_at` 为 NULL）
2. 用户在 `identities` 表中，但不在 `users` 表中
3. 数据库视图权限问题

### 排查步骤

#### 1. 查看所有用户
```sql
SELECT 
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ 未验证'
        ELSE '✅ 已验证'
    END as status
FROM auth.users
ORDER BY created_at DESC;
```

#### 2. 查找特定邮箱
```sql
SELECT * FROM auth.users 
WHERE email = 'user@example.com';
```

#### 3. 检查 identities 表
```sql
SELECT * FROM auth.identities 
WHERE provider_id = 'user@example.com';
```

### 解决方案

#### 方案 1：删除并重新注册
```sql
-- 删除用户
DELETE FROM auth.users WHERE email = 'user@example.com';

-- 删除 identity 记录（如果存在）
DELETE FROM auth.identities WHERE provider_id = 'user@example.com';

-- 重新注册
```

#### 方案 2：手动验证邮箱
```sql
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'user@example.com';
```

---

## 🚫 Supabase 连接失败：Invalid URL

### 问题描述
启动后端时报错：
```
SupabaseException: Invalid URL
```

### 根本原因
`.env` 文件中的 `SUPABASE_URL` 或 `SUPABASE_KEY` 为空或格式错误。

### 解决方案

1. **检查 .env 文件是否存在**
```bash
cd backend
ls .env  # 或 dir .env (Windows)
```

2. **查看配置内容**
```bash
cat .env  # 或 type .env (Windows)
```

3. **确保配置正确**
```env
# 正确格式
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGci...

# ❌ 错误：空值
SUPABASE_URL=
SUPABASE_KEY=

# ❌ 错误：示例值
SUPABASE_URL=your_supabase_url
```

4. **重启服务**
```bash
python main.py
```

### 获取正确的值
1. 访问 https://supabase.com
2. 选择你的项目
3. Settings → API
4. 复制：
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_KEY`

---

## 📦 虚拟环境问题

### 问题：ModuleNotFoundError

**症状**：
```
ModuleNotFoundError: No module named 'fastapi'
```

**原因**：依赖未安装或未在虚拟环境中运行。

**解决**：
```bash
# 1. 激活虚拟环境
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# 2. 检查是否在虚拟环境中
where python  # 应该显示 venv/Scripts/python.exe

# 3. 安装依赖
pip install -r requirements.txt
```

### 问题：PowerShell 无法执行脚本

**症状**：
```
无法加载文件 Activate.ps1，因为在此系统上禁止运行脚本
```

**解决**：
```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy RemoteSigned

# 或使用 CMD 代替 PowerShell
```

---

## 🔑 API Key 配置问题

### DeepSeek API Key 无效

**症状**：
```
❌ AI 模型 API Key 缺失！
```

**检查**：
1. `.env` 文件中是否有 `OPENAI_API_KEY`
2. Key 是否以 `sk-` 开头
3. Key 是否有效（访问 https://platform.deepseek.com 检查）

**解决**：
```env
# .env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

---

## 🗺️ 地图不显示

### 问题描述
地图组件显示空白或报错。

### 可能原因
1. 高德地图 API Key 未配置或无效
2. 安全密钥未配置
3. 域名未在高德控制台配置

### 解决方案

1. **检查配置**
```env
# frontend/.env.local
VITE_AMAP_KEY=你的Key
VITE_AMAP_SECURITY_CODE=你的安全密钥
```

2. **配置白名单**
   - 访问 https://lbs.amap.com/console
   - 进入应用管理
   - 添加 `localhost` 到白名单

3. **查看控制台错误**
   - 按 F12 打开浏览器控制台
   - 查看错误信息

---

## 📊 最佳实践

### ✅ 开发流程

1. **启动虚拟环境**
```bash
cd backend
venv\Scripts\activate
```

2. **检查配置**
```bash
cat .env  # 确保所有密钥已配置
```

3. **启动后端**
```bash
python main.py
```

4. **启动前端**（新终端）
```bash
cd frontend
npm run dev
```

5. **测试功能**
   - 注册 → 登录 → 创建行程

### ✅ 调试技巧

1. **查看后端日志**
   - 后端控制台会显示详细错误
   - 关注 `print()` 输出的调试信息

2. **查看前端控制台**
   - F12 → Console 查看 JavaScript 错误
   - Network 查看 API 请求/响应

3. **查看数据库**
   - Supabase Dashboard → Table Editor
   - SQL Editor 运行查询

---

## 🆘 获取帮助

如果遇到本文档未涵盖的问题：

1. **查看日志**：仔细阅读错误信息
2. **查看文档**：
   - [快速开始](../QUICKSTART.md)
   - [配置指南](CONFIG_GUIDE.md)
   - [虚拟环境](PYTHON_VENV.md)
3. **搜索错误**：在网上搜索错误信息
4. **检查配置**：确保所有 API Key 正确

---

## 📝 更新日志

- 2024-01-XX：添加前端表单验证问题
- 2024-01-XX：添加 Supabase 认证问题
- 2024-01-XX：添加虚拟环境问题

持续更新中...

