# HerBudget Quick Reference Guide

## 🚀 Getting Started

### **Starting the Application**

#### **Option 1: Simple Way (Recommended)**
```powershell
# Open frontend in browser
Invoke-Item "c:\Users\HP\Desktop\HER BUDGET\frontend\index.html"
```

#### **Option 2: Full Stack**
```powershell
# Terminal 1 - Start Backend
cd "c:\Users\HP\Desktop\HER BUDGET\backend"
.\venv\Scripts\Activate.ps1
python main.py

# Terminal 2 - Open Frontend
Invoke-Item "c:\Users\HP\Desktop\HER BUDGET\frontend\index.html"
```

### **Check Backend Status**
```powershell
# Test API
cd "c:\Users\HP\Desktop\HER BUDGET\backend"
.\venv\Scripts\Activate.ps1
python test_api.py
```

---

## 📋 Common Tasks

### **1. Add Income**
```
1. Click "💰 Add Income" card
2. Modal slides up
3. Enter amount (e.g., 2000)
4. Select category (e.g., Salary)
5. Add description
6. Set date
7. Click Save ✓
```

### **2. Add Expense**
```
1. Click "💸 Add Expense" card
2. Enter amount (e.g., 50)
3. Select category (e.g., Food)
4. Add description
5. Set date
6. Click Save ✓
```

### **3. View All Transactions**
```
1. Click "📋 Transactions" in bottom nav
2. OR click "See all" link
3. Scroll through transaction list
4. Use filters to narrow down
```

### **4. Search Transactions**
```
1. Type in search box
2. Results filter automatically
3. Shows matching transactions
4. Click Clear to reset
```

### **5. Filter by Type**
```
1. Open type filter dropdown
2. Select: Income / Expense / All
3. List updates immediately
4. Shows only selected type
```

### **6. Filter by Category**
```
1. Open category filter dropdown
2. Select category name
3. List updates immediately
4. Shows only that category
```

### **7. Edit Transaction**
```
1. Find transaction in list
2. Click ✏️ (Edit button)
3. Modal opens with values
4. Update any field
5. Click Save ✓
```

### **8. Delete Transaction**
```
1. Find transaction in list
2. Click 🗑️ (Delete button)
3. Confirmation dialog
4. Click Delete to confirm
5. Transaction removed ✓
```

### **9. View Analytics**
```
1. Click "📊 Analytics" in bottom nav
2. OR click "📊 Analytics" service card
3. See category spending breakdown
4. View percentages and amounts
```

### **10. View Settings**
```
1. Click "⚙️ Settings" in bottom nav
2. Settings page loads
(Note: Settings page can be customized)
```

---

## 💻 Navigation

### **Bottom Navigation Bar**
```
🏠 Home         → Dashboard view
📋 Transactions → Transaction list
📊 Analytics    → Spending breakdown
⚙️ Settings     → Settings page
```

### **Quick Action Service Cards**
```
💰 Add Income    → Quick add income
💸 Add Expense   → Quick add expense
📊 Analytics     → Jump to analytics
🔍 Search        → Focus search box
```

---

## 🎨 Key Features

### **Dashboard (Home)**
✓ Total balance display  
✓ Income total  
✓ Expense total  
✓ Transaction count  
✓ Recent transactions  
✓ Category breakdown  
✓ Quick action cards  

### **Transactions Page**
✓ Full transaction list  
✓ Filter by type  
✓ Filter by category  
✓ Search by description  
✓ Edit functionality  
✓ Delete with confirmation  
✓ Date sorting  

### **Analytics Page**
✓ Spending by category  
✓ Visual bar charts  
✓ Percentage breakdown  
✓ Amount display  
✓ Color-coded bars  

### **Settings Page**
✓ User preferences  
✓ Customization options  
✓ (Can be extended)  

---

## 📊 Sample Data Included

**Transactions Already Seeded:**
```
1. Salary          +GH₵2,000  (Aug 27)
2. Freelance       +GH₵500    (Aug 25)
3. Electricity     -GH₵100    (Aug 27)
4. Groceries       -GH₵80     (Aug 26)
5. Movie tickets   -GH₵45     (Aug 24)
6. Coffee          -GH₵25     (Aug 24)
7. Taxi            -GH₵30     (Aug 28)
8. Lunch           -GH₵50     (Aug 28)
```

**Dashboard Summary:**
```
Total Balance:   GH₵2,170.00
Total Income:    GH₵2,500.00
Total Expenses:  GH₵330.00
Transactions:    8 total
```

**Spending by Category:**
```
Bills:           30.3% (GH₵100)
Shopping:        24.2% (GH₵80)
Food:            22.7% (GH₵75)
Entertainment:   13.6% (GH₵45)
Transport:        9.1% (GH₵30)
```

---

## 🔧 Available Categories

### **Income Categories**
- Salary
- Allowance
- Freelance
- Business
- Gift
- Other

### **Expense Categories**
- Food
- Transport
- Bills
- Shopping
- Education
- Health
- Entertainment
- Other

---

## 📱 Device Support

### **Mobile (< 480px)**
✓ Vertical layout  
✓ Full-width inputs  
✓ Bottom navigation  
✓ Touch-optimized  
✓ Readable on small screens  

### **Tablet (480px - 768px)**
✓ Adjusted spacing  
✓ Optimized layout  
✓ All features visible  
✓ Comfortable viewing  

### **Desktop (768px+)**
✓ Full layout  
✓ Optimal whitespace  
✓ Side-by-side content  
✓ Enhanced readability  

---

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Navigate elements |
| Enter | Confirm/Submit |
| Escape | Close modal |
| Click | Trigger action |
| Swipe | Mobile navigation |

---

## 🐛 Troubleshooting

### **Backend Not Running**
```powershell
# Check if on correct directory
cd "c:\Users\HP\Desktop\HER BUDGET\backend"

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start server
python main.py

# Should see: "Uvicorn running on http://127.0.0.1:8000"
```

### **Frontend Not Loading**
```
1. Check if backend is running
2. Refresh browser (Ctrl+R)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try opening file directly
5. Check browser console for errors
```

### **API Connection Error**
```
1. Backend must be running
2. Check http://127.0.0.1:8000/docs
3. Verify CORS is enabled
4. Restart backend server
5. Refresh frontend
```

### **Data Not Saving**
```
1. Check browser console for errors
2. Verify database file exists
3. Restart backend server
4. Check network tab in DevTools
5. Run test_api.py to verify API
```

### **Modal Not Opening**
```
1. Refresh the page
2. Check browser console
3. Try a different action
4. Clear browser cache
5. Restart backend
```

---

## 📁 File Structure

```
HER BUDGET/
├── frontend/
│   ├── index.html        (Main HTML file)
│   ├── style.css         (Modern styling)
│   └── script.js         (JavaScript logic)
├── backend/
│   ├── main.py           (FastAPI server)
│   ├── database.py       (Database config)
│   ├── models.py         (SQLAlchemy models)
│   ├── schemas.py        (Pydantic schemas)
│   ├── crud.py           (Database operations)
│   ├── seed.py           (Sample data)
│   ├── test_api.py       (Integration tests)
│   ├── requirements.txt   (Python dependencies)
│   ├── venv/             (Virtual environment)
│   └── .env.example      (Environment vars)
├── README.md             (Full documentation)
├── BUILD_REPORT.md       (Build details)
├── DESIGN_IMPLEMENTATION.md (Design guide)
├── REDESIGN_COMPLETE.md  (Redesign summary)
├── VISUAL_LAYOUT_GUIDE.md (Visual reference)
└── QUICK_REFERENCE.md    (This file)
```

---

## 🌐 API Endpoints

### **Health Check**
```
GET /
Response: {"message": "HerBudget API is running"}
```

### **Dashboard**
```
GET /api/dashboard
Response: {
  "balance": 2170.00,
  "income": 2500.00,
  "expenses": 330.00,
  "transaction_count": 8
}
```

### **Transactions**
```
GET /api/transactions
GET /api/transactions?type=income
GET /api/transactions?category=Food
GET /api/transactions?search=lunch

POST /api/transactions
Body: {
  "type": "expense",
  "amount": 50,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-08-28"
}

PUT /api/transactions/{id}
DELETE /api/transactions/{id}
```

### **Categories**
```
GET /api/categories
Response: {
  "income": [...],
  "expense": [...]
}
```

### **Category Spending**
```
GET /api/dashboard/categories
Response: [
  {"category": "Bills", "amount": 100, "percentage": 30.3},
  ...
]
```

---

## 🔍 Browser DevTools Tips

### **Check API Responses**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action
4. Click on API request
5. View Response in right panel
```

### **Debug JavaScript**
```
1. Open DevTools (F12)
2. Go to Console tab
3. Check for error messages
4. Use console.log for debugging
5. Set breakpoints in Sources tab
```

### **View Component Tree**
```
1. Open DevTools (F12)
2. Go to Elements/Inspector tab
3. Inspect HTML structure
4. View applied CSS styles
5. Check responsive design
```

---

## 💾 Database

### **Database Location**
```
c:\Users\HP\Desktop\HER BUDGET\backend\herbudget.db
```

### **Database Type**
- SQLite (file-based, no server needed)
- Auto-created on first run
- Single file: herbudget.db

### **Clear Database** (Reset Data)
```powershell
# Stop backend first
# Then delete the database file
Remove-Item "c:\Users\HP\Desktop\HER BUDGET\backend\herbudget.db"

# Restart backend (will recreate with sample data)
python main.py
```

---

## 📞 Support Info

### **API Documentation**
```
Interactive Docs: http://127.0.0.1:8000/docs
Alternative Docs: http://127.0.0.1:8000/redoc
```

### **Main Files**
```
Frontend:  c:\Users\HP\Desktop\HER BUDGET\frontend\index.html
Backend:   c:\Users\HP\Desktop\HER BUDGET\backend\main.py
Database:  c:\Users\HP\Desktop\HER BUDGET\backend\herbudget.db
```

---

## ✅ Checklist

Before using, verify:
- [ ] Backend running on http://127.0.0.1:8000
- [ ] Frontend HTML file exists
- [ ] Database file auto-created (herbudget.db)
- [ ] Sample data loaded (8 transactions)
- [ ] All API tests passing (10/10)
- [ ] Browser shows modern design
- [ ] Bottom navigation visible
- [ ] Balance card displaying correctly
- [ ] Add transaction button working
- [ ] Filters functional

---

## 🎉 Quick Status Check

```powershell
# Test all systems
cd "c:\Users\HP\Desktop\HER BUDGET\backend"
.\venv\Scripts\Activate.ps1
python test_api.py

# Should show:
# ✓ Health Check - 200 OK
# ✓ Dashboard - 200 OK
# ✓ Categories - 200 OK
# ✓ Transactions - 200 OK
# ✓ Category Spending - 200 OK
```

---

## 📈 Next Steps

### **To Extend the App:**
1. **Dark Mode**: Toggle CSS variables
2. **Authentication**: Add user login
3. **Cloud Sync**: Connect to backend database
4. **Notifications**: Add reminders
5. **Charts**: Include Chart.js library
6. **Export**: CSV/PDF reports
7. **Recurring**: Automatic transactions
8. **Budgets**: Set and track goals

### **To Customize:**
1. **Colors**: Edit CSS variables in style.css
2. **Categories**: Modify in backend/crud.py
3. **Layout**: Update HTML structure
4. **Logic**: Enhance in script.js
5. **Database**: Add new fields in models.py

---

## 🚀 Production Tips

- Use HTTPS in production
- Add authentication
- Use proper database (PostgreSQL)
- Enable rate limiting
- Add input validation
- Monitor API performance
- Regular database backups
- Update dependencies
- Add logging
- Handle edge cases

---

**HerBudget is ready to use! Open the frontend and start managing your finances with a beautiful, modern interface.** 🎉

