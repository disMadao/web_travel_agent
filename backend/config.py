from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""
    
    # DeepSeek (兼容 OpenAI API 格式)
    # pydantic-settings 会自动从 .env 文件和环境变量加载
    # 支持以下环境变量名：OPENAI_API_KEY 或 openai_api_key
    openai_api_key: str = ""
    openai_base_url: str = "https://api.deepseek.com/v1"
    openai_model: str = "deepseek-chat"
    
    # Amap
    amap_api_key: str = ""
    
    # Application
    app_env: str = "development"
    secret_key: str = "change-this-in-production"
    api_prefix: str = "/api/v1"
    cors_origins_str: str = '["http://localhost:5173", "http://localhost:3000"]'
    
    @property
    def cors_origins(self) -> List[str]:
        try:
            return json.loads(self.cors_origins_str)
        except:
            return ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

