/**
 * HerBudget - Frontend JavaScript Application
 * Handles UI interactions, API communication, and state management
 */

// ============================================
// Configuration
// ============================================

// Use the deployed app's origin by default.  A separate frontend can override
// this with window.HERBUDGET_API_URL before this script loads.
const API_ORIGIN = (window.HERBUDGET_API_URL ||
    (window.location.protocol === 'file:' ? 'http://127.0.0.1:8000' : window.location.origin)
).replace(/\/$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;
const AUTH_BASE_URL = `${API_BASE_URL}/auth`;
const NOTIFICATION_DURATION = 4000; // milliseconds

// ============================================
// State
// ============================================

let currentTransactionId = null;
let transactions = [];
let categories = { income: [], expense: [] };
let currentEditingId = null;
let authMode = 'login';
let authToken = localStorage.getItem('herbudget_token') || null;
let authEventsBound = false;
let currentUser = null;

// ============================================
// DOM Elements
// ============================================

// Buttons
const addTransactionBtn = document.getElementById('addTransactionBtn');
const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const notificationBtn = document.getElementById('notificationBtn');
const settingsBtn = document.getElementById('settingsBtn');
const topLogoutBtn = document.getElementById('topLogoutBtn');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const seeAllLink = document.getElementById('seeAllLink');
const userNameEl = document.getElementById('userName');

// Modal elements
const transactionModal = document.getElementById('transactionModal');
const confirmModal = document.getElementById('confirmModal');
const modalTitle = document.getElementById('modalTitle');

// Form elements
const transactionForm = document.getElementById('transactionForm');
const transactionType = document.getElementById('transactionType');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const description = document.getElementById('description');
const date = document.getElementById('date');

// Display elements
const balanceValue = document.getElementById('balanceValue');
const incomeValue = document.getElementById('incomeValue');
const expenseValue = document.getElementById('expenseValue');
const savingsValue = document.getElementById('savingsValue');
const transactionCountValue = document.getElementById('transactionCountValue');
const transactionsList = document.getElementById('transactionsList');
const emptyState = document.getElementById('emptyState');
const categoryChart = document.getElementById('categoryChart');
const emptyCategories = document.getElementById('emptyCategories');

// Filter elements
const typeFilter = document.getElementById('typeFilter');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');

// Notification
const notification = document.getElementById('notification');

// ============================================
// API Functions
// ============================================

/**
 * Generic API request function
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorData = { detail: 'API error' };
            try {
                errorData = await response.json();
            } catch (err) {
                console.error('Failed to parse error JSON', err);
            }

            if (response.status === 401) {
                logout();
            }

            throw new Error(errorData.detail || 'API error');
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Get dashboard statistics
 */
async function getDashboard() {
    return await apiRequest('/dashboard');
}

/**
 * Get all transactions
 */
async function getTransactions(params = {}) {
    let query = '';
    if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                searchParams.append(key, value);
            }
        });
        query = `?${searchParams.toString()}`;
    }
    return await apiRequest(`/transactions${query}`);
}

/**
 * Create a new transaction
 */
async function createTransaction(data) {
    return await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update an existing transaction
 */
async function updateTransaction(id, data) {
    return await apiRequest(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a transaction
 */
async function deleteTransaction(id) {
    return await apiRequest(`/transactions/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Get available categories
 */
async function getCategories() {
    return await apiRequest('/categories');
}

/**
 * Get category spending
 */
async function getCategorySpending() {
    return await apiRequest('/dashboard/categories');
}

async function getBudgets() { return await apiRequest('/budgets'); }
async function createBudget(data) { return await apiRequest('/budgets', { method: 'POST', body: JSON.stringify(data) }); }
async function deleteBudget(id) { return await apiRequest(`/budgets/${id}`, { method: 'DELETE' }); }
async function getGoals() { return await apiRequest('/goals'); }
async function createGoal(data) { return await apiRequest('/goals', { method: 'POST', body: JSON.stringify(data) }); }
async function deleteGoal(id) { return await apiRequest(`/goals/${id}`, { method: 'DELETE' }); }
async function updateProfile(data) { return await apiRequest('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }); }
async function changePassword(data) { return await apiRequest('/auth/password', { method: 'PUT', body: JSON.stringify(data) }); }

// ============================================
// UI Functions
// ============================================

/**
 * Format currency (GH₵)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'success') {
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, NOTIFICATION_DURATION);
}

function showAuthScreen() {
    const authModal = document.getElementById('authModal');
    const appContainer = document.getElementById('appContainer');
    if (authModal) {
        authModal.classList.add('visible');
        authModal.style.display = 'flex';
    }
    if (appContainer) appContainer.style.display = 'none';
}

function showAppScreen() {
    const authModal = document.getElementById('authModal');
    const appContainer = document.getElementById('appContainer');
    if (authModal) {
        authModal.classList.remove('visible');
        authModal.style.display = 'none';
    }
    if (appContainer) appContainer.style.display = 'flex';
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('herbudget_token');
    authMode = 'login';
    const authNameGroup = document.getElementById('authNameGroup');
    const authSubmitButton = document.querySelector('.auth-submit');
    const authTabs = document.querySelectorAll('.auth-tab');

    if (authNameGroup) authNameGroup.style.display = 'none';
    if (authSubmitButton) authSubmitButton.textContent = 'Login';
    authTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === 'login'));

    showAuthScreen();
    showNotification('You have been logged out.', 'success');
}

function renderPage(page) {
    const dashboardPage = document.getElementById('dashboardPage');
    const secondaryPage = document.getElementById('secondaryPage');
    if (page === 'home') {
        dashboardPage.style.display = 'block';
        secondaryPage.style.display = 'none';
        return;
    }

    dashboardPage.style.display = 'none';
    secondaryPage.style.display = 'block';
    const pageTitles = { transactions: 'Transactions', budgets: 'Budgets', goals: 'Savings goals', analytics: 'Reports', settings: 'Settings' };
    secondaryPage.innerHTML = `<div class="page-title"><p class="eyebrow">HerBudget</p><h2>${pageTitles[page]}</h2></div><div id="pageContent" class="page-content"><div class="loading">Loading...</div></div>`;
    const content = document.getElementById('pageContent');

    if (page === 'transactions') {
        content.innerHTML = `<div class="panel-card"><div class="section-header"><h3>All transactions</h3><button class="btn btn-primary" id="pageAddTransaction">+ Add transaction</button></div>${transactions.length ? `<div class="transactions-list">${transactions.map(t => `<div class="transaction-item"><div class="transaction-left"><div class="transaction-icon">${t.type === 'income' ? '📈' : '📉'}</div><div><strong>${escapeHtml(t.category)}</strong><div class="transaction-date">${t.date}${t.description ? ` · ${escapeHtml(t.description)}` : ''}</div></div></div><div class="transaction-amount ${t.type}">${formatCurrency(t.amount)}</div></div>`).join('')}</div>` : '<p>No transactions yet.</p>'}</div>`;
        document.getElementById('pageAddTransaction').addEventListener('click', () => openTransactionModal());
        return;
    }

    if (page === 'analytics') {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        content.innerHTML = `<div class="report-grid"><div class="panel-card"><p>Total income</p><h3 class="income">${formatCurrency(income)}</h3></div><div class="panel-card"><p>Total expenses</p><h3 class="expense">${formatCurrency(expenses)}</h3></div><div class="panel-card"><p>Net savings</p><h3>${formatCurrency(income - expenses)}</h3></div></div><div class="panel-card"><h3>Spending by category</h3><div id="reportCategories"><div class="loading">Loading report...</div></div></div>`;
        getCategorySpending().then(items => {
            document.getElementById('reportCategories').innerHTML = items.length ? items.map(item => `<div class="category-item"><div class="category-header"><span>${escapeHtml(item.category)}</span><span>${formatCurrency(item.amount)}</span></div><div class="category-bar"><div class="category-fill" style="width:${item.percentage}%">${item.percentage}%</div></div></div>`).join('') : '<p>No expense data yet.</p>';
        });
        return;
    }

    if (page === 'settings') {
        content.innerHTML = `<div class="settings-grid"><form id="profileForm" class="panel-card"><h3>Change profile</h3><label>Full name<input id="profileName" required maxlength="100" value="${escapeHtml(currentUser?.name || '')}"></label><label>Email<input disabled value="${escapeHtml(currentUser?.email || '')}"></label><button class="btn btn-primary" type="submit">Save changes</button></form><form id="passwordForm" class="panel-card"><h3>Reset password</h3><label>Current password<input id="currentPassword" type="password" required></label><label>New password<input id="newPassword" type="password" minlength="8" required></label><button class="btn btn-primary" type="submit">Update password</button></form></div>`;
        document.getElementById('profileForm').addEventListener('submit', async event => { event.preventDefault(); try { currentUser = await updateProfile({ name: document.getElementById('profileName').value }); userNameEl.textContent = currentUser.name; showNotification('Profile updated', 'success'); } catch (error) { showNotification(error.message, 'error'); } });
        document.getElementById('passwordForm').addEventListener('submit', async event => { event.preventDefault(); try { await changePassword({ current_password: document.getElementById('currentPassword').value, new_password: document.getElementById('newPassword').value }); event.currentTarget.reset(); showNotification('Password updated', 'success'); } catch (error) { showNotification(error.message, 'error'); } });
        return;
    }

    const isBudget = page === 'budgets';
    content.innerHTML = `<div class="settings-grid"><form id="planForm" class="panel-card"><h3>Create ${isBudget ? 'budget' : 'savings goal'}</h3><label>${isBudget ? 'Category' : 'Goal name'}<input id="planName" required maxlength="100" placeholder="${isBudget ? 'e.g. Food' : 'e.g. Emergency fund'}"></label><label>${isBudget ? 'Monthly limit (GH₵)' : 'Target amount (GH₵)'}<input id="planAmount" type="number" min="0.01" step="0.01" required></label>${isBudget ? '<label>Month<input id="planDate" type="month" required></label>' : '<label>Target date (optional)<input id="planDate" type="date"></label>'}<button class="btn btn-primary" type="submit">Save</button></form><div class="panel-card"><h3>Your ${isBudget ? 'budgets' : 'goals'}</h3><div id="planList"><div class="loading">Loading...</div></div></div></div>`;
    document.getElementById('planDate').value = isBudget ? new Date().toISOString().slice(0, 7) : '';
    const loadPlans = async () => {
        const records = isBudget ? await getBudgets() : await getGoals();
        document.getElementById('planList').innerHTML = records.length ? records.map(record => {
            const amount = isBudget ? record.limit_amount : record.target_amount;
            const label = isBudget ? `${record.month} · ${escapeHtml(record.category)}` : `${escapeHtml(record.name)}${record.target_date ? ` · ${record.target_date}` : ''}`;
            return `<div class="plan-row"><span>${label}</span><strong>${formatCurrency(amount)}</strong><button class="btn-delete plan-delete" data-id="${record.id}">Delete</button></div>`;
        }).join('') : `<p>No ${isBudget ? 'budgets' : 'goals'} yet.</p>`;
        document.querySelectorAll('.plan-delete').forEach(button => button.addEventListener('click', async () => { await (isBudget ? deleteBudget(button.dataset.id) : deleteGoal(button.dataset.id)); await loadPlans(); showNotification('Deleted', 'success'); }));
    };
    document.getElementById('planForm').addEventListener('submit', async event => { event.preventDefault(); try { const value = Number(document.getElementById('planAmount').value); if (isBudget) await createBudget({ category: document.getElementById('planName').value, limit_amount: value, month: document.getElementById('planDate').value }); else await createGoal({ name: document.getElementById('planName').value, target_amount: value, current_amount: 0, target_date: document.getElementById('planDate').value || null }); event.currentTarget.reset(); await loadPlans(); showNotification('Saved', 'success'); } catch (error) { showNotification(error.message, 'error'); } });
    loadPlans().catch(error => { document.getElementById('planList').textContent = error.message; });
}

/**
 * Open transaction modal
 */
function openTransactionModal(transactionToEdit = null, presetType = '') {
    currentEditingId = transactionToEdit?.id || null;

    if (transactionToEdit) {
        modalTitle.textContent = 'Edit Transaction';
        transactionType.value = transactionToEdit.type;
        amount.value = transactionToEdit.amount;
        category.value = transactionToEdit.category;
        description.value = transactionToEdit.description || '';
        date.value = transactionToEdit.date;
        updateCategoryOptions();
    } else {
        modalTitle.textContent = 'Add Transaction';
        transactionForm.reset();
        const today = new Date().toISOString().split('T')[0];
        date.value = today;

        if (presetType) {
            transactionType.value = presetType;
            updateCategoryOptions();
        }
    }

    transactionModal.style.display = 'flex';
}

/**
 * Close transaction modal
 */
function closeTransactionModal() {
    transactionModal.style.display = 'none';
    currentEditingId = null;
    transactionForm.reset();
}

/**
 * Update category options based on transaction type
 */
function updateCategoryOptions() {
    const selectedType = transactionType.value;
    category.innerHTML = '<option value="">Select category</option>';

    if (selectedType) {
        const availableCategories = categories[selectedType] || [];
        availableCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            category.appendChild(option);
        });
    }
}

/**
 * Render dashboard statistics
 */
async function renderDashboard() {
    try {
        const dashboard = await getDashboard();
        balanceValue.textContent = formatCurrency(dashboard.balance);
        incomeValue.textContent = formatCurrency(dashboard.income);
        expenseValue.textContent = formatCurrency(dashboard.expenses);
        if (savingsValue) savingsValue.textContent = formatCurrency(dashboard.income - dashboard.expenses);
        transactionCountValue.textContent = dashboard.transaction_count;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Failed to load dashboard', 'error');
    }
}

/**
 * Render transactions list
 */
function renderTransactions(transactionsToRender) {
    if (transactionsToRender.length === 0) {
        transactionsList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    transactionsList.innerHTML = transactionsToRender
        .map(trans => `
            <div class="transaction-item">
                <div class="transaction-left">
                    <div class="transaction-icon">${trans.type === 'income' ? '📈' : '📉'}</div>
                    <div class="transaction-details">
                        <div class="transaction-category">${escapeHtml(trans.category)}</div>
                        ${trans.description ? `<div class="transaction-description">${escapeHtml(trans.description)}</div>` : ''}
                        <div class="transaction-date">${trans.date}</div>
                    </div>
                </div>
                <div class="transaction-amount ${trans.type}">${formatCurrency(trans.amount)}</div>
                <div class="transaction-actions">
                    <button class="btn-edit" data-id="${trans.id}">Edit</button>
                    <button class="btn-delete" data-id="${trans.id}">Delete</button>
                </div>
            </div>
        `)
        .join('');

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', handleEditClick);
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
    });
}

/**
 * Render category spending chart
 */
async function renderCategoryChart() {
    try {
        const spending = await getCategorySpending();

        if (spending.length === 0) {
            categoryChart.innerHTML = '';
            emptyCategories.style.display = 'block';
            return;
        }

        emptyCategories.style.display = 'none';

        const maxAmount = Math.max(...spending.map(s => s.amount));
        categoryChart.innerHTML = spending
            .map(item => {
                const percentage = (item.amount / maxAmount) * 100;
                return `
                    <div class="category-item">
                        <div class="category-header">
                            <span class="category-name">${escapeHtml(item.category)}</span>
                            <span class="category-amount">${formatCurrency(item.amount)}</span>
                        </div>
                        <div class="category-bar">
                            <div class="category-fill" style="width: ${percentage}%">
                                ${item.percentage}%
                            </div>
                        </div>
                    </div>
                `;
            })
            .join('');
    } catch (error) {
        console.error('Error loading categories:', error);
        categoryChart.innerHTML = '<p style="color: var(--text-muted);">Failed to load category data</p>';
    }
}

/**
 * Load all transactions
 */
async function loadTransactions() {
    try {
        transactionsList.innerHTML = '<div class="loading">Loading transactions...</div>';
        transactions = await getTransactions();
        applyFiltersAndSearch();
    } catch (error) {
        console.error('Error loading transactions:', error);
        showNotification('Failed to load transactions', 'error');
        transactionsList.innerHTML = '<div style="color: var(--text-muted); padding: var(--spacing-lg);">Error loading transactions</div>';
    }
}

/**
 * Load categories
 */
async function loadCategories() {
    try {
        categories = await getCategories();
        // Update category filter
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        [...categories.expense, ...categories.income].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Apply filters and search
 */
function applyFiltersAndSearch() {
    const type = typeFilter.value;
    const cat = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = transactions.filter(trans => {
        const typeMatch = !type || trans.type === type;
        const categoryMatch = !cat || trans.category === cat;
        const searchMatch = !searchTerm ||
            trans.category.toLowerCase().includes(searchTerm) ||
            (trans.description && trans.description.toLowerCase().includes(searchTerm));
        return typeMatch && categoryMatch && searchMatch;
    });

    renderTransactions(filtered);
}

/**
 * Refresh all data
 */
async function refreshAllData() {
    await Promise.all([
        renderDashboard(),
        loadTransactions(),
        renderCategoryChart(),
    ]);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Event Handlers
// ============================================

/**
 * Set the greeting and user name for the header
 */
function setUserGreeting() {
    const greetingEl = document.querySelector('.greeting');
    const now = new Date();
    const hour = now.getHours();

    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    if (greetingEl) greetingEl.textContent = greeting;
    if (userNameEl && currentUser?.name) userNameEl.textContent = currentUser.name;
}

/**
 * Handle quick-action items from the services grid
 */
function handleQuickAction(action) {
    switch (action) {
        case 'add-income':
            openTransactionModal(null, 'income');
            break;
        case 'add-expense':
            openTransactionModal(null, 'expense');
            break;
        case 'view-analytics':
            document.querySelector('.category-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            showNotification('Analytics opened', 'success');
            break;
        case 'filter':
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showNotification('Search ready', 'success');
            break;
        default:
            break;
    }
}

/**
 * Handle add/edit form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        type: transactionType.value,
        amount: parseFloat(amount.value),
        category: category.value,
        description: description.value || null,
        date: date.value,
    };

    if (!formData.type || !formData.category || !formData.date || !formData.amount || formData.amount <= 0) {
        showNotification('Please complete all required fields', 'error');
        return;
    }

    try {
        if (currentEditingId) {
            await updateTransaction(currentEditingId, formData);
            showNotification('Transaction updated successfully', 'success');
        } else {
            await createTransaction(formData);
            showNotification('Transaction added successfully', 'success');
        }

        closeTransactionModal();
        await refreshAllData();
    } catch (error) {
        console.error('Error saving transaction:', error);
        showNotification(error.message || 'Failed to save transaction', 'error');
    }
}

/**
 * Handle edit button click
 */
async function handleEditClick(e) {
    const id = parseInt(e.target.dataset.id);
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        openTransactionModal(transaction);
    }
}

/**
 * Handle delete button click
 */
function handleDeleteClick(e) {
    currentTransactionId = parseInt(e.target.dataset.id);
    confirmModal.style.display = 'flex';
}

/**
 * Confirm delete action
 */
async function handleConfirmDelete() {
    try {
        await deleteTransaction(currentTransactionId);
        showNotification('Transaction deleted successfully', 'success');
        confirmModal.style.display = 'none';
        await refreshAllData();
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showNotification('Failed to delete transaction', 'error');
    }
}

/**
 * Handle transaction type change
 */
transactionType.addEventListener('change', updateCategoryOptions);

// ============================================
// Event Listeners
// ============================================

addTransactionBtn.addEventListener('click', () => openTransactionModal());
emptyStateAddBtn.addEventListener('click', () => openTransactionModal());
closeModalBtn.addEventListener('click', closeTransactionModal);
cancelBtn.addEventListener('click', closeTransactionModal);
transactionForm.addEventListener('submit', handleFormSubmit);
notificationBtn.addEventListener('click', () => showNotification('Notifications are enabled', 'success'));
settingsBtn.addEventListener('click', () => showNotification('Settings panel coming soon', 'warning'));
topLogoutBtn.addEventListener('click', logout);
forgotPasswordLink.addEventListener('click', () => showNotification('Sign in, then open Settings to reset your password.', 'warning'));
seeAllLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.transactions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    searchInput.focus();
});

document.querySelectorAll('.service-item').forEach(item => {
    item.addEventListener('click', () => handleQuickAction(item.dataset.action));
});

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault();
        document.querySelectorAll('.nav-item').forEach(navItem => navItem.classList.toggle('active', navItem === item));
        renderPage(item.dataset.page);
    });
});

document.getElementById('logoutBtn').addEventListener('click', logout);

confirmCancelBtn.addEventListener('click', () => {
    confirmModal.style.display = 'none';
});
confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

typeFilter.addEventListener('change', applyFiltersAndSearch);
categoryFilter.addEventListener('change', applyFiltersAndSearch);
searchInput.addEventListener('input', applyFiltersAndSearch);

// Close modal when clicking outside
transactionModal.addEventListener('click', (e) => {
    if (e.target === transactionModal) {
        closeTransactionModal();
    }
});

confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.style.display = 'none';
    }
});

// ============================================
// Initialization
// ============================================

async function handleAuthSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const nameInput = document.getElementById('authName');
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');

    const payload = {
        email: emailInput.value.trim(),
        password: passwordInput.value,
    };

    if (authMode === 'register') {
        payload.name = (nameInput?.value || '').trim();
    }

    const endpoint = authMode === 'register' ? '/register' : '/login';
    const url = `${AUTH_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Authentication failed');
        }

        if (authMode === 'login') {
            authToken = data.access_token;
            localStorage.setItem('herbudget_token', authToken);
            showAppScreen();
            showNotification('Login successful', 'success');
            await init();
        } else {
            authMode = 'login';
            document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === 'login'));
            document.getElementById('authNameGroup').style.display = 'none';
            document.querySelector('.auth-submit').textContent = 'Login';
            showNotification('Registration successful. Please log in.', 'success');
            emailInput.value = payload.email;
            passwordInput.value = '';
        }
    } catch (error) {
        console.error('Auth error:', error);
        showNotification(error.message || 'Authentication failed', 'error');
    }
}

async function loadCurrentUserProfile() {
    try {
        currentUser = await apiRequest('/auth/me');
        if (userNameEl && currentUser?.name) {
            userNameEl.textContent = currentUser.name;
        }
    } catch (error) {
        console.error('Failed to load current user profile:', error);
    }
}

async function init() {
    const authNameGroup = document.getElementById('authNameGroup');
    const authSubmitButton = document.querySelector('.auth-submit');
    const authTabs = document.querySelectorAll('.auth-tab');

    if (!authEventsBound) {
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', handleAuthSubmit);
        }

        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                authMode = tab.dataset.authTab;
                authTabs.forEach(item => item.classList.toggle('active', item === tab));
                if (authMode === 'register') {
                    if (authNameGroup) authNameGroup.style.display = 'block';
                    if (authSubmitButton) authSubmitButton.textContent = 'Create account';
                } else {
                    if (authNameGroup) authNameGroup.style.display = 'none';
                    if (authSubmitButton) authSubmitButton.textContent = 'Login';
                }
            });
        });
        authEventsBound = true;
    }

    if (!authToken) {
        authMode = 'login';
        const emailInput = document.getElementById('authEmail');
        const passwordInput = document.getElementById('authPassword');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        showAuthScreen();
        return;
    }

    try {
        await loadCurrentUserProfile();
        showAppScreen();
        setUserGreeting();
        await loadCategories();
        await refreshAllData();
    } catch (error) {
        console.error('Initialization error:', error);
        logout();
    }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
