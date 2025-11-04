from supabase import create_client, Client
from config import settings
from typing import Optional, List, Dict, Any
from datetime import datetime
import json


class SupabaseService:
    def __init__(self):
        # 检查配置是否存在
        if not settings.supabase_url or not settings.supabase_key:
            raise ValueError(
                "\n" + "=" * 60 + "\n"
                "❌ Supabase 配置缺失！\n"
                "=" * 60 + "\n"
                "请检查：\n"
                "1. backend/.env 文件是否存在\n"
                "2. 是否配置了以下环境变量：\n"
                "   - SUPABASE_URL\n"
                "   - SUPABASE_KEY\n\n"
                "获取方式：\n"
                "1. 访问 https://supabase.com\n"
                "2. 创建项目\n"
                "3. 在项目设置 -> API 中获取 URL 和 Key\n"
                "4. 填入 backend/.env 文件\n"
                "=" * 60
            )
        
        try:
            self.client: Client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
        except Exception as e:
            raise ValueError(
                f"\n❌ Supabase 连接失败: {str(e)}\n"
                f"请检查 URL 和 Key 是否正确\n"
                f"当前 URL: {settings.supabase_url}\n"
                f"当前 key: {settings.supabase_key}\n"
            )
    
    # 行程相关操作
    async def create_trip(self, trip_data: Dict[str, Any], access_token: str = None) -> Dict[str, Any]:
        """创建新行程"""
        # 将日期和枚举类型转换为字符串
        trip_data_json = self._prepare_trip_data(trip_data)
        
        # 如果提供了 access_token，设置到请求头
        client = self.client
        if access_token:
            client = self.client.auth.set_session(access_token)
        
        response = client.table("trips").insert(trip_data_json).execute()
        return response.data[0] if response.data else None
    
    async def get_trip(self, trip_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """获取单个行程"""
        response = self.client.table("trips").select("*").eq("id", trip_id).eq("user_id", user_id).execute()
        return response.data[0] if response.data else None
    
    async def get_user_trips(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """获取用户的所有行程"""
        response = (
            self.client.table("trips")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return response.data if response.data else []
    
    async def update_trip(self, trip_id: str, user_id: str, trip_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新行程"""
        trip_data_json = self._prepare_trip_data(trip_data)
        trip_data_json["updated_at"] = datetime.utcnow().isoformat()
        
        response = (
            self.client.table("trips")
            .update(trip_data_json)
            .eq("id", trip_id)
            .eq("user_id", user_id)
            .execute()
        )
        return response.data[0] if response.data else None
    
    async def delete_trip(self, trip_id: str, user_id: str) -> bool:
        """删除行程"""
        response = (
            self.client.table("trips")
            .delete()
            .eq("id", trip_id)
            .eq("user_id", user_id)
            .execute()
        )
        return True if response.data else False
    
    # 费用相关操作
    async def create_expense(self, expense_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建费用记录"""
        expense_data["created_at"] = datetime.utcnow().isoformat()
        response = self.client.table("expenses").insert(expense_data).execute()
        return response.data[0] if response.data else None
    
    async def get_trip_expenses(self, trip_id: str, user_id: str) -> List[Dict[str, Any]]:
        """获取行程的所有费用"""
        response = (
            self.client.table("expenses")
            .select("*")
            .eq("trip_id", trip_id)
            .eq("user_id", user_id)
            .order("date", desc=True)
            .execute()
        )
        return response.data if response.data else []
    
    async def update_expense(self, expense_id: str, user_id: str, expense_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新费用记录"""
        response = (
            self.client.table("expenses")
            .update(expense_data)
            .eq("id", expense_id)
            .eq("user_id", user_id)
            .execute()
        )
        return response.data[0] if response.data else None
    
    async def delete_expense(self, expense_id: str, user_id: str) -> bool:
        """删除费用记录"""
        response = (
            self.client.table("expenses")
            .delete()
            .eq("id", expense_id)
            .eq("user_id", user_id)
            .execute()
        )
        return True if response.data else False
    
    # 辅助方法
    def _prepare_trip_data(self, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        """准备行程数据，转换为 JSON 兼容格式"""
        result = {}
        for key, value in trip_data.items():
            if hasattr(value, 'isoformat'):  # datetime or date
                result[key] = value.isoformat()
            elif isinstance(value, (list, dict)):
                result[key] = json.dumps(value) if isinstance(value, list) and len(value) > 0 and hasattr(value[0], '__dict__') else value
            else:
                result[key] = value
        return result


# 单例实例
supabase_service = SupabaseService()

