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
    localStorage.removeItem('herbudget_token');
    authMode = 'login';
    const authNameGroup = document.getElementById('authNameGroup');
    const authSubmitButton = document.querySelector('.auth-submit');
    const authTabs = document.querySelectorAll('.auth-tab');

    if (authNameGroup) authNameGroup.style.display = 'none';
    if (authSubmitButton) authSubmitButton.textContent = 'Login';
    authTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === 'login'));

    showAuthScreen();
    showNotification('Session expired. Please log in again.', 'warning');
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
    if (userNameEl) userNameEl.textContent = 'Sarah Mitchell';
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

        switch (item.dataset.page) {
            case 'home':
                document.querySelector('.app-main')?.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'transactions':
                document.querySelector('.transactions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                break;
            case 'analytics':
                document.querySelector('.category-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                break;
            case 'settings':
                showNotification('Settings are ready for customization', 'warning');
                break;
            default:
                break;
        }
    });
});

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
        const user = await apiRequest('/auth/me');
        if (userNameEl && user?.name) {
            userNameEl.textContent = user.name;
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
