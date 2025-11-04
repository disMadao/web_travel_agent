# Python 虚拟环境使用指南

## 为什么使用虚拟环境？

### 问题场景
假设你的电脑上有多个 Python 项目：
- **项目 A** 需要 FastAPI 0.100.0
- **项目 B** 需要 FastAPI 0.104.1
- **全局安装**会导致版本冲突！

### 虚拟环境的好处
✅ **隔离依赖**：每个项目有独立的依赖包
✅ **避免冲突**：不同项目可以使用不同版本的包
✅ **易于管理**：可以随时删除重建，不影响系统
✅ **团队协作**：确保所有人使用相同的依赖版本
✅ **部署一致**：开发环境和生产环境保持一致

---

## 快速开始

### Windows 用户

```bash
# 1. 自动设置（推荐）
cd backend
setup.bat

# 2. 启动服务
run.bat
```

### Mac/Linux 用户

```bash
# 1. 自动设置（推荐）
cd backend
chmod +x setup.sh run.sh
./setup.sh

# 2. 启动服务
./run.sh
```

---

## 手动操作步骤

### 1. 创建虚拟环境

#### Windows
```bash
cd backend
python -m venv venv
```

#### Mac/Linux
```bash
cd backend
python3 -m venv venv
```

这会创建一个 `venv` 目录，包含：
- `Scripts/` (Windows) 或 `bin/` (Mac/Linux): 可执行文件
- `Lib/` 或 `lib/`: Python 库
- `Include/` 或 `include/`: C 头文件

### 2. 激活虚拟环境

#### Windows
```bash
# PowerShell
venv\Scripts\Activate.ps1

# CMD
venv\Scripts\activate.bat
```

#### Mac/Linux
```bash
source venv/bin/activate
```

**激活成功的标志**：命令行前面会出现 `(venv)`
```bash
(venv) PS D:\code_2\web_travel_agent\backend>
```

### 3. 安装依赖

```bash
# 确保在激活的虚拟环境中
(venv) $ pip install -r requirements.txt
```

### 4. 运行项目

```bash
(venv) $ python main.py
```

### 5. 退出虚拟环境

```bash
(venv) $ deactivate
```

---

## 常用命令

### 查看已安装的包
```bash
(venv) $ pip list
```

### 查看包的详细信息
```bash
(venv) $ pip show fastapi
```

### 升级某个包
```bash
(venv) $ pip install --upgrade fastapi
```

### 导出依赖列表
```bash
(venv) $ pip freeze > requirements.txt
```

### 删除虚拟环境
```bash
# 退出虚拟环境
deactivate

# 直接删除 venv 目录
rm -rf venv  # Mac/Linux
rmdir /s venv  # Windows
```

---

## IDE 配置

### Visual Studio Code

1. 打开命令面板：`Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
2. 输入 "Python: Select Interpreter"
3. 选择 `./venv/Scripts/python.exe` (Windows) 或 `./venv/bin/python` (Mac/Linux)

VSCode 会自动激活虚拟环境！

### PyCharm

1. `File` -> `Settings` -> `Project` -> `Python Interpreter`
2. 点击齿轮图标 -> `Add`
3. 选择 `Existing environment`
4. 选择 `venv/Scripts/python.exe` 或 `venv/bin/python`

---

## 常见问题

### Q1: PowerShell 无法执行脚本？

**错误信息**：
```
无法加载文件 venv\Scripts\Activate.ps1，因为在此系统上禁止运行脚本。
```

**解决方法**：
```powershell
# 以管理员身份运行 PowerShell，执行：
Set-ExecutionPolicy RemoteSigned

# 或者使用 CMD 代替 PowerShell
```

### Q2: 如何确认在虚拟环境中？

```bash
# Windows
where python

# Mac/Linux
which python
```

应该显示虚拟环境的路径，例如：
```
D:\code_2\web_travel_agent\backend\venv\Scripts\python.exe
```

### Q3: 虚拟环境可以移动吗？

❌ **不可以**！虚拟环境包含绝对路径，移动后会失效。

**正确做法**：
1. 导出依赖：`pip freeze > requirements.txt`
2. 在新位置创建新虚拟环境
3. 安装依赖：`pip install -r requirements.txt`

### Q4: 需要提交 venv 到 Git 吗？

❌ **不需要**！

- `.gitignore` 已排除 `venv/`
- 只需提交 `requirements.txt`
- 其他人可以根据 `requirements.txt` 重建虚拟环境

### Q5: 虚拟环境占用多少空间？

一般 **100-500MB**，取决于安装的包数量。

可以随时删除重建，不影响项目代码。

---

## 最佳实践

### ✅ 推荐做法

1. **每个项目一个虚拟环境**
   ```bash
   project1/
     venv/
   project2/
     venv/
   ```

2. **使用 requirements.txt**
   ```bash
   pip freeze > requirements.txt
   pip install -r requirements.txt
   ```

3. **定期更新依赖**
   ```bash
   pip install --upgrade pip
   pip list --outdated
   ```

4. **在虚拟环境中开发**
   - 激活虚拟环境
   - 运行代码
   - 安装新包
   - 退出虚拟环境

### ❌ 避免做法

1. ❌ 全局安装项目依赖
2. ❌ 提交 venv 到 Git
3. ❌ 在多个项目共享虚拟环境
4. ❌ 手动复制虚拟环境文件夹

---

## 高级技巧

### 使用 virtualenvwrapper (可选)

更方便地管理多个虚拟环境：

```bash
# 安装
pip install virtualenvwrapper-win  # Windows
pip install virtualenvwrapper       # Mac/Linux

# 创建虚拟环境
mkvirtualenv myproject

# 切换虚拟环境
workon myproject

# 列出所有虚拟环境
lsvirtualenv

# 删除虚拟环境
rmvirtualenv myproject
```

### 使用 conda (可选)

如果你使用 Anaconda：

```bash
# 创建环境
conda create -n travel_agent python=3.9

# 激活
conda activate travel_agent

# 安装依赖
pip install -r requirements.txt

# 退出
conda deactivate
```

---

## 总结

虚拟环境是 Python 开发的**必备工具**：

| 场景 | 不使用虚拟环境 | 使用虚拟环境 |
|------|---------------|-------------|
| 依赖管理 | 😱 全局混乱 | ✅ 项目隔离 |
| 版本冲突 | 😱 经常出现 | ✅ 完全避免 |
| 团队协作 | 😱 环境不一致 | ✅ 统一环境 |
| 部署生产 | 😱 难以复现 | ✅ 完全一致 |

**记住**：
1. 创建项目 → 创建虚拟环境
2. 开始开发 → 激活虚拟环境
3. 安装依赖 → 记录 requirements.txt
4. 结束开发 → 退出虚拟环境

🎉 现在你已经掌握了 Python 虚拟环境！

