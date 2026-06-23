// ApexFinance Client Application Logic

// Initialize configuration and state
let BASE_URL = localStorage.getItem('gas_url') || '';

const state = {
  token: localStorage.getItem('token') || '',
  transactions: [],
  categories: [],
  selectedMonth: new Date().toISOString().slice(0, 7)
};

// Global variables for visual representation
let categoryChartInstance = null;
let activeFormType = 'expense'; // default for new transactions

/**
 * Standard API Wrapper
 * Sends HTTP requests to Google Apps Script Web App.
 * Handles CORS and returns Javascript objects.
 */
async function api(route, method = 'GET', data = {}) {
  const base = localStorage.getItem('gas_url') || BASE_URL;
  if (!base) {
    throw new Error('Google Apps Script endpoint is not configured.');
  }

  let url = base;
  if (method === 'GET') {
    const params = new URLSearchParams({
      route: route,
      token: state.token,
      month: state.selectedMonth
    });
    url += (url.includes('?') ? '&' : '?') + params.toString();
  }

  const options = {
    method: method,
  };

  if (method === 'POST') {
    // Note: Do NOT set Content-Type header to 'application/json' to avoid
    // browser CORS preflight OPTIONS request, which GAS does not support.
    options.body = JSON.stringify({
      ...data,
      route,
      token: state.token
    });
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (result && result.error) {
    throw new Error(result.error);
  }

  return result;
}

/**
 * Initialize application data
 */
async function init() {
  state.categories = await api('categories');
  await loadTransactions();
}

/**
 * Load list of transactions from backend
 */
async function loadTransactions() {
  state.transactions = await api('list');
  render();
}

/**
 * Calculate financial totals (Income, Expense, Net Balance)
 */
function calcSummary() {
  let income = 0;
  let expense = 0;

  state.transactions.forEach(t => {
    if (t.type === 'income') {
      income += Number(t.amount);
    } else {
      expense += Number(t.amount);
    }
  });

  return { income, expense, balance: income - expense };
}

/**
 * Compile data for the category breakdown chart (expenses only)
 */
function buildChartData() {
  const map = {};

  // Filter only expenses for category breakdown
  state.transactions.filter(t => t.type === 'expense').forEach(t => {
    if (!map[t.category]) {
      map[t.category] = 0;
    }
    map[t.category] += Number(t.amount);
  });

  return {
    labels: Object.keys(map),
    data: Object.values(map)
  };
}

/**
 * Filter categories list by type
 */
function getFilteredCategories(type) {
  return state.categories.filter(c => c.type === type);
}

/**
 * CRUD Methods matching backend routes
 */
async function addTransaction(data) {
  await api('add', 'POST', data);
  await loadTransactions();
}

async function updateTransaction(data) {
  await api('update', 'POST', data);
  await loadTransactions();
}

async function deleteTransaction(id) {
  await api('delete', 'POST', { id });
  await loadTransactions();
}

/**
 * Populate Category options in the transaction form dropdown
 */
function updateCategoryDropdown(type) {
  const catSelect = document.getElementById('tx-category');
  catSelect.innerHTML = '';

  const filtered = getFilteredCategories(type);
  if (filtered.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.innerText = 'No categories found';
    catSelect.appendChild(opt);
    return;
  }

  filtered.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.innerText = c.name;
    catSelect.appendChild(opt);
  });
}

/**
 * Set active form transaction type (Income/Expense) and adjust UI states
 */
function setFormType(type) {
  activeFormType = type;
  const incomeBtn = document.getElementById('type-income');
  const expenseBtn = document.getElementById('type-expense');

  if (type === 'income') {
    incomeBtn.className = "py-2.5 px-4 rounded-xl border border-accentEmerald bg-emerald-500/10 text-accentEmerald text-sm font-semibold transition-all flex items-center justify-center gap-2 select-none";
    expenseBtn.className = "py-2.5 px-4 rounded-xl border border-darkBorder text-slate-400 text-sm font-medium transition-all flex items-center justify-center gap-2 select-none hover:bg-slate-900/40";
  } else {
    expenseBtn.className = "py-2.5 px-4 rounded-xl border border-accentRose bg-rose-500/10 text-accentRose text-sm font-semibold transition-all flex items-center justify-center gap-2 select-none";
    incomeBtn.className = "py-2.5 px-4 rounded-xl border border-darkBorder text-slate-400 text-sm font-medium transition-all flex items-center justify-center gap-2 select-none hover:bg-slate-900/40";
  }

  updateCategoryDropdown(type);
}

/**
 * Open Modal Form for creating or editing transactions
 */
function openTransactionModal(tx = null) {
  const modal = document.getElementById('transaction-modal');
  const titleEl = document.getElementById('modal-title');
  const iconContainer = document.getElementById('modal-icon-container');
  const saveBtnLbl = document.getElementById('lbl-save-button');

  const idInput = document.getElementById('tx-id');
  const dateInput = document.getElementById('tx-date');
  const amountInput = document.getElementById('tx-amount');
  const noteInput = document.getElementById('tx-note');

  if (tx) {
    // Edit transaction mode
    titleEl.innerText = "Edit Transaction";
    saveBtnLbl.innerText = "Update Transaction";
    iconContainer.className = "p-2.5 rounded-xl bg-accentViolet/10 text-accentViolet animate-pulse";
    iconContainer.innerHTML = '<i data-lucide="edit-3" class="w-5 h-5"></i>';

    idInput.value = tx.id;
    
    // Parse to local YYYY-MM-DD
    const d = new Date(tx.date);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    dateInput.value = `${yr}-${mo}-${dy}`;

    amountInput.value = tx.amount;
    noteInput.value = tx.note;

    setFormType(tx.type);
    document.getElementById('tx-category').value = tx.category;
  } else {
    // Add transaction mode
    titleEl.innerText = "Add Transaction";
    saveBtnLbl.innerText = "Save Transaction";
    iconContainer.className = "p-2.5 rounded-xl bg-accentIndigo/10 text-accentIndigo";
    iconContainer.innerHTML = '<i data-lucide="plus-circle" class="w-5 h-5"></i>';

    idInput.value = '';
    dateInput.value = new Date().toISOString().slice(0, 10);
    amountInput.value = '';
    noteInput.value = '';

    setFormType('expense');
  }

  lucide.createIcons();
  modal.classList.remove('opacity-0', 'pointer-events-none');
}

/**
 * Close Modal Form
 */
function closeTransactionModal() {
  const modal = document.getElementById('transaction-modal');
  modal.classList.add('opacity-0', 'pointer-events-none');
}

/**
 * Render Financial Metric Summary Cards
 */
function renderSummary() {
  const summary = calcSummary();
  
  const formatCurrency = (val) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const balanceVal = document.getElementById('val-balance');
  const balanceCard = document.getElementById('card-balance');
  balanceVal.innerText = formatCurrency(summary.balance);
  
  // Custom glowing indicators based on net earnings status
  if (summary.balance > 0) {
    balanceVal.className = "text-3xl font-bold tracking-tight text-accentEmerald";
    balanceCard.className = "bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden backdrop-blur-md transition-all duration-300 glow-emerald";
  } else if (summary.balance < 0) {
    balanceVal.className = "text-3xl font-bold tracking-tight text-accentRose";
    balanceCard.className = "bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden backdrop-blur-md transition-all duration-300 glow-rose";
  } else {
    balanceVal.className = "text-3xl font-bold tracking-tight text-slate-100";
    balanceCard.className = "bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden backdrop-blur-md transition-all duration-300";
  }

  document.getElementById('val-income').innerText = formatCurrency(summary.income);
  document.getElementById('val-expense').innerText = formatCurrency(summary.expense);
  
  // Render financial analytics gauges
  const ratioText = document.getElementById('txt-ratio');
  const ratioBar = document.getElementById('bar-ratio');
  const ratioAdvice = document.getElementById('lbl-status-advice');
  const ratioIconContainer = document.getElementById('status-icon-container');
  
  if (summary.income > 0) {
    const ratio = Math.min(Math.round((summary.expense / summary.income) * 100), 100);
    ratioText.innerText = `${ratio}%`;
    ratioBar.style.width = `${ratio}%`;
    
    if (ratio < 50) {
      ratioBar.className = "h-full bg-gradient-to-r from-accentEmerald to-teal-500 rounded-full transition-all duration-500";
      ratioAdvice.innerText = `Excellent spending ratio! You saved ${(100 - ratio)}% of your income. Keep investing the difference.`;
      ratioIconContainer.className = "p-2 bg-emerald-500/10 text-accentEmerald rounded-lg mt-0.5";
      ratioIconContainer.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i>';
    } else if (ratio < 85) {
      ratioBar.className = "h-full bg-gradient-to-r from-accentIndigo to-accentViolet rounded-full transition-all duration-500";
      ratioAdvice.innerText = `Moderate status. You spent ${ratio}% of your income. Look for small optimization opportunities.`;
      ratioIconContainer.className = "p-2 bg-indigo-500/10 text-accentIndigo rounded-lg mt-0.5";
      ratioIconContainer.innerHTML = '<i data-lucide="lightbulb" class="w-4 h-4"></i>';
    } else {
      ratioBar.className = "h-full bg-gradient-to-r from-accentRose to-orange-500 rounded-full transition-all duration-500";
      ratioAdvice.innerText = `High spending ratio! Expenses occupy ${ratio}% of income. Review subscription logs and recurring costs.`;
      ratioIconContainer.className = "p-2 bg-rose-500/10 text-accentRose rounded-lg mt-0.5";
      ratioIconContainer.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4"></i>';
    }
    
    document.getElementById('lbl-ratio-desc').innerText = `Spending $${summary.expense.toLocaleString()} against $${summary.income.toLocaleString()} total earnings.`;
  } else {
    ratioText.innerText = '0%';
    ratioBar.style.width = '0%';
    ratioBar.className = "h-full bg-slate-700 rounded-full transition-all duration-500";
    
    if (summary.expense > 0) {
      ratioAdvice.innerText = `Logged expenses ($${summary.expense.toLocaleString()}) but no matching income yet. Please update income metrics.`;
      ratioIconContainer.className = "p-2 bg-rose-500/10 text-accentRose rounded-lg mt-0.5";
      ratioIconContainer.innerHTML = '<i data-lucide="trending-down" class="w-4 h-4"></i>';
      document.getElementById('lbl-ratio-desc').innerText = "Running visual calculations with deficit values.";
    } else {
      ratioAdvice.innerText = "Start logging your income and expenses to view smart budget suggestions.";
      ratioIconContainer.className = "p-2 bg-slate-800 text-slate-400 rounded-lg mt-0.5";
      ratioIconContainer.innerHTML = '<i data-lucide="info" class="w-4 h-4"></i>';
      document.getElementById('lbl-ratio-desc').innerText = "No active monthly stats collected yet.";
    }
  }
  lucide.createIcons();
}

/**
 * Render expense doughnut chart
 */
function renderCategoryChart() {
  const ctx = document.getElementById('category-chart').getContext('2d');
  const noDataEl = document.getElementById('chart-no-data');
  const chartCanvas = document.getElementById('category-chart');
  
  const chartData = buildChartData();
  
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
    categoryChartInstance = null;
  }
  
  if (chartData.labels.length === 0) {
    noDataEl.classList.remove('hidden');
    chartCanvas.classList.add('invisible');
    return;
  }
  
  noDataEl.classList.add('hidden');
  chartCanvas.classList.remove('invisible');
  
  const colors = [
    '#6366f1', // indigo
    '#f43f5e', // rose
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#14b8a6', // teal
  ];
  
  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.data,
        backgroundColor: colors.slice(0, chartData.labels.length),
        borderColor: '#131926',
        borderWidth: 2.5,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#cbd5e1',
            font: {
              family: 'Outfit',
              size: 11
            },
            padding: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Outfit', weight: 'bold' },
          bodyFont: { family: 'Outfit' },
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              return ` $${val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }
          }
        }
      },
      cutout: '68%'
    }
  });
}

/**
 * Render detailed transactions table ledger
 */
function renderTransactionsList() {
  const tbody = document.getElementById('transactions-body');
  const emptyState = document.getElementById('ledger-empty-state');
  
  const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  const filterType = document.getElementById('filter-type').value;
  
  let filtered = state.transactions;
  
  if (filterType !== 'all') {
    filtered = filtered.filter(t => t.type === filterType);
  }
  
  if (searchQuery) {
    filtered = filtered.filter(t => 
      (t.note && t.note.toLowerCase().includes(searchQuery)) ||
      (t.category && t.category.toLowerCase().includes(searchQuery))
    );
  }
  
  tbody.innerHTML = '';
  
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  // Sort transactions by date descending, then created_at descending
  filtered.sort((a, b) => {
    const dCompare = b.date.localeCompare(a.date);
    if (dCompare !== 0) return dCompare;
    return (b.created_at || '').localeCompare(a.created_at || '');
  });
  
  filtered.forEach(t => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-900/40 transition-colors border-b border-darkBorder/20";
    
    const formattedAmount = Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const isIncome = t.type === 'income';
    
    const dObj = new Date(t.date);
    const day = dObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    const year = dObj.getFullYear();
    
    const amountClass = isIncome ? 'text-accentEmerald font-semibold' : 'text-slate-100 font-medium';
    const amountPrefix = isIncome ? '+$' : '-$';
    const badgeBg = isIncome ? 'bg-emerald-500/10 text-accentEmerald border-emerald-500/20' : 'bg-rose-500/10 text-accentRose border-rose-500/20';
    const typeIcon = isIncome ? 'trending-up' : 'trending-down';
    
    tr.innerHTML = `
      <td class="py-4 px-6 text-sm text-slate-300 whitespace-nowrap">
        <div class="font-medium">${day}</div>
        <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">${year}</div>
      </td>
      <td class="py-4 px-6 text-sm">
        <div class="text-slate-100 font-semibold">${t.note || `<span class="italic text-slate-500">No Note</span>`}</div>
        <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
          <span class="inline-flex items-center gap-1 border rounded px-1.5 py-0.5 text-[9px] ${badgeBg}">
            <i data-lucide="${typeIcon}" class="w-2.5 h-2.5"></i>
            ${t.type}
          </span>
        </div>
      </td>
      <td class="py-4 px-6 text-sm whitespace-nowrap">
        <span class="text-xs bg-slate-900 border border-darkBorder text-slate-300 px-2.5 py-1 rounded-lg font-medium inline-block">
          ${t.category}
        </span>
      </td>
      <td class="py-4 px-6 text-sm text-right whitespace-nowrap">
        <span class="${amountClass}">${amountPrefix}${formattedAmount}</span>
      </td>
      <td class="py-4 px-6 text-sm text-right whitespace-nowrap">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editTransactionClick('${t.id}')" title="Edit"
            class="p-1.5 rounded-lg text-slate-400 hover:text-accentIndigo hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteTransactionClick('${t.id}')" title="Delete"
            class="p-1.5 rounded-lg text-slate-400 hover:text-accentRose hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  lucide.createIcons();
}

/**
 * Handle Edit button click
 */
window.editTransactionClick = function(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;
  openTransactionModal(tx);
};

/**
 * Handle Delete button click
 */
window.deleteTransactionClick = async function(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    showLoading('Deleting transaction...');
    try {
      await deleteTransaction(id);
      showToast('Transaction deleted successfully', 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      hideLoading();
    }
  }
};

/**
 * Master render call
 */
function render() {
  renderSummary();
  renderCategoryChart();
  renderTransactionsList();
}

/**
 * Display toast notification
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `p-4 rounded-xl border flex items-center gap-3 shadow-xl backdrop-blur-md animate-fade-in transition-all duration-300 transform translate-y-0 opacity-100`;
  
  if (type === 'success') {
    toast.className += ' bg-emerald-950/80 border-emerald-500/30 text-emerald-300';
    toast.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 text-accentEmerald flex-shrink-0"></i><span class="text-sm font-medium">${message}</span>`;
  } else if (type === 'error') {
    toast.className += ' bg-rose-950/80 border-rose-500/30 text-rose-300';
    toast.innerHTML = `<i data-lucide="alert-circle" class="w-5 h-5 text-accentRose flex-shrink-0"></i><span class="text-sm font-medium">${message}</span>`;
  } else {
    toast.className += ' bg-indigo-950/80 border-indigo-500/30 text-indigo-300';
    toast.innerHTML = `<i data-lucide="info" class="w-5 h-5 text-accentIndigo flex-shrink-0"></i><span class="text-sm font-medium">${message}</span>`;
  }
  
  container.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Manage loading overlay
 */
function showLoading(msg = 'Fetching data...') {
  const overlay = document.getElementById('loading-overlay');
  const msgEl = document.getElementById('loading-message');
  msgEl.innerText = msg;
  overlay.classList.remove('opacity-0', 'pointer-events-none');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('opacity-0', 'pointer-events-none');
}

/**
 * Try to connect to Apps Script and authenticate
 */
async function testAndConnect(url, token) {
  showLoading('Connecting and authenticating...');
  try {
    const oldUrl = BASE_URL;
    const oldToken = state.token;
    
    BASE_URL = url;
    state.token = token;
    
    // Call doPost auth route directly via fetch
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ route: 'auth', token })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    
    const authResult = await response.json();
    
    if (authResult && authResult.success) {
      localStorage.setItem('gas_url', url);
      localStorage.setItem('token', token);
      
      const endpointEl = document.getElementById('footer-connection-details');
      if (endpointEl) {
        endpointEl.innerText = url.substring(0, 45) + '...';
        endpointEl.title = url;
      }
      
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('main-app').classList.remove('hidden');
      
      showToast('Successfully connected to Google Sheets!', 'success');
      
      await init();
    } else {
      BASE_URL = oldUrl;
      state.token = oldToken;
      throw new Error('Authentication failed. Invalid secret token.');
    }
  } catch (err) {
    showToast(`Connection failed: ${err.message || err.toString()}`, 'error');
    throw err;
  } finally {
    hideLoading();
  }
}

/**
 * Register global application event listeners
 */
function setupEventListeners() {
  // Authentication submission
  const authForm = document.getElementById('auth-form');
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('input-gas-url').value.trim();
    const token = document.getElementById('input-auth-token').value.trim();
    
    try {
      await testAndConnect(url, token);
    } catch (err) {
      // already toast-notified inside testAndConnect
    }
  });

  // Pre-fill setup inputs if stored in storage
  if (BASE_URL) {
    document.getElementById('input-gas-url').value = BASE_URL;
  }
  if (state.token) {
    document.getElementById('input-auth-token').value = state.token;
  }

  // Logout / Disconnect action
  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('gas_url');
    BASE_URL = '';
    state.token = '';
    state.transactions = [];
    state.categories = [];
    
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
    showToast('Disconnected from Google Sheets', 'info');
  });

  // Month select change
  document.getElementById('month-picker').addEventListener('change', async (e) => {
    state.selectedMonth = e.target.value;
    showLoading('Loading transactions...');
    try {
      await loadTransactions();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      hideLoading();
    }
  });

  // Open modal for transaction creation
  document.getElementById('btn-new-transaction').addEventListener('click', () => {
    openTransactionModal();
  });

  // Close modal
  document.getElementById('modal-close').addEventListener('click', () => {
    closeTransactionModal();
  });

  // Modal type triggers
  document.getElementById('type-income').addEventListener('click', () => {
    setFormType('income');
  });
  document.getElementById('type-expense').addEventListener('click', () => {
    setFormType('expense');
  });

  // Form submission handler
  const form = document.getElementById('transaction-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('tx-id').value;
    const date = document.getElementById('tx-date').value;
    const category = document.getElementById('tx-category').value;
    const amount = Number(document.getElementById('tx-amount').value);
    const note = document.getElementById('tx-note').value.trim();
    
    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }
    
    const data = {
      date,
      type: activeFormType,
      category,
      amount,
      note
    };
    
    closeTransactionModal();
    showLoading(id ? 'Updating transaction...' : 'Adding transaction...');
    
    try {
      if (id) {
        await updateTransaction({ ...data, id });
        showToast('Transaction updated successfully', 'success');
      } else {
        await addTransaction(data);
        showToast('Transaction added successfully', 'success');
      }
    } catch (err) {
      showToast(`Action failed: ${err.message}`, 'error');
    } finally {
      hideLoading();
    }
  });

  // Local Search & Filter inputs
  document.getElementById('search-input').addEventListener('input', () => {
    renderTransactionsList();
  });
  document.getElementById('filter-type').addEventListener('change', () => {
    renderTransactionsList();
  });
}

// Auto-initialize when page content is ready
window.addEventListener('DOMContentLoaded', async () => {
  const monthPicker = document.getElementById('month-picker');
  monthPicker.value = state.selectedMonth;
  
  if (BASE_URL) {
    const endpointEl = document.getElementById('footer-connection-details');
    if (endpointEl) {
      endpointEl.innerText = BASE_URL.substring(0, 45) + '...';
      endpointEl.title = BASE_URL;
    }
  }
  
  setupEventListeners();
  lucide.createIcons();
  
  if (BASE_URL && state.token) {
    showLoading('Restoring connection...');
    try {
      await init();
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('main-app').classList.remove('hidden');
      showToast('Session restored successfully', 'success');
    } catch (err) {
      console.error('Failed auto-init:', err);
      localStorage.removeItem('token');
      document.getElementById('auth-screen').classList.remove('hidden');
      document.getElementById('main-app').classList.add('hidden');
      showToast('Saved session is invalid. Please reconnect.', 'error');
    } finally {
      hideLoading();
    }
  } else {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
  }
});
