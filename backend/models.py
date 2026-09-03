"""
SQLAlchemy models for the HerBudget application.
"""
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from database import Base


class User(Base):
    """User model for auth and ownership."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Transaction(Base):
    """Transaction model for income and expense tracking."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, default=1)
    type = Column(String, nullable=False)  # "income" or "expense"
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    date = Column(String, nullable=False)  # Format: YYYY-MM-DD
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    category = Column(String, nullable=False)
    limit_amount = Column(Float, nullable=False)
    month = Column(String, nullable=False)  # YYYY-MM
    created_at = Column(DateTime, server_default=func.now())


class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, nullable=False, default=0)
    target_date = Column(String, nullable=True)  # YYYY-MM-DD
    created_at = Column(DateTime, server_default=func.now())
