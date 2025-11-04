# 快速开始 🚀

这是最简化的启动指南，让您在 5 分钟内运行整个系统。

## 前提条件

- ✅ Node.js 18+
- ✅ Python 3.9+
- ✅ 已注册 Supabase、OpenAI、高德地图账号

## 快速启动

### 1. 后端启动 (2分钟)

```bash
# 进入后端目录
cd backend

# Windows 用户
setup.bat    # 自动设置虚拟环境和依赖
run.bat      # 启动服务

# Mac/Linux 用户
chmod +x setup.sh run.sh
./setup.sh   # 自动设置虚拟环境和依赖
./run.sh     # 启动服务

# 或者手动操作
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
cp env.example.txt .env
# 编辑 .env，填入 API 密钥
python main.py
```

✅ 后端运行在: http://localhost:8000

### 2. 前端启动 (2分钟)

打开新终端：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 复制并编辑环境变量
cp env.example.txt .env.local
# 用编辑器打开 .env.local，填入你的 API 密钥

# 启动前端
npm run dev
```

✅ 前端运行在: http://localhost:5173

### 3. 初始化数据库 (1分钟)

1. 登录 https://supabase.com
2. 进入你的项目
3. 点击 SQL Editor
4. 复制 `database/supabase_setup.sql` 的内容
5. 粘贴并执行

✅ 数据库初始化完成！

## 首次使用

1. 访问 http://localhost:5173
2. 注册账号
3. 点击"创建新行程"
4. 填写信息并生成行程
5. 体验语音输入、地图展示等功能

## 需要的 API 密钥

### Supabase (免费)
- URL: `https://xxx.supabase.co`
- Key: 在项目设置 -> API 中获取

### DeepSeek (推荐，约¥10起)
- Key: 在 https://platform.deepseek.com 获取
- 国内访问快，价格便宜
- 或使用其他模型（OpenAI GPT、通义千问、文心一言等）

### 高德地图 (免费额度充足)
- Web 服务 Key: 用于后端
- JS API Key: 用于前端
- 安全密钥: 用于前端
- 在 https://lbs.amap.com 获取

## 遇到问题？

### 后端无法启动
```bash
# 检查 Python 版本
python --version  # 需要 3.9+

# 重新安装依赖
pip install -r requirements.txt --force-reinstall
```

### 前端无法启动
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### AI 生成失败
- 检查 DeepSeek API Key 是否正确
- 检查账户是否有余额（访问 https://platform.deepseek.com 查看）
- 查看后端控制台错误信息
- 如果网络问题，可切换为其他模型

### 语音识别不工作
- 使用 Chrome 浏览器
- 允许麦克风权限
- 确保在 localhost 环境

## 下一步

- 📖 阅读完整 [安装指南](SETUP_GUIDE.md)
- 📚 查看 [API 文档](http://localhost:8000/docs)
- 🎨 自定义 UI 和功能

祝您使用愉快！ 🎉

