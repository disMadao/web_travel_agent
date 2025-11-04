from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from api import auth, trips, expenses, maps


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Travel Agent API...")
    yield
    # Shutdown
    print("👋 Shutting down Travel Agent API...")


app = FastAPI(
    title="AI Travel Agent API",
    description="智能旅行规划和管理系统 API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.api_prefix}/auth", tags=["认证"])
app.include_router(trips.router, prefix=f"{settings.api_prefix}/trips", tags=["行程"])
app.include_router(expenses.router, prefix=f"{settings.api_prefix}/expenses", tags=["费用"])
app.include_router(maps.router, prefix=f"{settings.api_prefix}/maps", tags=["地图"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Travel Agent API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    # 开发环境配置
    print("=" * 60)
    print("🚀 启动 AI 智能旅行助手 后端服务")
    print("=" * 60)
    print(f"📡 API 文档: http://localhost:8000/docs")
    print(f"🔍 健康检查: http://localhost:8000/health")
    print(f"🌍 环境: {settings.app_env}")
    print(f"🤖 AI 模型: {settings.openai_model}")
    print("=" * 60)
    
    # 根据环境决定是否启用热重载
    is_dev = settings.app_env == "development"
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1" if is_dev else "0.0.0.0",  # 开发环境用 localhost，生产用 0.0.0.0
        port=8000,
        reload=is_dev,  # 只在开发环境启用热重载
        log_level="info"
    )

