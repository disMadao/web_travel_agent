# 后端 API 文档

## 安装和运行

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 配置环境变量
复制 `env.example.txt` 为 `.env` 文件，并填写必要的配置：

```bash
cp env.example.txt .env
```

需要配置：
- Supabase URL 和 Key
- OpenAI API Key
- 高德地图 API Key
- Secret Key（用于 JWT）

### 3. 运行服务器
```bash
# 开发模式
uvicorn main:app --reload --port 8000

# 或使用 Python 直接运行
python main.py
```

服务器将在 http://localhost:8000 启动

## API 文档

启动服务器后，访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 端点

### 认证 (`/api/v1/auth`)
- `POST /signup` - 用户注册
- `POST /signin` - 用户登录
- `POST /signout` - 用户登出
- `GET /me` - 获取当前用户信息
- `POST /refresh` - 刷新访问令牌

### 行程 (`/api/v1/trips`)
- `POST /plan` - 创建新的旅行计划（AI 生成）
- `GET /` - 获取用户的所有行程
- `GET /{trip_id}` - 获取单个行程详情
- `PUT /{trip_id}` - 更新行程
- `DELETE /{trip_id}` - 删除行程

### 费用 (`/api/v1/expenses`)
- `POST /` - 创建费用记录
- `GET /trip/{trip_id}` - 获取行程的所有费用
- `GET /trip/{trip_id}/summary` - 获取费用统计
- `PUT /{expense_id}` - 更新费用记录
- `DELETE /{expense_id}` - 删除费用记录
- `POST /trip/{trip_id}/analyze` - AI 分析预算使用

## 数据库架构

### Supabase 表结构

#### trips 表
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  budget DECIMAL NOT NULL,
  travelers INTEGER NOT NULL,
  preferences JSONB,
  has_children BOOLEAN DEFAULT FALSE,
  daily_itineraries JSONB,
  accommodations JSONB,
  estimated_costs JSONB,
  total_estimated_cost DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### expenses 表
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 技术栈
- FastAPI - Web 框架
- Supabase - 数据库和认证
- OpenAI - AI 行程规划
- 高德地图 API - 地理位置服务

