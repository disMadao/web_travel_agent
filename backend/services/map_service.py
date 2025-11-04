"""
地图服务 - 使用高德地图 API（在后端）
"""
import httpx
from typing import List, Dict, Any, Optional, Tuple
from config import settings


class MapService:
    def __init__(self):
        self.api_key = settings.amap_api_key
        if not self.api_key:
            raise ValueError(
                "高德地图 API Key 未配置！\n"
                "请在 backend/.env 文件中设置 AMAP_API_KEY\n"
                "获取地址: https://console.amap.com/dev/key/app"
            )
        self.base_url = "https://restapi.amap.com/v3"
    
    async def geocode(self, address: str, city: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        地理编码：将地址转换为经纬度
        
        Args:
            address: 地址
            city: 城市（可选，提高精确度）
        
        Returns:
            包含经纬度的字典，或 None
        """
        params = {
            "key": self.api_key,
            "address": address,
        }
        if city:
            params["city"] = city
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/geocode/geo", params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") == "1" and data.get("geocodes"):
                    location = data["geocodes"][0]["location"]
                    lng, lat = location.split(",")
                    return {
                        "longitude": float(lng),
                        "latitude": float(lat),
                        "formatted_address": data["geocodes"][0].get("formatted_address", address)
                    }
            except Exception as e:
                print(f"地理编码失败: {e}")
        
        return None
    
    async def reverse_geocode(self, longitude: float, latitude: float) -> Optional[str]:
        """
        逆地理编码：将经纬度转换为地址
        """
        params = {
            "key": self.api_key,
            "location": f"{longitude},{latitude}",
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/geocode/regeo", params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") == "1" and data.get("regeocode"):
                    return data["regeocode"].get("formatted_address")
            except Exception as e:
                print(f"逆地理编码失败: {e}")
        
        return None
    
    async def batch_geocode(self, addresses: List[str], city: Optional[str] = None) -> List[Optional[Dict[str, Any]]]:
        """
        批量地理编码
        """
        results = []
        for address in addresses:
            result = await self.geocode(address, city)
            results.append(result)
        return results
    
    async def search_poi(self, keyword: str, city: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        POI 搜索（景点、餐厅等）
        
        Args:
            keyword: 搜索关键词
            city: 城市
            limit: 返回数量
        
        Returns:
            POI 列表
        """
        params = {
            "key": self.api_key,
            "keywords": keyword,
            "offset": limit,
        }
        if city:
            params["city"] = city
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/place/text", params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") == "1" and data.get("pois"):
                    results = []
                    for poi in data["pois"]:
                        location = poi.get("location", "0,0")
                        lng, lat = location.split(",")
                        results.append({
                            "name": poi.get("name"),
                            "address": poi.get("address"),
                            "longitude": float(lng),
                            "latitude": float(lat),
                            "type": poi.get("type"),
                        })
                    return results
            except Exception as e:
                print(f"POI 搜索失败: {e}")
        
        return []
    
    async def get_route(
        self, 
        origin: Tuple[float, float], 
        destination: Tuple[float, float],
        strategy: int = 0
    ) -> Optional[Dict[str, Any]]:
        """
        路线规划
        
        Args:
            origin: 起点 (longitude, latitude)
            destination: 终点 (longitude, latitude)
            strategy: 路线策略 (0=速度优先, 1=费用优先, 2=距离优先)
        
        Returns:
            路线信息
        """
        params = {
            "key": self.api_key,
            "origin": f"{origin[0]},{origin[1]}",
            "destination": f"{destination[0]},{destination[1]}",
            "strategy": strategy,
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/direction/driving", params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") == "1" and data.get("route"):
                    route = data["route"]["paths"][0]
                    return {
                        "distance": float(route.get("distance", 0)),  # 米
                        "duration": float(route.get("duration", 0)),  # 秒
                        "strategy": route.get("strategy"),
                    }
            except Exception as e:
                print(f"路线规划失败: {e}")
        
        return None


# 单例
map_service = MapService()

