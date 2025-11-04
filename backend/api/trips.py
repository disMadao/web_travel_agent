from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional
from models.schemas import TripPlanRequest, TripPlan, ApiResponse, TripListResponse
from services.supabase_service import supabase_service
from services.ai_service import ai_service
from datetime import datetime
import json

router = APIRouter()


def get_user_id_from_token(authorization: Optional[str]) -> str:
    """从 token 中提取用户 ID"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未提供有效的认证信息")
    
    token = authorization.replace("Bearer ", "")
    try:
        user = supabase_service.client.auth.get_user(token)
        if user and user.user:
            return user.user.id
        raise HTTPException(status_code=401, detail="无效的认证信息")
    except Exception as e:
        raise HTTPException(status_code=401, detail="认证失败")


@router.post("/plan", response_model=TripPlan)
async def create_trip_plan(
    request: TripPlanRequest,
    authorization: str = Header(None)
):
    """
    创建新的旅行计划
    使用 AI 根据用户需求自动生成详细的行程规划
    """
    user_id = get_user_id_from_token(authorization)
    
    try:
        # 使用 AI 生成行程计划
        print("=" * 80)
        print("🤖 开始生成行程计划...")
        print(f"📍 目的地: {request.destination}")
        print(f"📅 日期: {request.start_date} ~ {request.end_date}")
        print(f"💰 预算: ¥{request.budget}")
        print(f"👥 人数: {request.travelers}")
        print("=" * 80)
        
        trip_plan = await ai_service.generate_trip_plan(request, user_id)
        
        # 打印生成的行程计划
        print("\n" + "=" * 80)
        print("✅ 行程计划生成成功！")
        print("=" * 80)
        print(f"📝 标题: {trip_plan.title}")
        print(f"📍 目的地: {trip_plan.destination}")
        print(f"📅 行程天数: {trip_plan.total_days} 天")
        print(f"💰 总预算: ¥{trip_plan.budget}")
        print(f"💵 预估花费: ¥{trip_plan.total_estimated_cost}")
        print("\n📊 费用明细:")
        for category, cost in trip_plan.estimated_costs.items():
            print(f"  - {category}: ¥{cost}")
        
        print(f"\n🗓️ 每日行程 ({len(trip_plan.daily_itineraries)} 天):")
        for day in trip_plan.daily_itineraries:
            print(f"\n  第 {day.day} 天 ({day.date}):")
            print(f"    🎯 景点数量: {len(day.attractions)}")
            for attr in day.attractions:
                print(f"      - {attr.name} (¥{attr.estimated_cost})")
            print(f"    🍽️ 餐厅数量: {len(day.restaurants)}")
            for rest in day.restaurants:
                print(f"      - {rest.name} ({rest.cuisine_type})")
            print(f"    🚗 交通数量: {len(day.transportation)}")
        
        print(f"\n🏨 住宿 ({len(trip_plan.accommodations)} 个):")
        for acc in trip_plan.accommodations:
            print(f"  - {acc.name} ({acc.type}): ¥{acc.estimated_cost}")
        
        print("=" * 80 + "\n")
        
        # 保存到数据库
        trip_data = trip_plan.model_dump(exclude={'id'})  # 排除 id 字段
        trip_data["created_at"] = datetime.utcnow().isoformat()
        trip_data["updated_at"] = datetime.utcnow().isoformat()
        
        # 将复杂对象转换为 JSON 字符串
        trip_data["daily_itineraries"] = json.dumps([d.model_dump() for d in trip_plan.daily_itineraries], default=str, ensure_ascii=False)
        trip_data["accommodations"] = json.dumps([a.model_dump() for a in trip_plan.accommodations], default=str, ensure_ascii=False)
        trip_data["preferences"] = [p.value for p in trip_plan.preferences]
        
        print("💾 正在保存到数据库...")
        saved_trip = await supabase_service.create_trip(trip_data)
        
        if saved_trip:
            trip_plan.id = saved_trip["id"]
            print(f"✅ 保存成功！行程 ID: {saved_trip['id']}\n")
            return trip_plan
        else:
            raise HTTPException(status_code=500, detail="保存行程失败")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成行程失败: {str(e)}")


@router.get("/", response_model=TripListResponse)
async def get_trips(
    authorization: str = Header(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """获取用户的所有旅行计划"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        trips_data = await supabase_service.get_user_trips(user_id, limit, offset)
        
        # 解析 JSON 字段
        trips = []
        for trip_data in trips_data:
            # 解析 JSON 字符串字段
            if isinstance(trip_data.get("daily_itineraries"), str):
                trip_data["daily_itineraries"] = json.loads(trip_data["daily_itineraries"])
            if isinstance(trip_data.get("accommodations"), str):
                trip_data["accommodations"] = json.loads(trip_data["accommodations"])
            
            trips.append(TripPlan(**trip_data))
        
        return TripListResponse(trips=trips, total=len(trips))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取行程列表失败: {str(e)}")


@router.get("/{trip_id}", response_model=TripPlan)
async def get_trip(
    trip_id: str,
    authorization: str = Header(None)
):
    """获取单个旅行计划详情"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        trip_data = await supabase_service.get_trip(trip_id, user_id)
        
        if not trip_data:
            raise HTTPException(status_code=404, detail="行程不存在")
        
        # 解析 JSON 字符串字段
        if isinstance(trip_data.get("daily_itineraries"), str):
            trip_data["daily_itineraries"] = json.loads(trip_data["daily_itineraries"])
        if isinstance(trip_data.get("accommodations"), str):
            trip_data["accommodations"] = json.loads(trip_data["accommodations"])
        
        return TripPlan(**trip_data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取行程失败: {str(e)}")


@router.put("/{trip_id}", response_model=TripPlan)
async def update_trip(
    trip_id: str,
    trip_update: TripPlan,
    authorization: str = Header(None)
):
    """更新旅行计划"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        # 准备更新数据
        update_data = trip_update.model_dump(exclude={"id", "user_id", "created_at"})
        update_data["daily_itineraries"] = json.dumps([d.model_dump() for d in trip_update.daily_itineraries], default=str, ensure_ascii=False)
        update_data["accommodations"] = json.dumps([a.model_dump() for a in trip_update.accommodations], default=str, ensure_ascii=False)
        update_data["preferences"] = [p.value for p in trip_update.preferences]
        
        updated_trip = await supabase_service.update_trip(trip_id, user_id, update_data)
        
        if not updated_trip:
            raise HTTPException(status_code=404, detail="行程不存在或更新失败")
        
        # 解析 JSON 字段
        if isinstance(updated_trip.get("daily_itineraries"), str):
            updated_trip["daily_itineraries"] = json.loads(updated_trip["daily_itineraries"])
        if isinstance(updated_trip.get("accommodations"), str):
            updated_trip["accommodations"] = json.loads(updated_trip["accommodations"])
        
        return TripPlan(**updated_trip)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新行程失败: {str(e)}")


@router.delete("/{trip_id}", response_model=ApiResponse)
async def delete_trip(
    trip_id: str,
    authorization: str = Header(None)
):
    """删除旅行计划"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        success = await supabase_service.delete_trip(trip_id, user_id)
        
        if success:
            return ApiResponse(success=True, message="行程删除成功")
        else:
            raise HTTPException(status_code=404, detail="行程不存在")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除行程失败: {str(e)}")

