# HerBudget Visual Layout Guide

## 📱 Complete Screen Layout

```
╔════════════════════════════════════════════╗
║  👤 Good Evening        🔔  ⚙️            ║  ← Header: Profile + Icons
║  Sarah Mitchell                            ║
╠════════════════════════════════════════════╣
║                                            ║
║        💳  Total Balance                   ║
║                                            ║
║     GH₵ 2,170.00                           ║  ← Balance Card
║                                            ║
║              +                             ║
║          (Add Transaction)                 ║
║                                            ║
╠════════════════════════════════════════════╣
║                                            ║
║  📈 Income     📉 Expenses   # Count       ║  ← Quick Stats
║  GH₵2500       GH₵330        8 trans      ║
║                                            ║
╠════════════════════════════════════════════╣
║                                            ║
║  💰 Add Income    💸 Add Expense           ║  ← Services Grid
║                                            ║  (2x2 layout)
║  📊 Analytics     🔍 Search                ║
║                                            ║
╠════════════════════════════════════════════╣
║                                            ║
║  Filter: [Income ▼] [Category ▼]          ║  ← Filters
║  [Search transactions...                   ║
║                                            ║
╠════════════════════════════════════════════╣
║                                            ║
║  📈 Salary                    GH₵2000      ║  ← Recent
║     Monthly salary (Aug 27)    [✏️] [🗑️]   ║     Transactions
║                                            ║
║  📉 Electricity bill           GH₵100      ║
║     Bills (Aug 27)             [✏️] [🗑️]   ║
║                                            ║
║  📉 Groceries                  GH₵80       ║
║     Shopping (Aug 26)          [✏️] [🗑️]   ║
║                                            ║
║  ► See all 8 transactions                  ║
║                                            ║
╠════════════════════════════════════════════╣
║                                            ║
║  SPENDING BY CATEGORY                      ║  ← Category Chart
║                                            ║
║  Bills:          ████████ 30.3% (GH₵100)  ║
║  Shopping:       ██████ 24.2% (GH₵80)     ║
║  Food:           ██████ 22.7% (GH₵75)     ║
║  Entertainment:  ███ 13.6% (GH₵45)        ║
║  Transport:      ██ 9.1% (GH₵30)          ║
║                                            ║
╠════════════════════════════════════════════╣
║  🏠 Home  │  📋 Transactions  │  📊 Analytics  │  ⚙️ Settings  ║  ← Bottom Nav
╚════════════════════════════════════════════╝

```

---

## 🎨 Color Guide

| Element | Color | Hex Code | Purpose |
|---------|-------|----------|---------|
| Primary | Purple | #8B5CF6 | Brand color, interactive elements |
| Primary Dark | Dark Purple | #6D28D9 | Hover states, deeper engagement |
| Primary Light | Light Purple | #A78BFA | Lighter backgrounds, accents |
| Success | Green | #10B981 | Income, positive indicators |
| Danger | Red | #EF4444 | Expenses, warnings |
| Background | Light Gray | #F3F4F6 | App background |
| Cards | White | #FFFFFF | Content containers |
| Text | Dark Gray | #1F2937 | Main text |
| Text Light | Medium Gray | #6B7280 | Secondary text, labels |
| Border | Light Border | #E5E7EB | Component dividers |

---

## 🔄 Interactive Elements

### **Service Grid Actions**

```
User clicks "💰 Add Income"
    ↓
Modal slides up from bottom
    ↓
Form appears with fields:
  - Type (Income selected)
  - Amount
  - Category (dropdown)
  - Description
  - Date
    ↓
User fills form and clicks Save
    ↓
Modal closes smoothly
    ↓
Toast notification: "Transaction added!"
    ↓
Dashboard updates in real-time
```

### **Bottom Navigation Flow**

```
User taps 📋 Transactions
    ↓
Active state changes to Transactions
    ↓
View scrolls to show all transactions
    ↓
Filters visible at top
    ↓
User taps 📊 Analytics
    ↓
Active state changes to Analytics
    ↓
Category chart section highlighted
```

---

## 📱 Responsive Breakpoints

### **Mobile (< 480px)**
```
┌─────────────────┐
│ Header (smaller)│
├─────────────────┤
│ Balance Card    │
│  (full width)   │
├─────────────────┤
│ Stats (stacked) │
├─────────────────┤
│ Services (2x2)  │
├─────────────────┤
│ Filters & List  │
│   (scrollable)  │
├─────────────────┤
│ Bottom Nav      │
│  (fixed, 70px)  │
└─────────────────┘
```

### **Tablet (480px - 768px)**
```
┌───────────────────────────────┐
│ Header                        │
├───────────────────────────────┤
│  Balance Card (full width)    │
├──────────────┬────────────────┤
│ Stats (3 col)                 │
├──────────────┬────────────────┤
│  Services (2x2 grid)          │
├───────────────────────────────┤
│ Filters                       │
├───────────────────────────────┤
│ Transactions & Category Chart │
├───────────────────────────────┤
│      Bottom Navigation        │
└───────────────────────────────┘
```

### **Desktop (768px+)**
```
┌────────────────────────────────────────────┐
│ Header (full width, larger)                │
├────────────────────────────────────────────┤
│  Balance Card         │ Quick Stats        │
│   (large hero)        │  (3 columns)       │
├────────────────────────────────────────────┤
│ Services Grid (2x2) | Filters             │
├────────────────────────────────────────────┤
│ Recent Transactions  │  Category Chart    │
│    (left side)       │   (right side)     │
├────────────────────────────────────────────┤
│            Bottom Navigation               │
└────────────────────────────────────────────┘
```

---

## 🎭 Component States

### **Balance Card States**

**Default:**
```
┌──────────────────────────┐
│  Total Balance           │
│  GH₵ 2,170.00           │
│        +                │
│ (Currency Selector: GH₵) │
└──────────────────────────┘
```

**Hover:** Card lifts slightly, shadow increases

---

### **Service Card States**

**Default:**
```
┌─────────────┐
│    💰       │
│ Add Income  │
└─────────────┘
```

**Hover:**
```
┌─────────────┐  ↑ Lifted (translateY)
│    💰       │  Shadow increased
│ Add Income  │  Border color changed
└─────────────┘  to purple
```

**Click:** Brief scale animation (0.95x)

---

### **Transaction Item States**

**Default:**
```
┌──────────────────────────────────┐
│ 📈 Salary          GH₵ 2000       │
│    Monthly salary  [✏️] [🗑️]     │
│    Aug 27          (hidden)       │
└──────────────────────────────────┘
```

**Hover:**
```
┌──────────────────────────────────┐
│ 📈 Salary          GH₵ 2000       │  Background slightly darker
│    Monthly salary  [✏️] [🗑️]     │  Edit/Delete visible
│    Aug 27                        │  Shadow increased
└──────────────────────────────────┘
```

---

### **Modal States**

**Closed:** Not visible, off-screen (bottom: -100%)

**Opening:** 
```
Animation: 300ms
Position: bottom: -100% → bottom: 0
Opacity: 0 → 1
```

**Open:**
```
┌──────────────────────────────┐
│ ×                            │
├──────────────────────────────┤
│ Add Transaction              │
│                              │
│ Type: ○ Income ○ Expense    │
│ Amount: [________] GH₵       │
│ Category: [________] ▼       │
│ Description: [________]      │
│ Date: [__/__/____]           │
│                              │
│ [Save] [Cancel]              │
└──────────────────────────────┘
```

**Closing:**
```
Animation: 300ms
Position: bottom: 0 → bottom: -100%
Opacity: 1 → 0
```

---

## ⌨️ Keyboard & Touch Interactions

### **Mobile (Touch)**
- Tap service card → Action triggered
- Tap transaction → Edit modal opens
- Tap bottom nav → Page switches
- Long press transaction → Delete confirmation
- Swipe up modal → Closes

### **Desktop (Keyboard + Mouse)**
- Tab → Navigate between elements
- Enter/Space → Activate buttons
- Escape → Close modals
- Click → Trigger actions
- Hover → Visual feedback

---

## 🎬 Animation Timeline

### **Page Load**
```
0ms   - Header fades in
100ms - Balance card fades in + slides down
200ms - Stats grid fades in
300ms - Services grid fades in
400ms - Filters appear
500ms - Transactions list appears
600ms - Category chart appears
700ms - Bottom nav appears
```

### **Modal Open**
```
0ms   - Backdrop fades in (0 → 0.5 opacity)
0ms   - Modal slides in from bottom (0.3s duration)
300ms - Focus on first input field
```

### **Modal Close**
```
0ms   - Modal slides out to bottom (0.3s duration)
300ms - Backdrop fades out
300ms - Modal removed from DOM
```

### **Transaction Item Hover**
```
0ms   - Card slightly lighter (0.02 opacity increase)
0ms   - Shadow increases (subtle)
0ms   - Action buttons appear (if hidden)
```

---

## 📊 Data Display Examples

### **Dashboard Stats**
```
Income: GH₵2,500.00
Expenses: GH₵330.00
Balance: GH₵2,170.00
Transactions: 8 total
```

### **Transaction Example**
```
Type: Income
Amount: GH₵2,000.00
Category: Salary
Description: Monthly salary
Date: 2026-08-27
```

### **Category Breakdown**
```
Bills:           30.3% (GH₵100.00)
Shopping:        24.2% (GH₵80.00)
Food:            22.7% (GH₵75.00)
Entertainment:   13.6% (GH₵45.00)
Transport:        9.1% (GH₵30.00)
Total Expenses:  GH₵330.00
```

---

## 🌓 Visual Hierarchy

1. **Hero Section** - Balance card (largest, most prominent)
2. **Key Metrics** - Quick stats (secondary importance)
3. **Actions** - Service grid (guides next action)
4. **Content** - Transactions & filters (primary content)
5. **Analytics** - Category breakdown (detailed insights)
6. **Navigation** - Bottom nav (always accessible)

---

## 🎯 User Journey Examples

### **Scenario 1: Adding Income**
```
1. User opens app → Sees balance (GH₵2,170)
2. Clicks "💰 Add Income" service
3. Modal slides up with empty form
4. Selects Income type (auto-selected)
5. Enters amount (e.g., GH₵500)
6. Selects category (e.g., Freelance)
7. Types description (e.g., "Web design project")
8. Sets date
9. Clicks Save
10. Modal closes smoothly
11. Toast: "Income added successfully!"
12. Dashboard updates:
    - Balance now GH₵2,670
    - Income now GH₵3,000
    - Transaction count = 9
13. New transaction appears in list
```

### **Scenario 2: Finding Expenses**
```
1. User taps "📋 Transactions" in bottom nav
2. Filter dropdown opens
3. Selects "Expenses" filter
4. Only expense transactions shown
5. Types "food" in search box
6. Results filtered to food expenses only
7. Finds "Lunch (GH₵50)" and "Coffee (GH₵25)"
```

### **Scenario 3: Viewing Analytics**
```
1. User taps "📊 Analytics" in bottom nav
2. View scrolls to category breakdown
3. Sees visual breakdown of spending:
   - Bills (30.3%)
   - Shopping (24.2%)
   - Food (22.7%)
   - Entertainment (13.6%)
   - Transport (9.1%)
4. Can understand spending patterns at a glance
```

---

## 🔐 Error States

### **API Error**
```
┌──────────────────────────────┐
│ ⚠️ Connection Error          │
│ Failed to load transactions  │
│ Check your internet & retry  │
│         [Retry]              │
└──────────────────────────────┘
```

### **Validation Error**
```
┌──────────────────────────────┐
│ Amount: [__________]          │
│ ⚠️ Please enter a valid       │
│    amount (GH₵ 0.01 or more) │
└──────────────────────────────┘
```

### **Empty State**
```
┌──────────────────────────────┐
│      No transactions         │
│                              │
│  Start by adding your first  │
│  income or expense           │
│                              │
│  [💰 Add Income]             │
└──────────────────────────────┘
```

---

## ✨ Polish Details

- Smooth color transitions on hover
- Rounded corners on all cards (16px)
- Consistent spacing throughout (8px grid)
- Professional shadows for depth
- Gradient backgrounds for visual interest
- Color-coded amounts (green/red)
- Icon-based visual language
- Clear, readable typography
- Adequate touch targets (minimum 40px)
- Loading spinners for async operations
- Success messages for actions

---

**This is the complete visual representation of HerBudget's modern redesigned interface!**
