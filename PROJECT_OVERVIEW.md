# 项目全面概览

## 📁 项目结构

```
web_travel_agent/
├── backend/                    # Python 后端服务
│   ├── api/                   # API 路由层
│   │   ├── auth.py           # 用户认证 (注册/登录/登出)
│   │   ├── trips.py          # 行程管理 (CRUD + AI生成)
│   │   └── expenses.py       # 费用管理 (记录/统计/AI分析)
│   ├── models/               # 数据模型
│   │   └── schemas.py        # Pydantic 模型定义
│   ├── services/             # 业务逻辑层
│   │   ├── ai_service.py     # AI 服务 (DeepSeek/GPT)
│   │   ├── supabase_service.py  # 数据库操作
│   │   └── amap_service.py   # 高德地图服务
│   ├── config.py             # 配置管理
│   ├── main.py               # FastAPI 应用入口
│   ├── requirements.txt      # Python 依赖
│   ├── setup.sh/bat          # 自动设置脚本
│   ├── run.sh/bat            # 启动脚本
│   └── .env                  # 环境变量 (不提交)
│
├── frontend/                  # React 前端应用
│   ├── src/
│   │   ├── components/       # 可复用 UI 组件
│   │   │   ├── VoiceInput.tsx       # 语音输入组件
│   │   │   ├── MapView.tsx          # 地图展示组件
│   │   │   ├── TripCard.tsx         # 行程卡片
│   │   │   └── ExpenseForm.tsx      # 费用表单
│   │   ├── pages/            # 页面组件
│   │   │   ├── Login.tsx            # 登录页
│   │   │   ├── SignUp.tsx           # 注册页
│   │   │   ├── Dashboard.tsx        # 仪表板
│   │   │   ├── CreateTrip.tsx       # 创建行程
│   │   │   ├── TripDetail.tsx       # 行程详情
│   │   │   └── ExpenseManagement.tsx # 费用管理
│   │   ├── services/         # 服务层
│   │   │   ├── api.ts               # API 调用封装
│   │   │   └── speechService.ts     # 语音识别服务
│   │   ├── store/            # 状态管理 (Zustand)
│   │   │   ├── authStore.ts         # 认证状态
│   │   │   ├── tripStore.ts         # 行程状态
│   │   │   └── expenseStore.ts      # 费用状态
│   │   ├── types/            # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── config/           # 配置
│   │   │   └── index.ts
│   │   ├── App.tsx           # 应用主组件
│   │   ├── main.tsx          # 应用入口
│   │   └── index.css         # 全局样式
│   ├── package.json          # Node 依赖
│   ├── vite.config.ts        # Vite 配置
│   ├── tsconfig.json         # TypeScript 配置
│   ├── tailwind.config.js    # Tailwind CSS 配置
│   └── .env.local            # 环境变量 (不提交)
│
├── database/                  # 数据库相关
│   ├── supabase_setup.sql    # 数据库初始化脚本
│   └── README.md             # 数据库文档
│
├── docs/                      # 文档
│   ├── LLM_PROVIDERS.md      # LLM 配置指南
│   ├── PYTHON_VENV.md        # 虚拟环境详解
│   └── CONFIG_GUIDE.md       # 配置系统说明
│
├── .vscode/                   # VSCode 配置 (可选)
│   ├── settings.json         # 编辑器设置
│   └── extensions.json       # 推荐扩展
│
├── .gitignore                # Git 忽略规则
├── README.md                 # 项目说明
├── QUICKSTART.md             # 快速开始
├── SETUP_GUIDE.md            # 完整安装指南
└── PROJECT_OVERVIEW.md       # 本文件
```

---

## 🎯 核心功能流程

### 1. 用户注册/登录

```
用户输入邮箱密码
    ↓
前端: authStore.signIn()
    ↓
后端: /api/v1/auth/signin
    ↓
Supabase Auth 验证
    ↓
返回 JWT Token
    ↓
存储到 localStorage
```

### 2. 创建 AI 行程

```
用户填写需求 (支持语音)
    ↓
前端: tripStore.createTrip()
    ↓
后端: /api/v1/trips/plan
    ↓
ai_service.generate_trip_plan()
    ↓
调用 DeepSeek API
    ↓
AI 返回 JSON 行程
    ↓
保存到 Supabase
    ↓
返回前端展示
```

### 3. 地图可视化

```
获取行程数据
    ↓
提取景点/住宿坐标
    ↓
加载高德地图 SDK
    ↓
添加标记和路线
    ↓
交互式地图展示
```

### 4. 费用管理

```
用户添加费用 (支持语音)
    ↓
前端: expenseStore.createExpense()
    ↓
后端: /api/v1/expenses/
    ↓
保存到 Supabase
    ↓
实时更新统计数据
    ↓
AI 分析预算 (可选)
```

---

## 🔌 API 端点总览

### 认证相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/signup` | 用户注册 |
| POST | `/api/v1/auth/signin` | 用户登录 |
| POST | `/api/v1/auth/signout` | 用户登出 |
| GET  | `/api/v1/auth/me` | 获取当前用户 |
| POST | `/api/v1/auth/refresh` | 刷新 Token |

### 行程相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/trips/plan` | 创建行程 (AI) |
| GET  | `/api/v1/trips/` | 获取行程列表 |
| GET  | `/api/v1/trips/{id}` | 获取行程详情 |
| PUT  | `/api/v1/trips/{id}` | 更新行程 |
| DELETE | `/api/v1/trips/{id}` | 删除行程 |

### 费用相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/expenses/` | 添加费用 |
| GET  | `/api/v1/expenses/trip/{id}` | 获取费用列表 |
| GET  | `/api/v1/expenses/trip/{id}/summary` | 费用统计 |
| PUT  | `/api/v1/expenses/{id}` | 更新费用 |
| DELETE | `/api/v1/expenses/{id}` | 删除费用 |
| POST | `/api/v1/expenses/trip/{id}/analyze` | AI 分析 |

---

## 🗄️ 数据库架构

### trips 表
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL,
  daily_itineraries JSONB,  -- 每日行程
  accommodations JSONB,      -- 住宿信息
  estimated_costs JSONB,     -- 费用预估
  ...
);
```

### expenses 表
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  trip_id UUID REFERENCES trips(id),
  category TEXT,
  amount DECIMAL,
  description TEXT,
  date DATE,
  ...
);
```

---

## 🔧 技术栈详解

### 后端技术
| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.9+ | 开发语言 |
| FastAPI | 0.104+ | Web 框架 |
| Pydantic | 2.5+ | 数据验证 |
| Supabase | 2.3+ | 数据库 + 认证 |
| OpenAI SDK | 1.3+ | LLM 调用 |
| httpx | 0.25+ | HTTP 客户端 |

### 前端技术
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2+ | UI 框架 |
| TypeScript | 5.2+ | 类型安全 |
| Vite | 5.0+ | 构建工具 |
| Ant Design | 5.12+ | UI 组件 |
| Tailwind CSS | 3.3+ | 样式框架 |
| Zustand | 4.4+ | 状态管理 |
| Axios | 1.6+ | HTTP 客户端 |
| 高德地图 | 2.0 | 地图服务 |

---

## 🌟 核心特性实现

### 1. 语音识别 (Web Speech API)

```typescript
// frontend/src/services/speechService.ts
const recognition = new webkitSpeechRecognition();
recognition.lang = 'zh-CN';
recognition.continuous = true;

recognition.onresult = (event) => {
  const text = event.results[0][0].transcript;
  onResult(text);
};

recognition.start();
```

### 2. AI 行程规划 (DeepSeek)

```python
# backend/services/ai_service.py
response = await client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "你是旅行规划师"},
        {"role": "user", "content": prompt}
    ],
    response_format={"type": "json_object"}
)
```

### 3. 地图展示 (高德地图)

```typescript
// frontend/src/components/MapView.tsx
const map = new AMap.Map(container, {
  center: [longitude, latitude],
  zoom: 12
});

// 添加标记
const marker = new AMap.Marker({
  position: [lng, lat],
  title: name
});
map.add(marker);
```

### 4. 状态管理 (Zustand)

```typescript
// frontend/src/store/tripStore.ts
export const useTripStore = create<TripState>((set) => ({
  trips: [],
  createTrip: async (request) => {
    const trip = await apiService.createTripPlan(request);
    set((state) => ({ trips: [trip, ...state.trips] }));
  }
}));
```

---

## 🚀 启动流程

### 完整启动步骤

```bash
# 1. 后端
cd backend
./setup.sh       # 创建虚拟环境 + 安装依赖
cp env.example.txt .env  # 配置环境变量
./run.sh         # 启动服务 (localhost:8000)

# 2. 前端 (新终端)
cd frontend
npm install      # 安装依赖
cp env.example.txt .env.local  # 配置环境变量
npm run dev      # 启动服务 (localhost:5173)

# 3. 数据库
# 在 Supabase Dashboard 执行 database/supabase_setup.sql
```

---

## 📝 环境变量说明

### 后端 (.env)
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhb...

# DeepSeek
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat

# 高德地图
AMAP_API_KEY=xxx

# 应用
SECRET_KEY=random-string
CORS_ORIGINS_STR=["http://localhost:5173"]
```

### 前端 (.env.local)
```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...

# API
VITE_API_BASE_URL=http://localhost:8000/api/v1

# 高德地图
VITE_AMAP_KEY=xxx
VITE_AMAP_SECURITY_CODE=xxx
```

---

## 🐛 调试技巧

### 后端调试
```bash
# 查看日志
python main.py  # 控制台输出

# 使用 pdb 调试
import pdb; pdb.set_trace()

# 查看 API 文档
http://localhost:8000/docs
```

### 前端调试
```bash
# 浏览器控制台
console.log(state)

# React DevTools
# 安装浏览器扩展

# Network 面板
# 查看 API 请求响应
```

### 数据库调试
```sql
-- 在 Supabase SQL Editor 中
SELECT * FROM trips WHERE user_id = 'xxx';
SELECT * FROM expenses WHERE trip_id = 'xxx';
```

---

## 📚 学习资源

### 官方文档
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/docs)
- [DeepSeek](https://platform.deepseek.com/docs)
- [高德地图](https://lbs.amap.com/api/javascript-api/summary)

### 项目文档
- [快速开始](QUICKSTART.md)
- [安装指南](SETUP_GUIDE.md)
- [LLM 配置](docs/LLM_PROVIDERS.md)
- [虚拟环境](docs/PYTHON_VENV.md)
- [配置系统](docs/CONFIG_GUIDE.md)

---

## 🎉 祝你开发愉快！

有问题随时查看文档或提 Issue 💪

