"""
Database seeding script for initial test data.
Run this script to populate the database with sample transactions.
"""
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Transaction

# Create tables
Base.metadata.create_all(bind=engine)


def seed_database():
    """Insert sample transactions into the database."""
    db = SessionLocal()
    
    # Check if data already exists
    existing = db.query(Transaction).first()
    if existing:
        print("Database already contains data. Skipping seed.")
        db.close()
        return
    
    # Sample transactions
    transactions = [
        # Income
        Transaction(
            type="income",
            amount=2000.00,
            category="Salary",
            description="Monthly salary",
            date="2026-08-27"
        ),
        Transaction(
            type="income",
            amount=500.00,
            category="Freelance",
            description="Web design project",
            date="2026-08-25"
        ),
        # Expenses
        Transaction(
            type="expense",
            amount=50.00,
            category="Food",
            description="Lunch",
            date="2026-08-28"
        ),
        Transaction(
            type="expense",
            amount=30.00,
            category="Transport",
            description="Taxi to work",
            date="2026-08-28"
        ),
        Transaction(
            type="expense",
            amount=100.00,
            category="Bills",
            description="Electricity bill",
            date="2026-08-27"
        ),
        Transaction(
            type="expense",
            amount=80.00,
            category="Shopping",
            description="Groceries",
            date="2026-08-26"
        ),
        Transaction(
            type="expense",
            amount=45.00,
            category="Entertainment",
            description="Movie tickets",
            date="2026-08-24"
        ),
        Transaction(
            type="expense",
            amount=25.00,
            category="Food",
            description="Coffee and breakfast",
            date="2026-08-24"
        ),
    ]
    
    for transaction in transactions:
        db.add(transaction)
    
    db.commit()
    print(f"✓ Successfully seeded database with {len(transactions)} transactions")
    db.close()


if __name__ == "__main__":
    seed_database()
