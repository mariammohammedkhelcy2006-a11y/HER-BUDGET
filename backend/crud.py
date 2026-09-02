"""
CRUD operations for transactions.
"""
from sqlalchemy.orm import Session

from models import Transaction
from schemas import TransactionCreate, TransactionUpdate


def get_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    transaction_type: str = None,
    category: str = None,
    search: str = None,
    date_filter: str = None
):
    """Get transactions with optional filtering."""
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    if transaction_type and transaction_type != "all":
        query = query.filter(Transaction.type == transaction_type)

    if category and category != "all":
        query = query.filter(Transaction.category == category)

    if search:
        query = query.filter(
            Transaction.description.ilike(f"%{search}%") |
            Transaction.category.ilike(f"%{search}%")
        )

    query = query.order_by(Transaction.date.desc())

    return query.offset(skip).limit(limit).all()


def get_transaction_by_id(db: Session, transaction_id: int, user_id: int):
    """Get a single transaction by ID."""
    return db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id,
    ).first()


def create_transaction(db: Session, transaction: TransactionCreate, user_id: int):
    """Create a new transaction."""
    db_transaction = Transaction(
        user_id=user_id,
        type=transaction.type,
        amount=transaction.amount,
        category=transaction.category,
        description=transaction.description,
        date=transaction.date.isoformat(),
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(db: Session, transaction_id: int, transaction: TransactionUpdate, user_id: int):
    """Update an existing transaction."""
    db_transaction = get_transaction_by_id(db, transaction_id, user_id)
    if db_transaction:
        db_transaction.type = transaction.type
        db_transaction.amount = transaction.amount
        db_transaction.category = transaction.category
        db_transaction.description = transaction.description
        db_transaction.date = transaction.date.isoformat()
        db.commit()
        db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int, user_id: int):
    """Delete a transaction."""
    db_transaction = get_transaction_by_id(db, transaction_id, user_id)
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
    return db_transaction


def get_all_transactions(db: Session, user_id: int):
    """Get all transactions for a user (for calculations)."""
    return db.query(Transaction).filter(Transaction.user_id == user_id).all()


def get_dashboard_stats(db: Session, user_id: int):
    """Calculate dashboard statistics for a user."""
    transactions = get_all_transactions(db, user_id)

    income = sum(t.amount for t in transactions if t.type == "income")
    expenses = sum(t.amount for t in transactions if t.type == "expense")
    balance = income - expenses
    transaction_count = len(transactions)

    return {
        "balance": round(balance, 2),
        "income": round(income, 2),
        "expenses": round(expenses, 2),
        "transaction_count": transaction_count
    }


def get_category_spending(db: Session, user_id: int):
    """Get spending by category for a user."""
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
    ).all()

    category_totals = {}
    for transaction in transactions:
        if transaction.category not in category_totals:
            category_totals[transaction.category] = 0
        category_totals[transaction.category] += transaction.amount

    total = sum(category_totals.values())
    result = []

    for category, amount in category_totals.items():
        percentage = round((amount / total * 100), 2) if total > 0 else 0
        result.append({
            "category": category,
            "amount": round(amount, 2),
            "percentage": percentage
        })

    result.sort(key=lambda x: x["amount"], reverse=True)

    return result
