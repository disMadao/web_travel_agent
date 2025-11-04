from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from services.supabase_service import supabase_service

router = APIRouter()


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict


@router.post("/signup", response_model=AuthResponse)
async def sign_up(request: SignUpRequest):
    """用户注册"""
    try:
        response = supabase_service.client.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name
                }
            }
        })
        
        # 检查是否成功创建用户
        if not response.user:
            raise HTTPException(status_code=400, detail="注册失败：无法创建用户")
        
        # 检查是否返回了 session（有些配置需要邮箱验证才返回 session）
        if not response.session:
            raise HTTPException(
                status_code=400, 
                detail="注册成功！请检查邮箱并点击确认链接后再登录。"
            )
        
        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user={
                "id": response.user.id,
                "email": response.user.email,
                "full_name": request.full_name
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        # 提供更详细的错误信息
        error_msg = str(e)
        if "already registered" in error_msg.lower():
            raise HTTPException(status_code=400, detail="该邮箱已被注册")
        raise HTTPException(status_code=400, detail=f"注册失败: {error_msg}")


@router.post("/signin", response_model=AuthResponse)
async def sign_in(request: SignInRequest):
    """用户登录"""
    try:
        response = supabase_service.client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not response.user:
            raise HTTPException(status_code=401, detail="登录失败：用户不存在")
        
        if not response.session:
            raise HTTPException(status_code=401, detail="登录失败：请先验证邮箱")
        
        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user={
                "id": response.user.id,
                "email": response.user.email,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "invalid" in error_msg.lower():
            raise HTTPException(status_code=401, detail="邮箱或密码错误")
        raise HTTPException(status_code=401, detail=f"登录失败: {error_msg}")


@router.post("/signout")
async def sign_out(authorization: str = Header(None)):
    """用户登出"""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="未提供有效的认证信息")
        
        token = authorization.replace("Bearer ", "")
        supabase_service.client.auth.sign_out()
        return {"message": "登出成功"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_current_user(authorization: str = Header(None)):
    """获取当前用户信息"""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="未提供有效的认证信息")
        
        token = authorization.replace("Bearer ", "")
        user = supabase_service.client.auth.get_user(token)
        
        if user:
            return {
                "id": user.user.id,
                "email": user.user.email,
                "user_metadata": user.user.user_metadata
            }
        else:
            raise HTTPException(status_code=401, detail="无效的认证信息")
    except Exception as e:
        raise HTTPException(status_code=401, detail="认证失败")


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """刷新访问令牌"""
    try:
        response = supabase_service.client.auth.refresh_session(refresh_token)
        
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="刷新令牌失败")

