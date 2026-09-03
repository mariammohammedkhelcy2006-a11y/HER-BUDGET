"""
Pydantic schemas for request/response validation.
"""
from datetime import date as Date, datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Name must contain at least 2 characters")
        return value


class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool = True

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Name must contain at least 2 characters")
        return value


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)


class TransactionBase(BaseModel):
    """Base transaction schema."""
    type: str = Field(..., description="Transaction type: 'income' or 'expense'")
    amount: float = Field(..., gt=0, description="Transaction amount (must be > 0)")
    category: str = Field(..., min_length=1, max_length=100, description="Transaction category")
    description: Optional[str] = Field(None, max_length=500, description="Optional transaction description")
    date: Date = Field(..., description="Transaction date (YYYY-MM-DD format)")

    @field_validator("type")
    def validate_type(cls, v):
        if v not in ["income", "expense"]:
            raise ValueError("Type must be 'income' or 'expense'")
        return v

    @field_validator("amount")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Category is required")
        return value


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass


class TransactionUpdate(TransactionBase):
    """Schema for updating a transaction."""
    pass


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    """Schema for dashboard statistics."""
    balance: float
    income: float
    expenses: float
    transaction_count: int


class CategorySpending(BaseModel):
    """Schema for category spending data."""
    category: str
    amount: float
    percentage: float


class CategoriesResponse(BaseModel):
    """Schema for available categories."""
    income: list[str]
    expense: list[str]


class BudgetBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    limit_amount: float = Field(..., gt=0)
    month: str = Field(..., pattern=r"^\d{4}-(0[1-9]|1[0-2])$")


class BudgetResponse(BudgetBase):
    id: int

    class Config:
        from_attributes = True


class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(0, ge=0)
    target_date: Optional[Date] = None


class GoalResponse(GoalBase):
    id: int

    class Config:
        from_attributes = True
