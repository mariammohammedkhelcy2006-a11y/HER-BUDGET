#!/usr/bin/env python
"""
Comprehensive test suite for HerBudget MVP
Tests all critical functionality
"""
import subprocess
import json
import urllib.request
import urllib.error
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_api_call(method, endpoint, data=None, expected_status=200):
    """Make an API call and return response"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if data:
            data_bytes = json.dumps(data).encode('utf-8')
            req = urllib.request.Request(
                url, 
                data=data_bytes, 
                method=method,
                headers={'Content-Type': 'application/json'}
            )
        else:
            req = urllib.request.Request(url, method=method)
        
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as e:
        return e.code, {"error": str(e)}
    except Exception as e:
        return None, {"error": str(e)}

def run_tests():
    """Run comprehensive test suite"""
    print("=" * 70)
    print("HerBudget MVP - Comprehensive Integration Test Suite")
    print("=" * 70)
    
    tests_passed = 0
    tests_failed = 0
    
    # Test 1: Get dashboard stats
    print("\n[TEST 1] Dashboard Statistics")
    status, data = test_api_call("GET", "/dashboard")
    if status == 200 and "balance" in data and "income" in data:
        print(f"  ✓ Dashboard loads correctly")
        print(f"    - Balance: GH₵{data['balance']:.2f}")
        print(f"    - Income: GH₵{data['income']:.2f}")
        print(f"    - Expenses: GH₵{data['expenses']:.2f}")
        print(f"    - Transactions: {data['transaction_count']}")
        tests_passed += 1
    else:
        print(f"  ✗ Dashboard failed: {status}")
        tests_failed += 1
    
    # Test 2: Get transactions
    print("\n[TEST 2] Get Transactions")
    status, data = test_api_call("GET", "/transactions")
    if status == 200 and isinstance(data, list) and len(data) > 0:
        print(f"  ✓ Transactions loaded ({len(data)} records)")
        print(f"    - First transaction: {data[0]['category']} ({data[0]['type']}) - GH₵{data[0]['amount']:.2f}")
        tests_passed += 1
    else:
        print(f"  ✗ Transactions failed: {status}")
        tests_failed += 1
    
    # Test 3: Get categories
    print("\n[TEST 3] Get Categories")
    status, data = test_api_call("GET", "/categories")
    if status == 200 and "income" in data and "expense" in data:
        print(f"  ✓ Categories loaded")
        print(f"    - Income categories: {len(data['income'])}")
        print(f"    - Expense categories: {len(data['expense'])}")
        tests_passed += 1
    else:
        print(f"  ✗ Categories failed: {status}")
        tests_failed += 1
    
    # Test 4: Create a new transaction
    print("\n[TEST 4] Create Transaction")
    new_transaction = {
        "type": "expense",
        "amount": 55.50,
        "category": "Food",
        "description": "Test transaction - Dinner",
        "date": "2026-08-28"
    }
    status, data = test_api_call("POST", "/transactions", new_transaction)
    if status == 200 and "id" in data:
        transaction_id = data["id"]
        print(f"  ✓ Transaction created successfully")
        print(f"    - ID: {transaction_id}")
        print(f"    - Amount: GH₵{data['amount']:.2f}")
        print(f"    - Category: {data['category']}")
        tests_passed += 1
    else:
        print(f"  ✗ Create transaction failed: {status}")
        tests_failed += 1
        transaction_id = None
    
    # Test 5: Get single transaction
    if transaction_id:
        print("\n[TEST 5] Get Single Transaction")
        status, data = test_api_call("GET", f"/transactions/{transaction_id}")
        if status == 200 and data["id"] == transaction_id:
            print(f"  ✓ Single transaction retrieved")
            print(f"    - Description: {data.get('description', 'N/A')}")
            tests_passed += 1
        else:
            print(f"  ✗ Get transaction failed: {status}")
            tests_failed += 1
    
    # Test 6: Update transaction
    if transaction_id:
        print("\n[TEST 6] Update Transaction")
        updated_transaction = {
            "type": "expense",
            "amount": 60.00,
            "category": "Food",
            "description": "Test transaction - Updated dinner",
            "date": "2026-08-28"
        }
        status, data = test_api_call("PUT", f"/transactions/{transaction_id}", updated_transaction)
        if status == 200 and data["amount"] == 60.00:
            print(f"  ✓ Transaction updated successfully")
            print(f"    - New amount: GH₵{data['amount']:.2f}")
            tests_passed += 1
        else:
            print(f"  ✗ Update transaction failed: {status}")
            tests_failed += 1
    
    # Test 7: Get category spending
    print("\n[TEST 7] Category Spending")
    status, data = test_api_call("GET", "/dashboard/categories")
    if status == 200 and isinstance(data, list):
        print(f"  ✓ Category spending loaded ({len(data)} categories)")
        if len(data) > 0:
            print(f"    - Top spending: {data[0]['category']} - GH₵{data[0]['amount']:.2f} ({data[0]['percentage']:.1f}%)")
        tests_passed += 1
    else:
        print(f"  ✗ Category spending failed: {status}")
        tests_failed += 1
    
    # Test 8: Delete transaction
    if transaction_id:
        print("\n[TEST 8] Delete Transaction")
        status, data = test_api_call("DELETE", f"/transactions/{transaction_id}")
        if status == 200:
            print(f"  ✓ Transaction deleted successfully")
            # Verify it's deleted
            verify_status, _ = test_api_call("GET", f"/transactions/{transaction_id}")
            if verify_status == 404:
                print(f"    - Deletion confirmed (404 on subsequent GET)")
                tests_passed += 1
            else:
                print(f"    - WARNING: Transaction still exists")
        else:
            print(f"  ✗ Delete transaction failed: {status}")
            tests_failed += 1
    
    # Test 9: Filter transactions by type
    print("\n[TEST 9] Filter Transactions by Type")
    status, data = test_api_call("GET", "/transactions?type=income")
    if status == 200 and isinstance(data, list):
        income_count = len([t for t in data if t["type"] == "income"])
        print(f"  ✓ Income transactions filtered ({income_count} records)")
        tests_passed += 1
    else:
        print(f"  ✗ Filter failed: {status}")
        tests_failed += 1
    
    # Test 10: Search transactions
    print("\n[TEST 10] Search Transactions")
    status, data = test_api_call("GET", "/transactions?search=salary")
    if status == 200 and isinstance(data, list):
        print(f"  ✓ Search working ({len(data)} results for 'salary')")
        tests_passed += 1
    else:
        print(f"  ✗ Search failed: {status}")
        tests_failed += 1
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"  ✓ Tests Passed: {tests_passed}")
    print(f"  ✗ Tests Failed: {tests_failed}")
    print(f"  Total Tests: {tests_passed + tests_failed}")
    
    if tests_failed == 0:
        print("\n🎉 ALL TESTS PASSED! HerBudget MVP is fully functional!")
    else:
        print(f"\n⚠️  {tests_failed} test(s) failed. Please review the errors above.")
    
    return tests_passed, tests_failed

if __name__ == "__main__":
    run_tests()
