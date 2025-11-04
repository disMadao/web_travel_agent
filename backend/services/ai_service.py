from openai import AsyncOpenAI
from config import settings
from models.schemas import TripPlanRequest, TripPlan, DailyItinerary, Attraction, Restaurant, Accommodation, Transportation
from typing import Dict, Any
import json
from datetime import timedelta


class AIService:
    def __init__(self):
        # 检查 API Key 是否配置
        if not settings.openai_api_key:
            raise ValueError(
                "\n" + "=" * 60 + "\n"
                "❌ AI 模型 API Key 缺失！\n"
                "=" * 60 + "\n"
                "请检查：\n"
                "1. backend/.env 文件中是否配置了 OPENAI_API_KEY\n\n"
                "获取方式（DeepSeek）：\n"
                "1. 访问 https://platform.deepseek.com\n"
                "2. 注册并充值（约 ¥10）\n"
                "3. 创建 API Key\n"
                "4. 填入 backend/.env 文件：\n"
                "   OPENAI_API_KEY=sk-your-key\n\n"
                "也可以使用其他模型，详见: docs/LLM_PROVIDERS.md\n"
                "=" * 60
            )
        
        self.client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
    
    async def generate_trip_plan(self, request: TripPlanRequest, user_id: str) -> TripPlan:
        """使用 AI 生成旅行计划"""
        
        # 构建提示词
        prompt = self._build_trip_planning_prompt(request)
        
        # 调用 OpenAI API
        response = await self.client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的旅行规划师，精通全球各地的旅游信息。你需要根据用户的需求，生成详细、实用、个性化的旅行计划。请以 JSON 格式返回结果。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # 解析响应
        ai_response = json.loads(response.choices[0].message.content)
        
        # 构建 TripPlan 对象
        trip_plan = self._build_trip_plan_from_ai_response(ai_response, request, user_id)
        
        return trip_plan
    
    def _build_trip_planning_prompt(self, request: TripPlanRequest) -> str:
        """构建行程规划提示词"""
        days = (request.end_date - request.start_date).days + 1
        preferences_text = "、".join([p.value for p in request.preferences]) if request.preferences else "无特殊偏好"
        children_text = "是" if request.has_children else "否"
        
        prompt = f"""
请为我规划一个详细的旅行计划：

**基本信息：**
- 目的地：{request.destination}
- 旅行时间：{request.start_date} 至 {request.end_date}（共 {days} 天）
- 预算：{request.budget} 元
- 人数：{request.travelers} 人
- 旅行偏好：{preferences_text}
- 是否带孩子：{children_text}
{f"- 额外说明：{request.additional_notes}" if request.additional_notes else ""}

**请提供以下内容：**

1. 每日详细行程（包括景点、餐厅、交通）
2. 住宿推荐（含具体酒店/民宿名称、地址、预估价格）
3. 详细费用预算（交通、住宿、餐饮、景点门票、购物、其他）
4. 实用建议和注意事项

**输出格式要求：**
请严格按照以下 JSON 格式输出：

```json
{{
  "title": "行程标题",
  "daily_itineraries": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "attractions": [
        {{
          "name": "景点名称",
          "description": "景点描述",
          "address": "详细地址",
          "latitude": 纬度（数字）,
          "longitude": 经度（数字）,
          "duration": 游玩时长（分钟）,
          "estimated_cost": 预估费用（元）,
          "tips": "游玩建议"
        }}
      ],
      "restaurants": [
        {{
          "name": "餐厅名称",
          "cuisine_type": "菜系",
          "address": "详细地址",
          "latitude": 纬度,
          "longitude": 经度,
          "estimated_cost": 人均消费,
          "recommendations": "推荐菜品"
        }}
      ],
      "transportation": [
        {{
          "type": "交通方式（flight/train/bus/car/taxi/subway/walk/bike）",
          "from_location": "出发地",
          "to_location": "目的地",
          "departure_time": "出发时间",
          "arrival_time": "到达时间",
          "estimated_cost": 预估费用,
          "notes": "备注"
        }}
      ],
      "notes": "当日行程建议和注意事项"
    }}
  ],
  "accommodations": [
    {{
      "name": "住宿名称",
      "type": "hotel/hostel/apartment/resort",
      "address": "详细地址",
      "latitude": 纬度,
      "longitude": 经度,
      "check_in": "入住日期",
      "check_out": "退房日期",
      "estimated_cost": 总费用,
      "facilities": ["设施1", "设施2"]
    }}
  ],
  "estimated_costs": {{
    "transportation": 交通总费用,
    "accommodation": 住宿总费用,
    "food": 餐饮总费用,
    "attractions": 景点门票总费用,
    "shopping": 购物预算,
    "other": 其他费用
  }}
}}
```

**重要提示：**
- 所有地址必须是真实存在的
- 经纬度要准确（可以是合理的估算值）
- 费用要符合当地实际情况
- 行程安排要合理，考虑交通时间和游玩时长
- 如果带孩子，要推荐适合亲子的景点和餐厅
"""
        return prompt
    
    def _build_trip_plan_from_ai_response(
        self, 
        ai_response: Dict[str, Any], 
        request: TripPlanRequest, 
        user_id: str
    ) -> TripPlan:
        """从 AI 响应构建 TripPlan 对象"""
        
        # 解析每日行程
        daily_itineraries = []
        for day_data in ai_response.get("daily_itineraries", []):
            daily_itineraries.append(DailyItinerary(**day_data))
        
        # 解析住宿
        accommodations = []
        for acc_data in ai_response.get("accommodations", []):
            accommodations.append(Accommodation(**acc_data))
        
        # 计算总费用
        estimated_costs = ai_response.get("estimated_costs", {})
        total_estimated_cost = sum(estimated_costs.values())
        
        # 构建完整行程计划
        trip_plan = TripPlan(
            user_id=user_id,
            title=ai_response.get("title", f"{request.destination} {(request.end_date - request.start_date).days + 1}日游"),
            destination=request.destination,
            start_date=request.start_date,
            end_date=request.end_date,
            total_days=(request.end_date - request.start_date).days + 1,
            budget=request.budget,
            travelers=request.travelers,
            preferences=request.preferences,
            has_children=request.has_children,
            daily_itineraries=daily_itineraries,
            accommodations=accommodations,
            estimated_costs=estimated_costs,
            total_estimated_cost=total_estimated_cost
        )
        
        return trip_plan
    
    async def analyze_budget(self, trip_plan: TripPlan, actual_expenses: float) -> Dict[str, Any]:
        """分析预算使用情况"""
        
        prompt = f"""
请分析以下旅行的预算使用情况：

**原始预算：** {trip_plan.budget} 元
**预估花费：** {trip_plan.total_estimated_cost} 元
**实际花费：** {actual_expenses} 元

**费用明细：**
{json.dumps(trip_plan.estimated_costs, ensure_ascii=False, indent=2)}

请提供：
1. 预算使用分析
2. 各项费用对比
3. 节省或超支建议
4. 后续建议

请以 JSON 格式返回，包含 analysis（分析文本）和 suggestions（建议列表）字段。
"""
        
        response = await self.client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "你是一个专业的旅行预算分析师。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)


# 单例实例
ai_service = AIService()

