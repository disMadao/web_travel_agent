# 前端应用

AI 智能旅行助手的前端应用，使用 React + TypeScript + Vite 构建。

## 功能特性

- 🎤 **语音输入**：支持语音识别，方便输入旅行需求和费用记录
- 🗺️ **地图展示**：集成高德地图，可视化展示行程路线和景点
- 🤖 **AI 规划**：一键生成个性化旅行计划
- 💰 **费用管理**：记录和管理旅行开销，实时预算分析
- ☁️ **云端同步**：所有数据自动同步到云端
- 📱 **响应式设计**：完美适配各种屏幕尺寸

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example.txt` 为 `.env.local` 文件：

```bash
cp env.example.txt .env.local
```

然后编辑 `.env.local` 文件，填入必要的配置：

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Amap Configuration (高德地图)
VITE_AMAP_KEY=your_amap_web_key
VITE_AMAP_SECURITY_CODE=your_amap_security_code
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 5. 预览生产构建

```bash
npm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── components/       # 可复用组件
│   │   ├── VoiceInput.tsx      # 语音输入组件
│   │   ├── MapView.tsx         # 地图展示组件
│   │   ├── TripCard.tsx        # 行程卡片组件
│   │   └── ExpenseForm.tsx     # 费用表单组件
│   ├── pages/           # 页面组件
│   │   ├── Login.tsx           # 登录页
│   │   ├── SignUp.tsx          # 注册页
│   │   ├── Dashboard.tsx       # 仪表板
│   │   ├── CreateTrip.tsx      # 创建行程
│   │   ├── TripDetail.tsx      # 行程详情
│   │   └── ExpenseManagement.tsx  # 费用管理
│   ├── services/        # 服务层
│   │   ├── api.ts              # API 调用
│   │   └── speechService.ts    # 语音识别服务
│   ├── store/           # 状态管理
│   │   ├── authStore.ts        # 认证状态
│   │   ├── tripStore.ts        # 行程状态
│   │   └── expenseStore.ts     # 费用状态
│   ├── types/           # TypeScript 类型定义
│   │   └── index.ts
│   ├── config/          # 配置文件
│   │   └── index.ts
│   ├── App.tsx          # 应用主组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── public/              # 静态资源
├── index.html           # HTML 模板
├── package.json         # 依赖配置
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── tailwind.config.js   # Tailwind CSS 配置
```

## 主要技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具，提供极速的开发体验
- **React Router** - 路由管理
- **Zustand** - 轻量级状态管理
- **Ant Design** - UI 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Axios** - HTTP 客户端
- **Day.js** - 日期处理
- **高德地图 API** - 地图服务
- **Web Speech API** - 语音识别

## 核心功能说明

### 1. 语音识别

使用 Web Speech API 实现浏览器原生语音识别：

```typescript
import { speechService } from '@/services/speechService'

speechService.start(
  (text) => console.log('识别结果:', text),
  (error) => console.error('识别错误:', error)
)
```

### 2. 地图集成

使用高德地图 JS API 展示行程和景点：

```typescript
<MapView
  attractions={attractions}
  accommodations={accommodations}
  center={[116.397428, 39.90923]}
  zoom={12}
/>
```

### 3. 状态管理

使用 Zustand 进行状态管理：

```typescript
const { user, signIn, signOut } = useAuthStore()
const { trips, createTrip, fetchTrips } = useTripStore()
const { expenses, createExpense } = useExpenseStore()
```

## 浏览器支持

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

**注意**: 语音识别功能需要浏览器支持 Web Speech API，推荐使用 Chrome/Edge。

## 开发建议

1. **代码规范**: 使用 ESLint 保持代码质量
2. **类型安全**: 充分利用 TypeScript 的类型系统
3. **组件复用**: 提取公共组件，提高代码复用性
4. **性能优化**: 使用 React.memo、useMemo、useCallback 优化性能
5. **错误处理**: 妥善处理 API 错误和边界情况

## 常见问题

### Q: 语音识别不工作？
A: 确保使用支持 Web Speech API 的浏览器（如 Chrome），并允许网站访问麦克风权限。

### Q: 地图显示空白？
A: 检查高德地图 API Key 和安全密钥是否配置正确，确保域名在高德控制台中已配置。

### Q: API 请求失败？
A: 确保后端服务已启动，检查 VITE_API_BASE_URL 配置是否正确。

## 许可证

MIT License

