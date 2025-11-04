# LLM 模型提供商配置指南

本项目默认使用 **DeepSeek**，但支持任何兼容 OpenAI API 格式的大语言模型。

## 🚀 DeepSeek（默认推荐）

### 优势
- ✅ **国内访问**：无需代理，速度快
- ✅ **价格低廉**：比 GPT-4 便宜 90%+
- ✅ **中文友好**：针对中文场景优化
- ✅ **性能优秀**：接近 GPT-4 的能力

### 配置方法
```env
OPENAI_API_KEY=sk-xxxxxx  # 在 https://platform.deepseek.com 获取
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

### 价格参考
- **输入**: ¥0.001/千tokens
- **输出**: ¥0.002/千tokens
- 充值 ¥10 可以用很久

---

## 🌍 OpenAI GPT（国际）

### 优势
- 最成熟的模型
- 生态完善
- 多语言支持好

### 配置方法
```env
OPENAI_API_KEY=sk-xxxxxx  # 在 https://platform.openai.com 获取
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4  # 或 gpt-3.5-turbo
```

### 价格参考（GPT-4）
- **输入**: $0.03/千tokens
- **输出**: $0.06/千tokens

### 注意事项
- 需要国际信用卡
- 国内访问可能需要代理
- 相对较贵

---

## 🇨🇳 通义千问（阿里云）

### 优势
- 阿里云服务，稳定可靠
- 国内访问快
- 支持多种模型

### 配置方法
```env
OPENAI_API_KEY=sk-xxxxxx  # 在阿里云百炼获取
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-turbo  # 或 qwen-plus, qwen-max
```

### 获取方式
1. 访问 https://help.aliyun.com/zh/dashscope/
2. 开通百炼服务
3. 创建 API Key

### 价格参考（qwen-turbo）
- **输入**: ¥0.0008/千tokens
- **输出**: ¥0.002/千tokens

---

## 🎯 文心一言（百度）

### 优势
- 百度服务
- 国内访问快
- 中文能力强

### 配置方法
```env
OPENAI_API_KEY=your_access_token
OPENAI_BASE_URL=https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat
OPENAI_MODEL=ernie-bot-turbo
```

### 获取方式
1. 访问 https://console.bce.baidu.com/qianfan/
2. 创建应用获取 API Key 和 Secret Key
3. 使用 Key 换取 Access Token

### 价格参考
- 按调用次数计费
- 有免费额度

---

## 🌟 智谱 AI（ChatGLM）

### 优势
- 清华出品
- 国产开源
- 性价比高

### 配置方法
```env
OPENAI_API_KEY=xxxxxx.xxxxxx  # 在智谱AI获取
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
OPENAI_MODEL=glm-4  # 或 glm-3-turbo
```

### 获取方式
访问 https://open.bigmodel.cn/

### 价格参考（GLM-4）
- **输入**: ¥0.01/千tokens
- **输出**: ¥0.01/千tokens

---

## 🔄 如何切换模型

### 方法一：修改环境变量（推荐）

编辑 `backend/.env` 文件：

```bash
# 从 DeepSeek 切换到 GPT-4
OPENAI_API_KEY=sk-你的GPT4密钥
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

# 重启后端服务即可生效
```

### 方法二：修改配置文件

编辑 `backend/config.py`：

```python
class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"  # 修改这里
    openai_model: str = "gpt-4"  # 修改这里
```

---

## 💡 选择建议

### 个人学习/小项目
**推荐**: DeepSeek 或 通义千问
- 价格便宜
- 国内访问快
- 性能足够

### 商业项目
**推荐**: OpenAI GPT-4 或 DeepSeek
- GPT-4: 最成熟，但贵
- DeepSeek: 性价比高，中文好

### 完全离线/私有化
**推荐**: 本地部署
- 使用 Ollama + Llama 3
- 使用 ChatGLM 本地版本
- 需要修改 `ai_service.py` 适配本地模型

---

## 🔧 高级配置

### 使用代理

如果需要通过代理访问：

```python
# backend/services/ai_service.py
from openai import AsyncOpenAI
import httpx

client = AsyncOpenAI(
    api_key=settings.openai_api_key,
    base_url=settings.openai_base_url,
    http_client=httpx.AsyncClient(
        proxies="http://localhost:7890"  # 你的代理地址
    )
)
```

### 调整超时时间

```python
client = AsyncOpenAI(
    api_key=settings.openai_api_key,
    base_url=settings.openai_base_url,
    timeout=120.0  # 增加超时时间到120秒
)
```

### 调整生成参数

在 `backend/services/ai_service.py` 中：

```python
response = await self.client.chat.completions.create(
    model=settings.openai_model,
    messages=[...],
    temperature=0.7,      # 创意度 (0-2)
    max_tokens=4096,      # 最大生成长度
    top_p=0.9,           # 采样参数
    frequency_penalty=0,  # 频率惩罚
    presence_penalty=0,   # 存在惩罚
)
```

---

## 🐛 故障排除

### 错误: 401 Unauthorized
- 检查 API Key 是否正确
- 检查是否过期或余额不足

### 错误: 404 Not Found
- 检查 `OPENAI_BASE_URL` 是否正确
- 检查模型名称是否正确

### 错误: Timeout
- 增加超时时间
- 检查网络连接
- 考虑使用代理

### 生成结果不理想
- 调整 `temperature` 参数
- 优化 prompt（在 `ai_service.py` 中）
- 尝试更强大的模型

---

## 📊 性能对比

| 模型 | 中文能力 | 价格 | 速度 | 访问 |
|------|----------|------|------|------|
| DeepSeek | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🇨🇳 |
| GPT-4 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 🌍 |
| 通义千问 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🇨🇳 |
| 文心一言 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🇨🇳 |
| GLM-4 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🇨🇳 |

---

## 🔗 相关链接

- [DeepSeek 文档](https://platform.deepseek.com/docs)
- [OpenAI 文档](https://platform.openai.com/docs)
- [通义千问文档](https://help.aliyun.com/zh/dashscope/)
- [文心一言文档](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)
- [智谱AI文档](https://open.bigmodel.cn/dev/api)

