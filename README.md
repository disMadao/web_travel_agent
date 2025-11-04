# AI 智能旅行助手 (Web Travel Agent)

一个基于 AI 的智能旅行规划和管理系统，支持语音输入、智能行程规划、费用管理和实时旅行辅助。

## 功能特点

### 1. 智能行程规划
- 🎤 **语音/文字输入**：支持语音和文字两种输入方式
- 🤖 **AI 自动规划**：根据目的地、日期、预算、偏好自动生成个性化路线
- 🗺️ **地图可视化**：OpenStreetMap 开源地图展示路线和景点
- 📍 **详细信息**：包含交通、住宿、景点、餐厅等完整信息

### 2. 费用预算与管理
- 💰 **智能预算分析**：AI 自动估算各项费用
- 📊 **实时记录**：语音/文字记录旅行开销
- 📈 **预算对比**：实际花费与预算对比分析

### 3. 用户管理与数据存储
- 👤 **注册登录系统**：安全的用户认证
- ☁️ **云端同步**：多设备数据实时同步
- 📱 **多端访问**：Web 端随时随地访问

## 技术栈

### 后端
- **Python 3.9+** - 主要开发语言
- **FastAPI** - 现代化的 Web 框架
- **Supabase** - 数据库和认证服务
- **OpenAI API** - 大语言模型
- **Pydantic** - 数据验证

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Ant Design** - UI 组件库
- **Leaflet + OpenStreetMap** - 开源地图（无需 API key）
- **Web Speech API** - 语音识别

## 快速开始

### 🐳 方式一：Docker 部署（推荐，适合助教和演示）

**只需 Docker，无需安装其他环境！**

```bash
# 1. 配置 API Keys
cp env.template .env
# 编辑 .env，填写你的 API Keys

# 2. 启动
docker-compose up -d

# 3. 访问
# 前端：http://localhost:3000
# 后端：http://localhost:8000/docs
```

📖 详细说明：[Docker 部署指南](DEPLOYMENT.md) | [5分钟快速启动](QUICK_START.md)

---

### 💻 方式二：本地开发环境

#### 环境要求
- Node.js 18+
- Python 3.9+
- npm 或 yarn

### 后端设置

```bash
cd backend

# 方式一：使用自动脚本（推荐）
./setup.sh    # Mac/Linux
setup.bat     # Windows

# 方式二：手动设置
python -m venv venv              # 创建虚拟环境
source venv/bin/activate         # Mac/Linux 激活
venv\Scripts\activate            # Windows 激活
pip install -r requirements.txt  # 安装依赖

# 配置环境变量
cp env.example.txt .env
# 编辑 .env 文件，填入必要的 API 密钥

# 启动服务
python main.py
```

### 前端设置

```bash
cd frontend
npm install
cp .env.example .env.local
# 编辑 .env.local 文件，填入必要的 API 密钥
npm run dev
```

## 配置说明

### 必需的 API 密钥

1. **Supabase**
   - 注册地址：https://supabase.com
   - 获取：URL 和 ANON_KEY

2. **DeepSeek API**（默认）
   - 注册地址：https://platform.deepseek.com
   - 国内访问友好，价格实惠
   - 也可替换为其他兼容 OpenAI 格式的 API（GPT、通义千问、文心一言等）

3. 本来用的高德api的，发现可以直接在前端用OpenStreetMap，坐标数据直接由AI给出，这样会比较简单。后端确实有map_service，但前端没有调用

## 项目结构

```
web_travel_agent/
├── backend/              # Python 后端
│   ├── main.py          # FastAPI 应用入口
│   ├── api/             # API 路由
│   ├── models/          # 数据模型
│   ├── services/        # 业务逻辑
│   └── requirements.txt # Python 依赖
├── frontend/            # React 前端
│   ├── src/
│   │   ├── components/  # UI 组件
│   │   ├── pages/       # 页面
│   │   ├── services/    # API 调用
│   │   └── types/       # TypeScript 类型
│   └── package.json     # Node 依赖
└── README.md
```

## 使用说明

1. **注册/登录**：首次使用需要创建账户
2. **创建行程**：点击"新建行程"，输入旅行需求（支持语音输入）
3. **查看规划**：AI 生成行程后，在地图上查看详细路线
4. **管理费用**：记录实际花费，查看预算分析
5. **同步数据**：所有数据自动云端同步

## 文档

- 📖 [快速开始](QUICKSTART.md) - 5分钟快速上手
- 📚 [完整安装指南](SETUP_GUIDE.md) - 详细的配置说明
- 🤖 [LLM 配置指南](docs/LLM_PROVIDERS.md) - 如何切换不同的 AI 模型
- 🐍 [Python 虚拟环境](docs/PYTHON_VENV.md) - 虚拟环境详细说明
- 🗄️ [数据库文档](database/README.md) - Supabase 配置和使用
- 🎨 [前端文档](frontend/README.md) - 前端开发指南
- 📡 [后端文档](backend/README.md) - API 文档

## 开发计划

- [ ] 多语言支持
- [ ] 实时天气信息
- [ ] 社交分享功能
- [ ] 离线模式
- [ ] 移动端 App

## 许可证

MIT License

