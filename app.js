'use strict';

/* ---------- Dati e costanti ---------- */

const STORAGE_KEYS = { TX: 'finanze_transactions', CAT: 'finanze_categories', BUDGETS: 'finanze_budgets' };

const DEFAULT_CATEGORIES = {
  expense: {
    'Alimentari': ['Spesa quotidiana', 'Bar e ristoranti'],
    'Casa': ['Affitto/Mutuo', 'Bollette', 'Manutenzione', 'Arredamento'],
    'Trasporti': ['Carburante', 'Mezzi pubblici', 'Manutenzione auto', 'Parcheggi e pedaggi'],
    'Salute': ['Farmacia', 'Visite mediche', 'Palestra'],
    'Svago': ['Streaming e abbonamenti', 'Hobby', 'Viaggi', 'Shopping'],
    'Altro': ['Regali', 'Varie'],
  },
  income: {
    'Lavoro': ['Stipendio', 'Bonus e straordinari', 'Freelance'],
    'Investimenti': ['Dividendi', 'Interessi', 'Plusvalenze'],
    'Altro': ['Regali ricevuti', 'Rimborsi', 'Varie'],
  },
};

const CHART_COLORS = ['#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d', '#78716c'];

const INCOME_KEYWORDS = ['stipendio', 'entrata', 'guadagn', 'ricevut', 'accredit', 'bonus', 'incassat', 'dividend', 'rimbors'];

const SYNONYMS = {
  'Alimentari|Spesa quotidiana': ['supermercato', 'spesa', 'alimentari', 'esselunga', 'conad', 'coop', 'carrefour', 'lidl', 'pam', 'market'],
  'Alimentari|Bar e ristoranti': ['bar', 'ristorante', 'pizzeria', 'caffe', 'cena', 'pranzo', 'aperitivo', 'trattoria'],
  'Casa|Bollette': ['bolletta', 'bollette', 'luce', 'gas', 'acqua', 'enel', 'utenza', 'utenze', 'internet', 'telefono'],
  'Casa|Affitto/Mutuo': ['affitto', 'mutuo'],
  'Casa|Manutenzione': ['riparazione', 'idraulico', 'elettricista', 'manutenzione'],
  'Casa|Arredamento': ['mobile', 'mobili', 'arredamento', 'ikea'],
  'Trasporti|Carburante': ['benzina', 'diesel', 'carburante', 'rifornimento', 'distributore'],
  'Trasporti|Mezzi pubblici': ['autobus', 'bus', 'treno', 'metro', 'biglietto'],
  'Trasporti|Parcheggi e pedaggi': ['parcheggio', 'pedaggio', 'autostrada'],
  'Trasporti|Manutenzione auto': ['officina', 'meccanico', 'tagliando', 'gomme'],
  'Salute|Farmacia': ['farmacia', 'farmaco', 'medicina', 'medicine'],
  'Salute|Visite mediche': ['visita', 'medico', 'dottore', 'dentista'],
  'Salute|Palestra': ['palestra'],
  'Svago|Streaming e abbonamenti': ['netflix', 'spotify', 'streaming', 'abbonamento'],
  'Svago|Shopping': ['shopping', 'vestiti', 'negozio', 'scarpe'],
  'Svago|Viaggi': ['viaggio', 'hotel', 'volo', 'vacanza'],
  'Svago|Hobby': ['hobby'],
  'Lavoro|Stipendio': ['stipendio', 'salario'],
  'Lavoro|Bonus e straordinari': ['bonus', 'straordinari', 'straordinario'],
  'Lavoro|Freelance': ['freelance', 'fattura', 'consulenza'],
  'Investimenti|Dividendi': ['dividendo', 'dividendi'],
  'Investimenti|Interessi': ['interesse', 'interessi'],
};

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-1 14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 6"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>',
  category: {
    'Alimentari': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
    'Casa': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
    'Trasporti': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="18" height="7" rx="2"/><path d="M5 10 7 5h10l2 5M7 17v2M17 17v2"/></svg>',
    'Salute': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-9.3a5 5 0 0 0 0-7.1z"/></svg>',
    'Svago': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 4v16M2 10h6M2 14h6"/></svg>',
    'Lavoro': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    'Investimenti': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>',
    'Altro': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
  },
};
function categoryIcon(name) { return ICONS.category[name] || ICONS.category['Altro']; }

/* ---------- Stato ---------- */

let state = {
  transactions: [],
  categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
  tab: 'aggiungi',
  editingId: null,
  filterType: 'all',
  filterCategory: 'all',
  period: 'month',
  formType: 'expense',
  formCategory: 'Alimentari',
  formSubcategory: 'Spesa quotidiana',
  subInputFor: null,
  voiceMessage: '',
  voiceError: '',
  isListening: false,
  pendingAmount: '',
  pendingDescription: '',
  pendingDate: '',
  budgets: {},
  budgetMessage: '',
};

function loadState() {
  try {
    const tx = localStorage.getItem(STORAGE_KEYS.TX);
    if (tx) state.transactions = JSON.parse(tx);
  } catch (e) { /* nessun dato salvato */ }
  try {
    const cat = localStorage.getItem(STORAGE_KEYS.CAT);
    if (cat) state.categories = JSON.parse(cat);
  } catch (e) { /* uso le categorie di default */ }
  try {
    const b = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (b) state.budgets = JSON.parse(b);
  } catch (e) { /* nessun budget impostato */ }
}
function saveTransactions() {
  try { localStorage.setItem(STORAGE_KEYS.TX, JSON.stringify(state.transactions)); }
  catch (e) { console.error('Salvataggio movimenti non riuscito', e); }
}
function saveCategories() {
  try { localStorage.setItem(STORAGE_KEYS.CAT, JSON.stringify(state.categories)); }
  catch (e) { console.error('Salvataggio categorie non riuscito', e); }
}
function saveBudgets() {
  try { localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(state.budgets)); }
  catch (e) { console.error('Salvataggio budget non riuscito', e); }
}

/* ---------- Helper ---------- */

function formatCurrency(amount) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}
function todayStr() { return new Date().toISOString().split('T')[0]; }
function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}
function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
function catKeys(type) { return Object.keys(state.categories[type] || {}); }
function subsOf(type, cat) { return (state.categories[type] && state.categories[type][cat]) || []; }

function syncFormInputsToState() {
  const amountEl = document.getElementById('form-amount');
  const descEl = document.getElementById('form-description');
  const dateEl = document.getElementById('form-date');
  if (amountEl) state.pendingAmount = amountEl.value;
  if (descEl) state.pendingDescription = descEl.value;
  if (dateEl) state.pendingDate = dateEl.value;
}

/* ---------- Parsing vocale locale (offline) ---------- */

function parseVoiceLocally(transcript) {
  const text = transcript.toLowerCase();
  const amountMatch = text.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!amountMatch) return { error: 'importo non trovato' };
  const amount = parseFloat(amountMatch[1].replace(',', '.'));
  if (!amount || amount <= 0) return { error: 'importo non valido' };

  const type = INCOME_KEYWORDS.some((k) => text.includes(k)) ? 'income' : 'expense';

  let date = todayStr();
  if (text.includes('ieri')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    date = d.toISOString().split('T')[0];
  }

  const catObj = state.categories[type] || {};
  let bestCategory = null, bestSubcategory = null, bestScore = 0;
  for (const [cat, subs] of Object.entries(catObj)) {
    for (const sub of subs) {
      const words = (SYNONYMS[`${cat}|${sub}`] || []).concat(sub.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
      const score = words.filter((w) => text.includes(w)).length;
      if (score > bestScore) { bestScore = score; bestCategory = cat; bestSubcategory = sub; }
    }
  }
  if (!bestCategory) {
    bestCategory = catObj['Altro'] ? 'Altro' : Object.keys(catObj)[0];
    bestSubcategory = (catObj[bestCategory] || [])[0] || '';
  }
  return { type, amount, category: bestCategory, subcategory: bestSubcategory, description: transcript, date };
}

function startListening() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    state.voiceError = 'Riconoscimento vocale non supportato su questo browser: prova con Chrome, oppure inserisci i dati manualmente qui sotto.';
    state.voiceMessage = '';
    renderApp();
    return;
  }
  syncFormInputsToState();
  state.voiceError = '';
  state.voiceMessage = '';
  const recognition = new SR();
  recognition.lang = 'it-IT';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => { state.isListening = true; state.voiceMessage = 'In ascolto...'; renderApp(); };
  recognition.onerror = (ev) => {
    state.isListening = false;
    if (ev.error === 'not-allowed') state.voiceError = 'Permesso al microfono negato dal browser.';
    else if (ev.error === 'network') state.voiceError = 'Il riconoscimento vocale richiede una connessione internet: riprova quando sei online, oppure inserisci i dati manualmente.';
    else if (ev.error === 'no-speech') state.voiceError = 'Non ho sentito nulla: riprova.';
    else state.voiceError = `Errore microfono: ${ev.error}`;
    state.voiceMessage = '';
    renderApp();
  };
  recognition.onend = () => { state.isListening = false; renderApp(); };
  recognition.onresult = (ev) => {
    const transcript = ev.results[0][0].transcript;
    const parsed = parseVoiceLocally(transcript);
    if (parsed.error) {
      state.voiceError = `Non ho capito bene (${parsed.error}): riprova, oppure inserisci i dati manualmente.`;
      state.voiceMessage = '';
      renderApp();
      return;
    }
    state.editingId = null;
    state.formType = parsed.type;
    state.formCategory = parsed.category;
    state.formSubcategory = parsed.subcategory;
    state.pendingAmount = String(parsed.amount);
    state.pendingDescription = parsed.description;
    state.pendingDate = parsed.date;
    state.voiceError = '';
    state.voiceMessage = `Ho capito: "${transcript}" — controlla e conferma qui sotto.`;
    renderApp();
  };
  recognition.start();
}

/* ---------- Azioni sui dati ---------- */

function handleFormSubmit(e) {
  e.preventDefault();
  const amountEl = document.getElementById('form-amount');
  const descEl = document.getElementById('form-description');
  const dateEl = document.getElementById('form-date');
  const catEl = document.getElementById('form-category');
  const subEl = document.getElementById('form-subcategory');
  if (!amountEl) return;

  const amount = parseFloat(String(amountEl.value).replace(',', '.'));
  const category = catEl ? catEl.value : state.formCategory;
  const subcategory = subEl ? subEl.value : state.formSubcategory;
  if (!amount || amount <= 0 || !category || !subcategory) return;

  const description = descEl ? descEl.value : '';
  const date = (dateEl && dateEl.value) ? dateEl.value : todayStr();

  if (state.editingId) {
    state.transactions = state.transactions.map((t) => (t.id === state.editingId
      ? { ...t, type: state.formType, amount, category, subcategory, description, date }
      : t));
    state.editingId = null;
  } else {
    state.transactions = [{ id: generateId(), type: state.formType, amount, category, subcategory, description, date }, ...state.transactions];
  }
  saveTransactions();
  checkBudgetAfterSave(category, state.formType);
  state.pendingAmount = '';
  state.pendingDescription = '';
  state.pendingDate = '';
  state.voiceMessage = '';
  renderApp();
}

function startEdit(id) {
  const t = state.transactions.find((tx) => tx.id === id);
  if (!t) return;
  state.editingId = id;
  state.formType = t.type;
  state.formCategory = t.category;
  state.formSubcategory = t.subcategory;
  state.pendingAmount = String(t.amount);
  state.pendingDescription = t.description || '';
  state.pendingDate = t.date;
  state.tab = 'aggiungi';
  renderApp();
}
function cancelEdit() {
  state.editingId = null;
  state.pendingAmount = '';
  state.pendingDescription = '';
  state.pendingDate = '';
  renderApp();
}
function deleteTransaction(id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
  saveTransactions();
  renderApp();
}

function addCategory(type) {
  const input = document.getElementById(`new-cat-input-${type}`);
  if (!input) return;
  const name = input.value.trim();
  if (name && !state.categories[type][name]) {
    state.categories[type][name] = [];
    saveCategories();
  }
  renderApp();
}
function deleteCategory(type, cat) {
  delete state.categories[type][cat];
  saveCategories();
  if (state.budgets[cat]) { delete state.budgets[cat]; saveBudgets(); }
  renderApp();
}
function confirmAddSubcategory() {
  const input = document.getElementById('new-sub-input');
  if (!input || !state.subInputFor) return;
  const name = input.value.trim();
  const { type, cat } = state.subInputFor;
  if (name && state.categories[type][cat] && !state.categories[type][cat].includes(name)) {
    state.categories[type][cat] = [...state.categories[type][cat], name];
    saveCategories();
  }
  state.subInputFor = null;
  renderApp();
}
function deleteSubcategory(type, cat, sub) {
  state.categories[type][cat] = state.categories[type][cat].filter((s) => s !== sub);
  saveCategories();
  renderApp();
}

/* ---------- Streak, promemoria e budget ---------- */

const NUDGE_NONE = [
  'Streak di {n} giorni. Chi sei diventato.',
  '{n} giorni di fila. Continua così, non rovinare tutto adesso.',
];
const NUDGE_TODAY_MISSING_ALIVE = [
  'Ancora niente da segnare oggi? Il tuo streak di {gp} ti guarda con delusione.',
  'Lo streak di {gp} è ancora vivo, ma solo se ti muovi oggi.',
];
const NUDGE_BROKEN = [
  'Il vecchio streak è morto in silenzio. Iniziamone uno nuovo, oggi.',
  'Streak azzerato. Il conto in banca invece continua, giorno e notte.',
];
const NUDGE_FIRST_TIME = [
  'Ancora zero movimenti. Il portafoglio non si controlla da solo, dai.',
  'Si comincia da qualche parte: prova con l\u2019ultima spesa che ricordi.',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function giorniPhrase(n) { return n === 1 ? '1 giorno' : `${n} giorni`; }

function computeStreakInfo() {
  const dates = new Set(state.transactions.map((t) => t.date));
  if (dates.size === 0) return { hasAny: false, loggedToday: false, streak: 0, broken: false };

  const today = todayStr();
  const loggedToday = dates.has(today);

  const cursor = new Date();
  if (!loggedToday) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(cursor.toISOString().split('T')[0])) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const broken = !loggedToday && !dates.has(yesterday.toISOString().split('T')[0]);

  return { hasAny: true, loggedToday, streak, broken };
}

function getNudge() {
  const info = computeStreakInfo();
  if (!info.hasAny) return { text: pick(NUDGE_FIRST_TIME), tone: 'neutral' };
  if (info.loggedToday) return info.streak > 1 ? { text: pick(NUDGE_NONE).replace('{n}', info.streak), tone: 'ok' } : null;
  if (info.broken) return { text: pick(NUDGE_BROKEN), tone: 'warn' };
  return { text: pick(NUDGE_TODAY_MISSING_ALIVE).replace('{gp}', giorniPhrase(info.streak)), tone: 'warn' };
}

function monthExpenseTotalsByCategory() {
  const now = new Date();
  const map = {};
  state.transactions
    .filter((t) => t.type === 'expense')
    .filter((t) => {
      const d = new Date(`${t.date}T00:00:00`);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
  return map;
}

function setBudget(category, value) {
  const num = parseFloat(String(value).replace(',', '.'));
  if (!num || num <= 0) { delete state.budgets[category]; } else { state.budgets[category] = num; }
  saveBudgets();
}

const BUDGET_NEAR = [
  'Sei al {p}% del budget {cat} \u2014 mancano ancora {days} giorni al mese.',
  '{p}% del budget {cat} gi\u00e0 andato. Il mese \u00e8 lungo, la pazienza pure si spera.',
];
const BUDGET_OVER = [
  'Complimenti, hai sforato il budget {cat}. Il divertimento non si ferma, il portafoglio s\u00ec.',
  'Budget {cat} superato. Lo hai fatto con stile, almeno.',
];

function checkBudgetAfterSave(category, type) {
  if (type !== 'expense' || !state.budgets[category]) { state.budgetMessage = ''; return; }
  const totals = monthExpenseTotalsByCategory();
  const spent = totals[category] || 0;
  const budget = state.budgets[category];
  const pct = Math.round((spent / budget) * 100);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();
  if (pct >= 100) {
    state.budgetMessage = pick(BUDGET_OVER).replace('{cat}', category);
  } else if (pct >= 80) {
    state.budgetMessage = pick(BUDGET_NEAR).replace('{p}', pct).replace('{cat}', category).replace('{days}', daysLeft);
  } else {
    state.budgetMessage = '';
  }
}

/* ---------- Grafico a torta SVG (senza librerie) ---------- */

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function donutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const so = polarToCartesian(cx, cy, outerR, startAngle);
  const eo = polarToCartesian(cx, cy, outerR, endAngle);
  const si = polarToCartesian(cx, cy, innerR, startAngle);
  const ei = polarToCartesian(cx, cy, innerR, endAngle);
  const large = (endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${so.x} ${so.y} A ${outerR} ${outerR} 0 ${large} 1 ${eo.x} ${eo.y} L ${ei.x} ${ei.y} A ${innerR} ${innerR} 0 ${large} 0 ${si.x} ${si.y} Z`;
}
function buildPieSVG(data) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) return '';
  let angle = 0;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 360;
    const path = donutSlicePath(100, 100, 85, 52, angle, angle + Math.max(sweep, 0.01));
    angle += sweep;
    return `<path d="${path}" fill="${CHART_COLORS[i % CHART_COLORS.length]}"><title>${esc(d.name)}: ${formatCurrency(d.value)}</title></path>`;
  }).join('');
  return `<svg viewBox="0 0 200 200" class="pie">${slices}</svg>`;
}

/* ---------- Backup locale (esporta/importa file) ---------- */

const BACKUP_STORAGE_KEYS = { LAST_EXPORT: 'finanze_last_export' };
const backupState = { lastExport: null, status: '', error: '' };

function loadBackupState() {
  try { backupState.lastExport = localStorage.getItem(BACKUP_STORAGE_KEYS.LAST_EXPORT) || null; } catch (e) { /* niente salvato */ }
}

function exportBackup() {
  const dataObj = {
    app: 'Le Mie Finanze',
    exportedAt: new Date().toISOString(),
    transactions: state.transactions,
    categories: state.categories,
  };
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finanze-backup-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  backupState.lastExport = new Date().toISOString();
  try { localStorage.setItem(BACKUP_STORAGE_KEYS.LAST_EXPORT, backupState.lastExport); } catch (e) { /* non bloccante */ }
  backupState.status = 'Backup scaricato.';
  backupState.error = '';
  renderApp();
}

function triggerImport() {
  const input = document.getElementById('import-file-input');
  if (input) input.click();
}

function handleImportFile(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object' || !Array.isArray(data.transactions) || typeof data.categories !== 'object') {
        throw new Error('formato non riconosciuto');
      }
      const msg = `Importare questo backup sovrascriverà i movimenti e le categorie attuali (${state.transactions.length} movimenti presenti ora). Continuare?`;
      if (!window.confirm(msg)) return;
      state.transactions = data.transactions;
      state.categories = data.categories;
      saveTransactions();
      saveCategories();
      backupState.error = '';
      backupState.status = `Importati ${data.transactions.length} movimenti${data.exportedAt ? ` (backup del ${new Date(data.exportedAt).toLocaleString('it-IT')})` : ''}.`;
    } catch (err) {
      backupState.status = '';
      backupState.error = `Importazione non riuscita: file non valido (${err.message}).`;
    }
    renderApp();
  };
  reader.onerror = () => {
    backupState.status = '';
    backupState.error = 'Impossibile leggere il file selezionato.';
    renderApp();
  };
  reader.readAsText(file);
}

function renderBackupTab() {
  return `
    <div class="stack max-w">
      <div class="card center">
        <p class="hint">Salva una copia di movimenti e categorie in un file, da tenere dove preferisci (Drive, email, chiavetta...).</p>
        ${backupState.status ? `<p class="voice-msg ok">${esc(backupState.status)}</p>` : ''}
        ${backupState.error ? `<p class="voice-msg err">${ICONS.alert}${esc(backupState.error)}</p>` : ''}
        <div class="btn-stack">
          <button type="button" data-action="export-backup" class="btn-primary">Esporta backup</button>
          <button type="button" data-action="trigger-import" class="btn-secondary">Importa backup</button>
        </div>
        <input type="file" id="import-file-input" accept="application/json,.json" style="display:none;">
        ${backupState.lastExport ? `<p class="hint" style="margin-top:10px;">Ultimo backup esportato: ${new Date(backupState.lastExport).toLocaleString('it-IT')}</p>` : ''}
      </div>
      <div class="card">
        <p class="hint">Il file esportato contiene i tuoi dati in chiaro (JSON): trattalo come un documento personale, ad esempio evitando di condividerlo pubblicamente.</p>
      </div>
    </div>
  `;
}

/* ---------- Rendering ---------- */

function updateBalanceHeader() {
  const income = state.transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = state.transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const el = document.getElementById('balance-amount');
  el.textContent = formatCurrency(balance);
  el.classList.toggle('text-income', balance >= 0);
  el.classList.toggle('text-expense', balance < 0);
}
function setActiveNav() {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === state.tab);
  });
}

function renderAggiungiTab() {
  const cats = catKeys(state.formType);
  const subs = subsOf(state.formType, state.formCategory);
  const isEditing = !!state.editingId;
  const amountVal = state.pendingAmount || '';
  const descVal = state.pendingDescription || '';
  const dateVal = state.pendingDate || todayStr();
  const nudge = getNudge();

  return `
    <div class="stack max-w">
      ${nudge ? `<div class="nudge nudge-${nudge.tone}">${esc(nudge.text)}</div>` : ''}
      ${state.budgetMessage ? `<div class="nudge nudge-warn">${esc(state.budgetMessage)}</div>` : ''}
      <div class="card center">
        <button type="button" id="mic-btn" class="mic-btn ${state.isListening ? 'listening' : ''}" ${state.isListening ? 'disabled' : ''}>
          ${ICONS.mic}
        </button>
        <p class="hint">${state.isListening ? 'Ti ascolto...' : 'Tocca e di\u2019 ad esempio &quot;spesa di 25 euro al supermercato&quot;'}</p>
        ${state.voiceMessage ? `<p class="voice-msg ok">${esc(state.voiceMessage)}</p>` : ''}
        ${state.voiceError ? `<p class="voice-msg err">${ICONS.alert}${esc(state.voiceError)}</p>` : ''}
      </div>

      <form id="tx-form" class="card stack-sm">
        <div class="row-between">
          <span class="label-strong">${isEditing ? 'Modifica movimento' : 'Inserimento manuale'}</span>
          ${isEditing ? `<button type="button" id="cancel-edit-btn" class="link-btn">${ICONS.x}Annulla modifica</button>` : ''}
        </div>

        <div class="type-toggle">
          <button type="button" class="type-btn expense ${state.formType === 'expense' ? 'active' : ''}" data-type="expense">Uscita</button>
          <button type="button" class="type-btn income ${state.formType === 'income' ? 'active' : ''}" data-type="income">Entrata</button>
        </div>

        <div class="field">
          <label>Importo (€)</label>
          <input type="number" step="0.01" min="0" id="form-amount" class="mono" placeholder="0.00" value="${esc(amountVal)}" required>
        </div>

        <div class="grid-2">
          <div class="field">
            <label>Categoria</label>
            ${cats.length === 0
              ? '<p class="warn">Nessuna categoria: aggiungine una nella scheda Categorie.</p>'
              : `<select id="form-category">${cats.map((c) => `<option value="${esc(c)}" ${c === state.formCategory ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>`}
          </div>
          <div class="field">
            <label>Sottocategoria</label>
            ${subs.length === 0
              ? '<p class="warn">Nessuna sottocategoria per questa voce.</p>'
              : `<select id="form-subcategory">${subs.map((s) => `<option value="${esc(s)}" ${s === state.formSubcategory ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>`}
          </div>
        </div>

        <div class="field">
          <label>Descrizione (opzionale)</label>
          <input type="text" id="form-description" placeholder="Es. spesa settimanale" value="${esc(descVal)}">
        </div>

        <div class="field">
          <label>Data</label>
          <input type="date" id="form-date" value="${esc(dateVal)}">
        </div>

        <button type="submit" class="btn-primary">${isEditing ? 'Salva modifiche' : 'Aggiungi movimento'}</button>
      </form>
    </div>
  `;
}

function renderTransazioniTab() {
  const list = state.transactions
    .filter((t) => state.filterType === 'all' || t.type === state.filterType)
    .filter((t) => state.filterCategory === 'all' || t.category === state.filterCategory)
    .sort((a, b) => b.date.localeCompare(a.date));
  const catOptions = state.filterType !== 'all' ? catKeys(state.filterType) : [];

  return `
    <div class="stack max-w">
      <div class="filters">
        <select id="filter-type">
          <option value="all" ${state.filterType === 'all' ? 'selected' : ''}>Tutti i movimenti</option>
          <option value="expense" ${state.filterType === 'expense' ? 'selected' : ''}>Solo uscite</option>
          <option value="income" ${state.filterType === 'income' ? 'selected' : ''}>Solo entrate</option>
        </select>
        ${state.filterType !== 'all' ? `
          <select id="filter-category">
            <option value="all">Tutte le categorie</option>
            ${catOptions.map((c) => `<option value="${esc(c)}" ${c === state.filterCategory ? 'selected' : ''}>${esc(c)}</option>`).join('')}
          </select>` : ''}
      </div>
      ${list.length === 0 ? '<p class="empty">Nessun movimento trovato.</p>' : ''}
      <div class="tx-list">
        ${list.map((t) => `
          <div class="tx-row ${t.type === 'income' ? 'border-income' : 'border-expense'}">
            <div class="tx-icon ${t.type === 'income' ? 'bg-income' : 'bg-expense'}">${categoryIcon(t.category)}</div>
            <div class="tx-info">
              <div class="tx-desc">${esc(t.description || t.subcategory)}</div>
              <div class="tx-meta">${esc(t.category)} · ${esc(t.subcategory)} · ${formatDateShort(t.date)}</div>
            </div>
            <div class="tx-amount mono ${t.type === 'income' ? 'text-income' : 'text-expense'}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</div>
            <div class="tx-actions">
              <button type="button" data-action="edit-tx" data-id="${t.id}" aria-label="Modifica">${ICONS.pencil}</button>
              <button type="button" data-action="delete-tx" data-id="${t.id}" aria-label="Elimina">${ICONS.trash}</button>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
}

function renderRiepilogoTab() {
  const now = new Date();
  const periodTx = state.period === 'all' ? state.transactions : state.transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const income = periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const map = {};
  periodTx.filter((t) => t.type === 'expense').forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
  const chartData = Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return `
    <div class="stack max-w">
      <div class="period-toggle">
        <button type="button" class="period-btn ${state.period === 'month' ? 'active' : ''}" data-period="month">Questo mese</button>
        <button type="button" class="period-btn ${state.period === 'all' ? 'active' : ''}" data-period="all">Da sempre</button>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="summary-label text-income">${ICONS.arrowUp}Entrate</div>
          <div class="summary-amount mono">${formatCurrency(income)}</div>
        </div>
        <div class="card">
          <div class="summary-label text-expense">${ICONS.arrowDown}Uscite</div>
          <div class="summary-amount mono">${formatCurrency(expense)}</div>
        </div>
      </div>
      ${state.period === 'month' && Object.keys(state.budgets).length > 0 ? `
        <div class="card">
          <div class="card-title">Budget del mese</div>
          <div class="stack-sm">
            ${Object.entries(state.budgets).map(([cat, budget]) => {
              const spent = map[cat] || 0;
              const pct = Math.min(100, Math.round((spent / budget) * 100));
              const over = spent > budget;
              return `
                <div>
                  <div class="row-between" style="margin-bottom:4px;">
                    <span style="font-size:13px;">${esc(cat)}</span>
                    <span class="mono" style="font-size:13px;">${formatCurrency(spent)} / ${formatCurrency(budget)}</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill ${over ? 'over' : (pct >= 80 ? 'near' : 'ok')}" style="width:${pct}%;"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>` : ''}
      <div class="card">
        <div class="card-title">Uscite per categoria</div>
        ${chartData.length === 0 ? '<p class="empty">Nessuna uscita nel periodo selezionato.</p>' : `
          <div class="pie-wrap">${buildPieSVG(chartData)}</div>
          <div class="legend">
            ${chartData.map((d, i) => `
              <div class="legend-row">
                <span class="legend-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>
                <span class="legend-name">${esc(d.name)}</span>
                <span class="legend-value mono">${formatCurrency(d.value)}</span>
              </div>`).join('')}
          </div>`}
      </div>
    </div>
  `;
}

function renderCategorieTab() {
  const section = (type) => `
    <div>
      <h2 class="section-title">${type === 'expense' ? 'Categorie di uscita' : 'Categorie di entrata'}</h2>
      <div class="stack-sm">
        ${Object.entries(state.categories[type] || {}).map(([cat, subs]) => `
          <div class="cat-card">
            <div class="row-between">
              <div class="cat-name">${categoryIcon(cat)}${esc(cat)}</div>
              <button type="button" data-action="delete-cat" data-type="${type}" data-cat="${esc(cat)}" aria-label="Elimina categoria">${ICONS.trash}</button>
            </div>
            ${type === 'expense' ? `
              <div class="budget-row">
                <span class="hint" style="margin:0;">Budget mensile</span>
                <input type="number" min="0" step="1" class="budget-input" data-cat="${esc(cat)}" placeholder="nessuno" value="${state.budgets[cat] || ''}">
              </div>` : ''}
            <div class="chips">
              ${subs.map((s) => `
                <span class="chip">${esc(s)}<button type="button" data-action="delete-sub" data-type="${type}" data-cat="${esc(cat)}" data-sub="${esc(s)}" aria-label="Rimuovi">${ICONS.x}</button></span>`).join('')}
              ${state.subInputFor && state.subInputFor.type === type && state.subInputFor.cat === cat ? `
                <span class="chip-input">
                  <input type="text" id="new-sub-input" placeholder="Nome" autofocus>
                  <button type="button" data-action="confirm-sub">${ICONS.check}</button>
                </span>` : `
                <button type="button" class="chip-add" data-action="open-sub-input" data-type="${type}" data-cat="${esc(cat)}">+ sottocategoria</button>`}
            </div>
          </div>`).join('')}
      </div>
      <div class="add-cat-row">
        <input type="text" id="new-cat-input-${type}" placeholder="Nuova categoria...">
        <button type="button" data-action="add-cat" data-type="${type}">Aggiungi</button>
      </div>
    </div>
  `;
  return `<div class="stack max-w">${section('expense')}${section('income')}</div>`;
}

function renderApp() {
  updateBalanceHeader();
  setActiveNav();
  const main = document.getElementById('main-content');
  if (state.tab === 'aggiungi') main.innerHTML = renderAggiungiTab();
  else if (state.tab === 'transazioni') main.innerHTML = renderTransazioniTab();
  else if (state.tab === 'riepilogo') main.innerHTML = renderRiepilogoTab();
  else if (state.tab === 'categorie') main.innerHTML = renderCategorieTab();
  else if (state.tab === 'backup') main.innerHTML = renderBackupTab();
}

/* ---------- Event delegation ---------- */

function attachGlobalHandlers() {
  const main = document.getElementById('main-content');

  main.addEventListener('click', (e) => {
    if (e.target.closest('#mic-btn')) { startListening(); return; }

    const typeBtn = e.target.closest('.type-btn');
    if (typeBtn) { syncFormInputsToState(); state.formType = typeBtn.dataset.type; renderApp(); return; }

    const periodBtn = e.target.closest('.period-btn');
    if (periodBtn) { state.period = periodBtn.dataset.period; renderApp(); return; }

    if (e.target.closest('#cancel-edit-btn')) { cancelEdit(); return; }

    const editBtn = e.target.closest('[data-action="edit-tx"]');
    if (editBtn) { startEdit(editBtn.dataset.id); return; }

    const delBtn = e.target.closest('[data-action="delete-tx"]');
    if (delBtn) { deleteTransaction(delBtn.dataset.id); return; }

    const delCat = e.target.closest('[data-action="delete-cat"]');
    if (delCat) { deleteCategory(delCat.dataset.type, delCat.dataset.cat); return; }

    const delSub = e.target.closest('[data-action="delete-sub"]');
    if (delSub) { deleteSubcategory(delSub.dataset.type, delSub.dataset.cat, delSub.dataset.sub); return; }

    const openSub = e.target.closest('[data-action="open-sub-input"]');
    if (openSub) { state.subInputFor = { type: openSub.dataset.type, cat: openSub.dataset.cat }; renderApp(); return; }

    if (e.target.closest('[data-action="confirm-sub"]')) { confirmAddSubcategory(); return; }

    const addCatBtn = e.target.closest('[data-action="add-cat"]');
    if (addCatBtn) { addCategory(addCatBtn.dataset.type); return; }

    if (e.target.closest('[data-action="export-backup"]')) { exportBackup(); return; }
    if (e.target.closest('[data-action="trigger-import"]')) { triggerImport(); return; }
  });

  main.addEventListener('change', (e) => {
    if (e.target.id === 'form-category') { syncFormInputsToState(); state.formCategory = e.target.value; renderApp(); }
    else if (e.target.id === 'form-subcategory') { state.formSubcategory = e.target.value; }
    else if (e.target.id === 'filter-type') { state.filterType = e.target.value; state.filterCategory = 'all'; renderApp(); }
    else if (e.target.id === 'filter-category') { state.filterCategory = e.target.value; renderApp(); }
    else if (e.target.id === 'import-file-input') { handleImportFile(e); }
    else if (e.target.classList.contains('budget-input')) { setBudget(e.target.dataset.cat, e.target.value); }
  });

  main.addEventListener('submit', (e) => {
    if (e.target.id === 'tx-form') handleFormSubmit(e);
  });

  main.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'new-sub-input') { e.preventDefault(); confirmAddSubcategory(); }
    else if (e.target.id && e.target.id.startsWith('new-cat-input-')) {
      e.preventDefault();
      addCategory(e.target.id.replace('new-cat-input-', ''));
    }
  });

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      syncFormInputsToState();
      state.tab = btn.dataset.tab;
      renderApp();
    });
  });
}

/* ---------- Avvio ---------- */

function init() {
  loadState();
  loadBackupState();
  attachGlobalHandlers();
  renderApp();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => console.error('Registrazione service worker non riuscita', err));
    });
  }
}
document.addEventListener('DOMContentLoaded', init);
