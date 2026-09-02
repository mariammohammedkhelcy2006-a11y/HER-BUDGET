# HerBudget - Personal Finance Management MVP

A simple, modern, and responsive web application for managing personal finances. Track your income and expenses, view your balance, and analyze your spending by category.

## 🎯 Features

✅ **Dashboard**
- View current balance (income - expenses)
- Display total income
- Display total expenses
- Show total transaction count

✅ **Transactions**
- Add income transactions
- Add expense transactions
- Edit existing transactions
- Delete transactions
- View recent transactions
- Search transactions by description or category

✅ **Filtering & Organization**
- Filter by transaction type (income/expense)
- Filter by category
- Search functionality
- Organized transaction list

✅ **Financial Analytics**
- Spending breakdown by category
- Visual category spending chart
- Percentage distribution

✅ **User Interface**
- Clean, modern design
- Fully responsive (desktop, tablet, mobile)
- Intuitive forms and modals
- Real-time updates
- Loading states
- Success/error notifications
- Empty state handling

✅ **Data Management**
- Neon PostgreSQL support through `DATABASE_URL`
- SQLite fallback for local development
- Automatic table creation on startup
- User-scoped transaction data
- Data survives page refresh

✅ **Authentication**
- Account registration and login
- JWT access tokens
- Bcrypt password hashing
- Protected dashboard and transaction endpoints

## 📋 Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP communication

### Backend
- Python 3.8+
- FastAPI
- SQLAlchemy ORM
- Pydantic for validation
- Uvicorn ASGI server

### Database
- Neon PostgreSQL in production via SQLAlchemy and psycopg
- SQLite fallback in local development and tests

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Modern web browser
- Git (optional)

### Installation & Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# On macOS/Linux:
# python3 -m venv venv
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Database Setup

For production, create a project at [Neon](https://neon.tech), open **Connect**, and copy the **pooled** connection string. Store it as `DATABASE_URL` in your hosting provider's secret settings. The URL should include `sslmode=require`; never commit it to this repository.

Copy `backend/.env.example` to `backend/.env` for local configuration and set:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
ENVIRONMENT=production
JWT_SECRET_KEY=<long-random-secret>
ALLOWED_ORIGINS=https://your-frontend.example.com
```

The backend normalizes `postgresql://` and `postgres://` URLs to the psycopg SQLAlchemy driver and enables connection health checks and pooling. Tables are created automatically at startup. For a larger production deployment, replace automatic table creation with a versioned migration tool before changing the schema.

To seed with sample data, use a local SQLite database only:

```bash
python seed.py
```

#### 3. Start Backend Server

```bash
# From backend directory with venv activated
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will start at: `http://127.0.0.1:8000`

API documentation available at: `http://127.0.0.1:8000/docs`

For managed hosting platforms, use this start command:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set the health check path to `/health`. In production, the API docs are disabled and `ALLOWED_ORIGINS` must contain the exact frontend origin.

#### 4. Open Frontend

For local development, the frontend uses `http://127.0.0.1:8000` by default. For a deployed API, define `window.HERBUDGET_API_URL` before loading `script.js` in `frontend/index.html`:

```html
<script>window.HERBUDGET_API_URL = "https://your-api.example.com";</script>
<script src="script.js"></script>
```

```bash
# Open frontend/index.html in your browser
# You can double-click the file or use:
# On Windows: start frontend/index.html
# On macOS: open frontend/index.html
# On Linux: xdg-open frontend/index.html
```

Or serve via simple HTTP server:

```bash
# From project root
cd frontend
python -m http.server 8001
# Then visit http://127.0.0.1:8001
```

## 📁 Project Structure

```
herbudget/
│
├── backend/
│   ├── main.py                 # FastAPI application & routes
│   ├── database.py             # Database configuration
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── crud.py                 # Database operations
│   ├── seed.py                 # Sample data script
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variables template
│   └── herbudget.db            # SQLite database (auto-created)
│
├── frontend/
│   ├── index.html              # HTML structure
│   ├── style.css               # CSS styling
│   └── script.js               # JavaScript logic
│
├── README.md                   # This file
└── .gitignore                  # Git ignore rules
```

## 🔌 API Endpoints

### Health Check
```
GET /
```

### Dashboard
```
GET /api/dashboard
GET /api/dashboard/categories
```

### Transactions
```
GET /api/transactions                    # Get all transactions
GET /api/transactions/{id}               # Get single transaction
POST /api/transactions                   # Create transaction
PUT /api/transactions/{id}               # Update transaction
DELETE /api/transactions/{id}            # Delete transaction
```

### Categories
```
GET /api/categories                      # Get available categories
```

### Query Parameters
```
GET /api/transactions?skip=0&limit=100&type=income&category=Salary&search=term
```

### API Documentation
Interactive API docs at: `http://127.0.0.1:8000/docs`

## 💰 Transaction Structure

```json
{
  "id": 1,
  "type": "income",
  "amount": 2000.00,
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2026-08-27",
  "created_at": "2026-08-28T10:30:00",
  "updated_at": "2026-08-28T10:30:00"
}
```

### Transaction Types
- **income**: Money coming in
- **expense**: Money going out

### Income Categories
- Salary
- Allowance
- Freelance
- Business
- Gift
- Other

### Expense Categories
- Food
- Transport
- Bills
- Shopping
- Education
- Health
- Entertainment
- Other

## 🎨 Color System

| Element | Color | Hex |
|---------|-------|-----|
| Primary | Purple | #8B5CF6 |
| Dark Primary | Dark Purple | #6D28D9 |
| Background | Light Purple | #F8F7FC |
| Cards | White | #FFFFFF |
| Income | Green | #16A34A |
| Expense | Red | #DC2626 |
| Text | Dark Gray | #1F2937 |
| Muted | Gray | #6B7280 |
| Border | Light Gray | #E5E7EB |

## ✨ Usage Examples

### Add Income
1. Click "+ Add Transaction"
2. Select "Income" as type
3. Enter amount
4. Select category (e.g., "Salary")
5. Enter optional description
6. Set date (defaults to today)
7. Click "Save Transaction"

### Add Expense
1. Click "+ Add Transaction"
2. Select "Expense" as type
3. Enter amount
4. Select category (e.g., "Food")
5. Enter optional description
6. Set date
7. Click "Save Transaction"

### Edit Transaction
1. Click "Edit" button on transaction
2. Modify desired fields
3. Click "Save Transaction"

### Delete Transaction
1. Click "Delete" button on transaction
2. Confirm deletion
3. Transaction is removed

### Filter Transactions
- Use "Type" filter for income/expense
- Use "Category" filter by specific category
- Use search box for description/category search

## 🧪 Testing the Application

### Backend API Tests

```bash
# Test health check
curl http://127.0.0.1:8000

# Get dashboard
curl http://127.0.0.1:8000/api/dashboard

# Get categories
curl http://127.0.0.1:8000/api/categories

# Get all transactions
curl http://127.0.0.1:8000/api/transactions

# Create transaction
curl -X POST http://127.0.0.1:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"type":"income","amount":2000,"category":"Salary","description":"Monthly","date":"2026-08-28"}'
```

### Frontend Testing Checklist
- [ ] Dashboard loads with initial stats
- [ ] Add transaction creates new entry
- [ ] Edit transaction updates existing entry
- [ ] Delete transaction removes entry
- [ ] Filters work correctly
- [ ] Search finds transactions
- [ ] Category chart displays correctly
- [ ] Balance updates correctly
- [ ] Income/expense calculations are accurate
- [ ] Page refresh persists data
- [ ] Responsive on mobile
- [ ] Notifications appear and disappear
- [ ] Loading states display

## 🔒 Security Notes

- All input is validated on the backend
- Frontend input is escaped to prevent XSS
- CORS is configured for development
- No sensitive data is exposed
- Use `.env` file for sensitive configuration

## 🐛 Troubleshooting

### Backend won't start
- Verify Python 3.8+ is installed: `python --version`
- Check virtual environment is activated
- Verify all dependencies installed: `pip list`
- Check port 8000 is not in use

### Frontend can't connect to backend
- Verify backend is running: `http://127.0.0.1:8000`
- Check browser console for errors (F12)
- Verify CORS is enabled in main.py
- Check frontend is accessing correct API URL

### No transactions appearing
- Check browser DevTools Network tab
- Verify API endpoint returns data: `/api/transactions`
- Check browser console for JavaScript errors
- Try refreshing the page

### Database issues
- Delete `herbudget.db` to reset database
- Run `seed.py` again to add sample data
- Verify SQLite is accessible

## 📚 API Response Examples

### Dashboard
```json
{
  "balance": 1250.50,
  "income": 3000.00,
  "expenses": 1749.50,
  "transaction_count": 15
}
```

### Transaction Response
```json
{
  "id": 1,
  "type": "expense",
  "amount": 50.00,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-08-28",
  "created_at": "2026-08-28T10:00:00",
  "updated_at": "2026-08-28T10:00:00"
}
```

### Categories Response
```json
{
  "income": ["Salary", "Allowance", "Freelance", "Business", "Gift", "Other"],
  "expense": ["Food", "Transport", "Bills", "Shopping", "Education", "Health", "Entertainment", "Other"]
}
```

## 🚀 Future Enhancements

These features could be added later:
- User authentication and profiles
- Multiple user accounts
- Budget creation and alerts
- Recurring transactions
- Monthly/yearly reports
- Export to CSV
- Dark mode
- Mobile app
- Cloud synchronization
- Transaction categories customization
- Spending goals
- Financial predictions

## 📝 License

This is an open-source MVP project for educational purposes.

## 👥 Support

For issues or questions, check the error messages in the browser console (F12) and backend terminal output.

---

**Version:** 1.0.0  
**Last Updated:** 2026-08-28  
**Status:** MVP - Functional and Ready to Use

## Production deployment

The API now serves the frontend itself, so deploy this repository as one web service.
Use the included `Dockerfile` (it listens on port `8080`) or start the backend with
`uvicorn main:app --host 0.0.0.0 --port $PORT` from the `backend` directory.

Before deploying, copy `backend/.env.example` to the host's secret environment and set:

- `DATABASE_URL` to your Neon PostgreSQL pooled connection string (with `sslmode=require`)
- `ENVIRONMENT=production`
- a unique, long `JWT_SECRET_KEY`
- `ALLOWED_ORIGINS` to your public app URL

Do not deploy the local `backend/.env` or any SQLite database. The application deliberately
refuses to start in production when `DATABASE_URL` is SQLite. After deployment, verify
`https://your-app.example.com/health` returns `{"status":"ok","database":"ok"}`.

### Render + Vercel

1. In Render, create a Blueprint from this repository. It reads `render.yaml` and deploys
   the backend Docker service. Enter the Neon pooled `DATABASE_URL` when prompted.
2. Copy the resulting Render service URL, such as `https://herbudget-api.onrender.com`.
3. In Vercel, import the same repository and add `HERBUDGET_API_URL` with that Render URL
   for Production, Preview, and Development as appropriate. Vercel uses `vercel.json` to
   build the static frontend.
4. Back in Render, set `ALLOWED_ORIGINS` to the Vercel production URL, then redeploy Render.

The Vercel build deliberately fails without `HERBUDGET_API_URL`; this prevents a production
frontend from accidentally sending login and finance requests to its own static domain.
