from pydantic import BaseModel, EmailStr


# --- Request bodies ---

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role_id: int = 2  # Default: COMPANY


class ImpersonateRequest(BaseModel):
    user_id: int

# --- Response bodies ---

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserInfo"


class UserInfo(BaseModel):
    id: int
    email: str
    role_id: int
    role_name: str

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str


class RegisterResponse(BaseModel):
    message: str
    user_id: int


# Resolver referencia forward
TokenResponse.model_rebuild()