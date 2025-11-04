from fastapi import APIRouter, HTTPException, Header
from typing import List
from models.schemas import ExpenseCreate, Expense, ExpenseSummary, ApiResponse
from services.supabase_service import supabase_service
from services.ai_service import ai_service
from datetime import datetime
import json

router = APIRouter()


def get_user_id_from_token(authorization: str) -> str:
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


@router.post("/", response_model=Expense)
async def create_expense(
    expense: ExpenseCreate,
    authorization: str = Header(None)
):
    """创建费用记录"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        expense_data = expense.model_dump()
        expense_data["user_id"] = user_id
        expense_data["date"] = expense_data["date"].isoformat()
        
        created_expense = await supabase_service.create_expense(expense_data)
        
        if created_expense:
            return Expense(**created_expense)
        else:
            raise HTTPException(status_code=500, detail="创建费用记录失败")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建费用记录失败: {str(e)}")


@router.get("/trip/{trip_id}", response_model=List[Expense])
async def get_trip_expenses(
    trip_id: str,
    authorization: str = Header(None)
):
    """获取指定行程的所有费用记录"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        expenses_data = await supabase_service.get_trip_expenses(trip_id, user_id)
        
        expenses = [Expense(**exp_data) for exp_data in expenses_data]
        return expenses
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取费用记录失败: {str(e)}")


@router.get("/trip/{trip_id}/summary", response_model=ExpenseSummary)
async def get_expense_summary(
    trip_id: str,
    authorization: str = Header(None)
):
    """获取行程费用统计"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        # 获取行程信息
        trip_data = await supabase_service.get_trip(trip_id, user_id)
        if not trip_data:
            raise HTTPException(status_code=404, detail="行程不存在")
        
        # 获取所有费用记录
        expenses_data = await supabase_service.get_trip_expenses(trip_id, user_id)
        
        # 计算统计数据
        total_spent = sum(exp["amount"] for exp in expenses_data)
        budget = trip_data.get("budget", 0)
        remaining = budget - total_spent
        
        # 按类别统计
        by_category = {}
        for exp in expenses_data:
            category = exp["category"]
            by_category[category] = by_category.get(category, 0) + exp["amount"]
        
        # 计算日均花费
        if isinstance(trip_data.get("total_days"), (int, float)):
            total_days = trip_data["total_days"]
        else:
            total_days = 1
        daily_average = total_spent / max(total_days, 1)
        
        return ExpenseSummary(
            trip_id=trip_id,
            total_spent=total_spent,
            budget=budget,
            remaining=remaining,
            by_category=by_category,
            daily_average=daily_average
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取费用统计失败: {str(e)}")


@router.put("/{expense_id}", response_model=Expense)
async def update_expense(
    expense_id: str,
    expense_update: ExpenseCreate,
    authorization: str = Header(None)
):
    """更新费用记录"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        update_data = expense_update.model_dump()
        update_data["date"] = update_data["date"].isoformat()
        
        updated_expense = await supabase_service.update_expense(expense_id, user_id, update_data)
        
        if not updated_expense:
            raise HTTPException(status_code=404, detail="费用记录不存在或更新失败")
        
        return Expense(**updated_expense)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新费用记录失败: {str(e)}")


@router.delete("/{expense_id}", response_model=ApiResponse)
async def delete_expense(
    expense_id: str,
    authorization: str = Header(None)
):
    """删除费用记录"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        success = await supabase_service.delete_expense(expense_id, user_id)
        
        if success:
            return ApiResponse(success=True, message="费用记录删除成功")
        else:
            raise HTTPException(status_code=404, detail="费用记录不存在")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除费用记录失败: {str(e)}")


@router.post("/trip/{trip_id}/analyze")
async def analyze_trip_budget(
    trip_id: str,
    authorization: str = Header(None)
):
    """AI 分析行程预算使用情况"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        # 获取行程信息
        trip_data = await supabase_service.get_trip(trip_id, user_id)
        if not trip_data:
            raise HTTPException(status_code=404, detail="行程不存在")
        
        # 解析 JSON 字段
        if isinstance(trip_data.get("daily_itineraries"), str):
            trip_data["daily_itineraries"] = json.loads(trip_data["daily_itineraries"])
        if isinstance(trip_data.get("accommodations"), str):
            trip_data["accommodations"] = json.loads(trip_data["accommodations"])
        
        from models.schemas import TripPlan
        trip_plan = TripPlan(**trip_data)
        
        # 获取实际花费
        expenses_data = await supabase_service.get_trip_expenses(trip_id, user_id)
        total_spent = sum(exp["amount"] for exp in expenses_data)
        
        # 使用 AI 分析
        analysis = await ai_service.analyze_budget(trip_plan, total_spent)
        
        return {
            "success": True,
            "data": analysis
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析预算失败: {str(e)}")

