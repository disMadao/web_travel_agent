from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


class TravelPreference(str, Enum):
    FOOD = "food"
    CULTURE = "culture"
    NATURE = "nature"
    SHOPPING = "shopping"
    ADVENTURE = "adventure"
    RELAXATION = "relaxation"
    ANIME = "anime"
    HISTORY = "history"


class AccommodationType(str, Enum):
    HOTEL = "hotel"
    HOSTEL = "hostel"
    APARTMENT = "apartment"
    RESORT = "resort"


class TransportationType(str, Enum):
    FLIGHT = "flight"
    TRAIN = "train"
    BUS = "bus"
    CAR = "car"
    TAXI = "taxi"
    SUBWAY = "subway"
    WALK = "walk"
    BIKE = "bike"


# 行程规划请求
class TripPlanRequest(BaseModel):
    destination: str = Field(..., description="目的地")
    start_date: date = Field(..., description="开始日期")
    end_date: date = Field(..., description="结束日期")
    budget: float = Field(..., gt=0, description="预算（元）")
    travelers: int = Field(default=1, ge=1, description="同行人数")
    preferences: List[TravelPreference] = Field(default=[], description="旅行偏好")
    has_children: bool = Field(default=False, description="是否带孩子")
    additional_notes: Optional[str] = Field(None, description="额外备注")


# 景点信息
class Attraction(BaseModel):
    name: str
    description: str
    address: str
    latitude: float
    longitude: float
    duration: int = Field(..., description="建议游玩时长（分钟）")
    estimated_cost: float = Field(default=0, description="预估费用")
    tips: Optional[str] = None


# 餐厅信息
class Restaurant(BaseModel):
    name: str
    cuisine_type: str
    address: str
    latitude: float
    longitude: float
    estimated_cost: float
    recommendations: Optional[str] = None


# 住宿信息
class Accommodation(BaseModel):
    name: str
    type: AccommodationType
    address: str
    latitude: float
    longitude: float
    check_in: date
    check_out: date
    estimated_cost: float
    facilities: List[str] = []


# 交通信息
class Transportation(BaseModel):
    type: TransportationType
    from_location: str
    to_location: str
    departure_time: Optional[str] = None
    arrival_time: Optional[str] = None
    estimated_cost: float
    notes: Optional[str] = None


# 每日行程
class DailyItinerary(BaseModel):
    day: int
    date: date
    attractions: List[Attraction] = []
    restaurants: List[Restaurant] = []
    transportation: List[Transportation] = []
    notes: Optional[str] = None
    total_cost: float = 0


# 完整行程规划
class TripPlan(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    destination: str
    start_date: date
    end_date: date
    total_days: int
    budget: float
    travelers: int
    preferences: List[TravelPreference]
    has_children: bool
    
    # 行程详情
    daily_itineraries: List[DailyItinerary]
    accommodations: List[Accommodation]
    
    # 费用估算
    estimated_costs: Dict[str, float] = Field(
        default_factory=lambda: {
            "transportation": 0,
            "accommodation": 0,
            "food": 0,
            "attractions": 0,
            "shopping": 0,
            "other": 0
        }
    )
    total_estimated_cost: float = 0
    
    # 元数据
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "日本东京5日游",
                "destination": "东京",
                "start_date": "2024-06-01",
                "end_date": "2024-06-05",
                "budget": 10000,
                "travelers": 2,
                "preferences": ["food", "anime"],
                "has_children": True
            }
        }


# 费用记录
class ExpenseCreate(BaseModel):
    trip_id: str
    category: str = Field(..., description="费用类别")
    amount: float = Field(..., gt=0, description="金额")
    description: str
    date: date
    location: Optional[str] = None
    notes: Optional[str] = None


class Expense(ExpenseCreate):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# 费用统计
class ExpenseSummary(BaseModel):
    trip_id: str
    total_spent: float
    budget: float
    remaining: float
    by_category: Dict[str, float]
    daily_average: float


# 用户相关
class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime


# API 响应
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None


class TripListResponse(BaseModel):
    trips: List[TripPlan]
    total: int

