#!/usr/bin/env python
"""
Test script to verify backend API is working
"""
import sys
import subprocess
import time
import urllib.request
import json

print("Testing HerBudget Backend API...")
print("=" * 50)

# Give server a moment to fully start
time.sleep(2)

def test_endpoint(url, description):
    """Test an API endpoint"""
    try:
        with urllib.request.urlopen(url, timeout=3) as response:
            data = json.loads(response.read())
            print(f"✓ {description}")
            print(f"  Status: {response.status}")
            print(f"  Response: {json.dumps(data, indent=2)}")
            return True
    except Exception as e:
        print(f"✗ {description}")
        print(f"  Error: {e}")
        return False

# Test endpoints
base_url = "http://127.0.0.1:8000"

print("\n1. Health Check")
test_endpoint(f"{base_url}/", "GET /")

print("\n2. Dashboard")
test_endpoint(f"{base_url}/api/dashboard", "GET /api/dashboard")

print("\n3. Categories")
test_endpoint(f"{base_url}/api/categories", "GET /api/categories")

print("\n4. Transactions")
test_endpoint(f"{base_url}/api/transactions", "GET /api/transactions")

print("\n5. Category Spending")
test_endpoint(f"{base_url}/api/dashboard/categories", "GET /api/dashboard/categories")

print("\n" + "=" * 50)
print("✓ Backend API tests completed!")
print("\nAPI Documentation available at:")
print(f"  {base_url}/docs")
print(f"  {base_url}/redoc")
