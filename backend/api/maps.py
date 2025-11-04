"""
地图相关 API
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from services.map_service import map_service
from api.auth import get_current_user

router = APIRouter(prefix="/maps", tags=["maps"])


class GeocodeRequest(BaseModel):
    address: str
    city: Optional[str] = None


class GeocodeResponse(BaseModel):
    longitude: float
    latitude: float
    formatted_address: str


class POISearchRequest(BaseModel):
    keyword: str
    city: Optional[str] = None
    limit: int = 10


class POIResponse(BaseModel):
    name: str
    address: str
    longitude: float
    latitude: float
    type: str


class RouteRequest(BaseModel):
    origin_lng: float
    origin_lat: float
    dest_lng: float
    dest_lat: float
    strategy: int = 0


class RouteResponse(BaseModel):
    distance: float  # 米
    duration: float  # 秒
    strategy: str


@router.post("/geocode", response_model=GeocodeResponse)
async def geocode_address(
    request: GeocodeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    地理编码：地址 -> 经纬度
    """
    result = await map_service.geocode(request.address, request.city)
    if not result:
        raise HTTPException(status_code=404, detail="无法找到该地址的坐标")
    return result


@router.post("/search", response_model=List[POIResponse])
async def search_poi(
    request: POISearchRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    搜索 POI（景点、餐厅等）
    """
    results = await map_service.search_poi(request.keyword, request.city, request.limit)
    return results


@router.post("/route", response_model=RouteResponse)
async def get_route(
    request: RouteRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    路线规划
    """
    result = await map_service.get_route(
        (request.origin_lng, request.origin_lat),
        (request.dest_lng, request.dest_lat),
        request.strategy
    )
    if not result:
        raise HTTPException(status_code=404, detail="无法规划路线")
    return result

