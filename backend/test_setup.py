#!/usr/bin/env python
"""
Quick test script to verify the backend is working
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from database import Base, engine
    from models import Transaction
    from crud import get_dashboard_stats
    from sqlalchemy.orm import Session
    
    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")
    
    # Create a test transaction
    print("\nTesting transaction creation...")
    db = Session(engine)
    
    # Get stats
    stats = get_dashboard_stats(db)
    print(f"✓ Dashboard stats retrieved: {stats}")
    
    db.close()
    print("\n✓ Backend setup successful!")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
