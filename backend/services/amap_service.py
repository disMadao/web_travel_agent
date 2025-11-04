import httpx
from config import settings
from typing import Dict, Any, List, Optional


class AmapService:
    """高德地图服务"""
    
    def __init__(self):
        self.api_key = settings.amap_api_key
        self.base_url = "https://restapi.amap.com/v3"
    
    async def geocode(self, address: str, city: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """地理编码：地址 -> 坐标"""
        async with httpx.AsyncClient() as client:
            params = {
                "key": self.api_key,
                "address": address,
            }
            if city:
                params["city"] = city
            
            response = await client.get(f"{self.base_url}/geocode/geo", params=params)
            data = response.json()
            
            if data["status"] == "1" and data["geocodes"]:
                location = data["geocodes"][0]["location"].split(",")
                return {
                    "longitude": float(location[0]),
                    "latitude": float(location[1]),
                    "formatted_address": data["geocodes"][0].get("formatted_address", address)
                }
        return None
    
    async def reverse_geocode(self, longitude: float, latitude: float) -> Optional[Dict[str, Any]]:
        """逆地理编码：坐标 -> 地址"""
        async with httpx.AsyncClient() as client:
            params = {
                "key": self.api_key,
                "location": f"{longitude},{latitude}",
            }
            
            response = await client.get(f"{self.base_url}/geocode/regeo", params=params)
            data = response.json()
            
            if data["status"] == "1":
                return {
                    "formatted_address": data["regeocode"]["formatted_address"],
                    "province": data["regeocode"]["addressComponent"]["province"],
                    "city": data["regeocode"]["addressComponent"]["city"],
                    "district": data["regeocode"]["addressComponent"]["district"],
                }
        return None
    
    async def search_place(self, keywords: str, city: Optional[str] = None, types: Optional[str] = None) -> List[Dict[str, Any]]:
        """搜索地点"""
        async with httpx.AsyncClient() as client:
            params = {
                "key": self.api_key,
                "keywords": keywords,
                "output": "json"
            }
            if city:
                params["city"] = city
            if types:
                params["types"] = types
            
            response = await client.get(f"{self.base_url}/place/text", params=params)
            data = response.json()
            
            if data["status"] == "1" and data.get("pois"):
                results = []
                for poi in data["pois"]:
                    location = poi["location"].split(",")
                    results.append({
                        "name": poi["name"],
                        "address": poi.get("address", ""),
                        "longitude": float(location[0]),
                        "latitude": float(location[1]),
                        "type": poi.get("type", ""),
                    })
                return results
        return []
    
    async def calculate_distance(self, origins: List[tuple], destinations: List[tuple]) -> Optional[Dict[str, Any]]:
        """计算距离和时间
        origins: [(lng1, lat1), (lng2, lat2), ...]
        destinations: [(lng1, lat1), (lng2, lat2), ...]
        """
        async with httpx.AsyncClient() as client:
            origins_str = "|".join([f"{lng},{lat}" for lng, lat in origins])
            destinations_str = "|".join([f"{lng},{lat}" for lng, lat in destinations])
            
            params = {
                "key": self.api_key,
                "origins": origins_str,
                "destination": destinations_str,
                "type": "1"  # 驾车
            }
            
            response = await client.get(f"{self.base_url}/distance", params=params)
            data = response.json()
            
            if data["status"] == "1":
                return data["results"]
        return None


# 单例实例
amap_service = AmapService()

