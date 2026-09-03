"""
HerBudget FastAPI application.
Main application entry point with all API routes.
"""
import os
from pathlib import Path
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

import crud
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from database import Base, engine, get_db
from models import Budget, SavingsGoal, Transaction, User
from schemas import (
    CategoriesResponse,
    BudgetBase,
    BudgetResponse,
    CategorySpending,
    DashboardResponse,
    GoalBase,
    GoalResponse,
    PasswordChange,
    TokenResponse,
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)

Base.metadata.create_all(bind=engine)

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
IS_PRODUCTION = ENVIRONMENT == "production"

app = FastAPI(
    title="HerBudget API",
    description="A personal finance management API",
    version="1.0.0",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:8001,http://127.0.0.1:8001",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check for hosting platforms, including database connectivity."""
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ok", "database": "ok"}


@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new app user."""
    email = user.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(
        name=user.name.strip(),
        email=email,
        password_hash=get_password_hash(user.password),
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT."""
    found_user = authenticate_user(db, user.email.strip().lower(), user.password)
    if not found_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": found_user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Return the authenticated user profile."""
    return current_user


@app.patch("/api/auth/me", response_model=UserResponse)
def update_current_user(
    update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.name = update.name
    db.commit()
    db.refresh(current_user)
    return current_user


@app.put("/api/auth/password")
def change_password(
    password_change: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not authenticate_user(db, current_user.email, password_change.current_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = get_password_hash(password_change.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard statistics."""
    stats = crud.get_dashboard_stats(db, current_user.id)
    return stats


@app.get("/api/dashboard/categories", response_model=List[CategorySpending])
def get_category_spending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get spending by category."""
    return crud.get_category_spending(db, current_user.id)


@app.get("/api/transactions", response_model=List[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    type: str = None,
    category: str = None,
    search: str = None,
):
    """Get all transactions for the current user with optional filtering."""
    transactions = crud.get_transactions(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        transaction_type=type,
        category=category,
        search=search,
    )
    return transactions


@app.get("/api/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single transaction by ID."""
    transaction = crud.get_transaction_by_id(db, transaction_id, current_user.id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@app.post("/api/transactions", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new transaction for the current user."""
    return crud.create_transaction(db, transaction, current_user.id)


@app.put("/api/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing transaction."""
    updated = crud.update_transaction(db, transaction_id, transaction, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return updated


@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a transaction."""
    deleted = crud.delete_transaction(db, transaction_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully", "id": transaction_id}


@app.get("/api/categories", response_model=CategoriesResponse)
def get_categories():
    """Get available transaction categories."""
    return {
        "income": [
            "Salary",
            "Allowance",
            "Freelance",
            "Business",
            "Gift",
            "Other",
        ],
        "expense": [
            "Food",
            "Transport",
            "Bills",
            "Shopping",
            "Education",
            "Health",
            "Entertainment",
            "Other",
        ],
    }


@app.get("/api/budgets", response_model=List[BudgetResponse])
def get_budgets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Budget).filter(Budget.user_id == current_user.id).order_by(Budget.month.desc()).all()


@app.post("/api/budgets", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(budget: BudgetBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = Budget(user_id=current_user.id, **budget.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.delete("/api/budgets/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(record)
    db.commit()
    return {"message": "Budget deleted"}


@app.get("/api/goals", response_model=List[GoalResponse])
def get_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).order_by(SavingsGoal.created_at.desc()).all()


@app.post("/api/goals", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(goal: GoalBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = goal.model_dump()
    data["target_date"] = data["target_date"].isoformat() if data["target_date"] else None
    record = SavingsGoal(user_id=current_user.id, **data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.delete("/api/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    db.delete(record)
    db.commit()
    return {"message": "Savings goal deleted"}


# Serving the built-in frontend from the API gives deployed browsers a same-origin
# API by default, avoiding a separate frontend URL and CORS configuration.
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
