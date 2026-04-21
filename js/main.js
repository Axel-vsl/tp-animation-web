// ========================
//  ÉTAT DE L'APPLICATION
// ========================
let transactions = JSON.parse(localStorage.getItem('budget_transactions')) || [];
let currentType = 'revenu';
let currentFilter = 'all';

// Emojis par catégorie
const categoryIcons = {
  'Alimentation': '🛒',
  'Transport': '🚗',
  'Logement': '🏠',
  'Loisirs': '🎮',
  'Santé': '💊',
  'Salaire': '💼',
  'Autre': '📦',
};

// ========================
//  INITIALISATION
// ========================
function init() {
  // Date du jour dans le header
  const now = new Date();
  document.getElementById('dateDisplay').textContent = now.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Date par défaut dans le formulaire
  document.getElementById('dateInput').valueAsDate = new Date();

  render();
}

// ========================
//  TYPE DE TRANSACTION
// ========================
function setType(type) {
  currentType = type;
  document.getElementById('btnRevenu').classList.toggle('active', type === 'revenu');
  document.getElementById('btnDepense').classList.toggle('active', type === 'depense');
}

// ========================
//  AJOUTER UNE TRANSACTION
// ========================
function addTransaction() {
  const description = document.getElementById('description').value.trim();
  const montant = parseFloat(document.getElementById('montant').value);
  const categorie = document.getElementById('categorie').value;
  const date = document.getElementById('dateInput').value;

  // Validation
  if (!description) {
    shake('description');
    return;
  }
  if (!montant || montant <= 0) {
    shake('montant');
    return;
  }
  if (!date) {
    shake('dateInput');
    return;
  }

  const transaction = {
    id: Date.now(),
    type: currentType,
    description,
    montant,
    categorie,
    date,
  };

  transactions.unshift(transaction);
  save();
  render();
  resetForm();
}

// ========================
//  SUPPRIMER UNE TRANSACTION
// ========================
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  render();
}

// ========================
//  TOUT EFFACER
// ========================
function clearAll() {
  if (transactions.length === 0) return;
  if (confirm('Voulez-vous vraiment effacer toutes les transactions ?')) {
    transactions = [];
    save();
    render();
  }
}

// ========================
//  FILTRER
// ========================
function filterTransactions(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

// ========================
//  RENDU
// ========================
function render() {
  updateSummary();
  renderList();
}

function updateSummary() {
  const totalIncome = transactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + t.montant, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + t.montant, 0);

  const balance = totalIncome - totalExpenses;

  const balanceEl = document.getElementById('balanceAmount');
  balanceEl.textContent = formatCurrency(balance);
  balanceEl.className = 'balance-amount';
  if (balance > 0) balanceEl.classList.add('positive');
  else if (balance < 0) balanceEl.classList.add('negative');

  document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
  document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
}

function renderList() {
  const list = document.getElementById('transactionList');
  const emptyState = document.getElementById('emptyState');

  // Filtrer
  let filtered = transactions;
  if (currentFilter !== 'all') {
    filtered = transactions.filter(t => t.type === currentFilter);
  }

  // Vider la liste (sauf l'empty state)
  Array.from(list.children).forEach(child => {
    if (child.id !== 'emptyState') child.remove();
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = `transaction-item ${t.type === 'revenu' ? 'income-item' : 'expense-item'}`;

    const sign = t.type === 'revenu' ? '+' : '-';
    const icon = categoryIcons[t.categorie] || '📦';
    const dateFormatted = new Date(t.date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    li.innerHTML = `
      <div class="transaction-left">
        <div class="transaction-icon">${icon}</div>
        <div class="transaction-info">
          <p class="transaction-desc">${escapeHtml(t.description)}</p>
          <p class="transaction-meta">${t.categorie} · ${dateFormatted}</p>
        </div>
      </div>
      <div class="transaction-right">
        <span class="transaction-amount">${sign}${formatCurrency(t.montant)}</span>
        <button class="delete-btn" onclick="deleteTransaction(${t.id})" title="Supprimer">×</button>
      </div>
    `;

    list.appendChild(li);
  });
}

// ========================
//  UTILITAIRES
// ========================
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

function save() {
  localStorage.setItem('budget_transactions', JSON.stringify(transactions));
}

function resetForm() {
  document.getElementById('description').value = '';
  document.getElementById('montant').value = '';
  document.getElementById('dateInput').valueAsDate = new Date();
}

function shake(fieldId) {
  const el = document.getElementById(fieldId);
  el.style.borderColor = 'var(--expense)';
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.3s ease';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation = '';
  }, 400);
}

// Animation shake (injectée dynamiquement)
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
`;
document.head.appendChild(style);

// ========================
//  LANCEMENT
// ========================
init();
