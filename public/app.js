'use strict';

// ── State ──────────────────────────────────────────────────────
const API = '';
let lastResult = null;
let foodsData = [];
let macrosExpanded = false;
let sessionAnalyzed = 0;

// ── Toast System ───────────────────────────────────────────────
function toast(msg, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icons[type] || ''} ${msg}</span><button class="toast-dismiss">✕</button>`;
  el.querySelector('.toast-dismiss').addEventListener('click', () => dismissToast(el));
  container.appendChild(el);
  setTimeout(() => dismissToast(el), duration);
}

function dismissToast(el) {
  el.style.animation = 'toastOut 0.2s ease forwards';
  setTimeout(() => el.remove(), 220);
}

// ── Navigation ─────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard', analyze: 'Analyze Food',
  plan: 'Meal Plan', foods: 'Food Database', history: 'Request History'
};

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  document.getElementById('topbar-title').textContent = PAGE_TITLES[page] || page;
  if (page === 'foods') loadFoods();
  if (page === 'history') loadHistory();
}

// ── Auth ───────────────────────────────────────────────────────
function initAuth() {
  const name = localStorage.getItem('ns_name');
  if (name) showApp(name);
  else document.getElementById('login-screen').classList.remove('hidden');
}

function handleLogin() {
  const inp = document.getElementById('login-name');
  const name = inp.value.trim();
  if (!name) { inp.classList.add('invalid'); inp.focus(); return; }
  localStorage.setItem('ns_name', name);
  showApp(name);
}

function showApp(name) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.add('visible');
  document.getElementById('sidebar-avatar').textContent = name[0].toUpperCase();
  document.getElementById('sidebar-name').textContent = name;
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dash-greeting').textContent = `${greet}, ${name} 👋`;
}

function handleLogout() {
  localStorage.removeItem('ns_name');
  location.reload();
}

// ── API Health Check ───────────────────────────────────────────
async function checkHealth() {
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-text');
  const statApi = document.getElementById('stat-api');
  const statVer = document.getElementById('stat-version');
  dot.className = 'status-dot checking';
  txt.textContent = 'Connecting…';
  try {
    const r = await fetch(API + '/api/health', { signal: AbortSignal.timeout(5000) });
    const d = await r.json();
    dot.className = 'status-dot healthy';
    txt.textContent = `Online · v${d.version}`;
    if (statApi) statApi.textContent = '🟢 Online';
    if (statVer) statVer.textContent = `v${d.version} · uptime ${Math.floor(d.uptime)}s`;
    // Fetch food count for dashboard
    fetchFoodCount();
  } catch {
    dot.className = 'status-dot error';
    txt.textContent = 'API unreachable';
    if (statApi) statApi.textContent = '🔴 Offline';
  }
}

async function fetchFoodCount() {
  try {
    const r = await fetch(API + '/api/nutrition/foods');
    const d = await r.json();
    const el = document.getElementById('stat-db');
    if (el) el.textContent = d.count || '—';
  } catch {}
}

// ── Validation ─────────────────────────────────────────────────
function setFieldState(el, valid, errId, msg) {
  if (!el) return;
  el.classList.toggle('invalid', !valid);
  el.classList.toggle('valid', valid && el.value.length > 0);
  const errEl = document.getElementById(errId);
  if (errEl) { errEl.textContent = msg || errEl.textContent; errEl.classList.toggle('show', !valid && el.value.length > 0); }
}

function validateNum(el, errId, min, max) {
  if (!el || !el.value) { el?.classList.remove('invalid', 'valid'); document.getElementById(errId)?.classList.remove('show'); return true; }
  const v = parseFloat(el.value);
  const ok = v >= min && v <= max;
  setFieldState(el, ok, errId, `Must be ${min}–${max}`);
  return ok;
}

function hasValidationErrors() {
  return document.querySelectorAll('#page-analyze .field-error.show').length > 0;
}

// ── Image Upload ───────────────────────────────────────────────
function handleImageUpload(input) {
  const errEl = document.getElementById('err-image');
  if (errEl) errEl.classList.remove('show');
  const file = input.files[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    if (errEl) { errEl.textContent = 'Invalid type. Use JPG, PNG, WebP, or GIF.'; errEl.classList.add('show'); }
    input.value = ''; return;
  }
  if (file.size > 5 * 1024 * 1024) {
    if (errEl) { errEl.textContent = 'Too large. Max 5MB.'; errEl.classList.add('show'); }
    input.value = ''; return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('preview-img').src = e.target.result;
    document.getElementById('upload-preview').style.display = 'block';
    document.getElementById('upload-zone').style.borderColor = 'var(--green)';
    document.getElementById('food-name-err')?.classList.remove('show');
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  document.getElementById('food-image').value = '';
  document.getElementById('upload-preview').style.display = 'none';
  document.getElementById('upload-zone').style.borderColor = '';
}

// ── Macro Toggle ───────────────────────────────────────────────
function toggleMacros() {
  macrosExpanded = !macrosExpanded;
  document.getElementById('macro-inputs').style.display = macrosExpanded ? 'block' : 'none';
  const icon = document.getElementById('macro-toggle-icon');
  icon.textContent = macrosExpanded ? '▼' : '▶';
  icon.classList.toggle('open', macrosExpanded);
}

// ── ANALYZE ────────────────────────────────────────────────────
async function analyzeFood() {
  const foodNameEl = document.getElementById('food-name');
  const imageInput = document.getElementById('food-image');
  const foodName = foodNameEl.value.trim();
  const imageFile = imageInput.files[0];

  // Validate required fields
  if (!foodName && !imageFile) {
    foodNameEl.classList.add('invalid');
    document.getElementById('food-name-err').classList.add('show');
    showInlineError('analyze-error', 'Please enter a food name or upload an image.');
    return;
  }
  if (hasValidationErrors()) {
    showInlineError('analyze-error', 'Fix validation errors before submitting.');
    return;
  }

  setLoading('analyze-loader', true);
  document.getElementById('result-placeholder').style.display = 'none';
  document.getElementById('analyze-error').innerHTML = '';
  document.getElementById('result-area').classList.remove('show');

  try {
    const fd = new FormData();
    if (imageFile) fd.append('image', imageFile);
    if (foodName) fd.append('foodName', foodName);
    const qty = document.getElementById('quantity').value.trim();
    if (qty) fd.append('quantity', qty);
    fd.append('dietPreference', document.getElementById('diet-pref').value);
    fd.append('healthCondition', document.getElementById('health-cond').value);
    fd.append('activityLevel', document.getElementById('activity').value);
    const age = document.getElementById('age').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    if (age) fd.append('age', age);
    if (weight) fd.append('weight', weight);
    if (height) fd.append('height', height);

    // Build macroGoals if any filled
    const mgCal = document.getElementById('mg-calories').value;
    const mgProt = document.getElementById('mg-protein').value;
    const mgCarbs = document.getElementById('mg-carbs').value;
    const mgFats = document.getElementById('mg-fats').value;
    const mg = {};
    if (mgCal) mg.calories = +mgCal;
    if (mgProt) mg.protein = +mgProt;
    if (mgCarbs) mg.carbs = +mgCarbs;
    if (mgFats) mg.fats = +mgFats;
    if (Object.keys(mg).length) fd.append('macroGoals', JSON.stringify(mg));

    const res = await fetch(API + '/api/nutrition/analyze', { method: 'POST', body: fd });
    const data = await res.json();

    if (!res.ok || !data.success) {
      const msg = data.error?.message || 'Analysis failed';
      showInlineError('analyze-error', msg);
      toast(msg, 'error');
      return;
    }

    lastResult = data;
    sessionAnalyzed++;
    document.getElementById('stat-analyzed').textContent = sessionAnalyzed;
    renderResult(data);
    if (data.warning) toast(data.warning, 'info');
    else toast('Analysis complete!', 'success');

  } catch {
    showInlineError('analyze-error', 'Network error — is the API running?');
    toast('Network error', 'error');
  } finally {
    setLoading('analyze-loader', false);
  }
}

function renderResult(data) {
  const f = data.food;
  const n = f.nutrition;
  const label = (f.healthScoreLabel || 'moderate').toLowerCase();

  // Score ring
  const score = f.healthScore || 0;
  const circumference = 169.6;
  const offset = circumference - (score / 100) * circumference;
  const fill = document.getElementById('score-ring-fill');
  fill.className = `score-ring-fill ${label}`;
  fill.style.strokeDashoffset = circumference; // reset for animation
  requestAnimationFrame(() => { fill.style.strokeDashoffset = offset; });

  document.getElementById('score-num').textContent = score;
  document.getElementById('res-food-name').textContent = f.name;
  document.getElementById('res-quantity').textContent = f.quantity || '—';

  const verdict = document.getElementById('score-verdict');
  verdict.className = `score-verdict ${label}`;
  verdict.textContent = { excellent: '⭐ Excellent', good: '✅ Good', moderate: '⚠️ Moderate', poor: '❌ Poor' }[label] || f.healthScoreLabel;

  const srcBadge = document.getElementById('res-source');
  srcBadge.className = `source-badge ${f.source}`;
  srcBadge.textContent = f.source === 'database' ? 'DB' : 'Estimated';

  // Macros
  document.getElementById('m-calories').textContent = n.calories ?? '—';
  document.getElementById('m-protein').textContent = n.protein ?? '—';
  document.getElementById('m-carbs').textContent = n.carbs ?? '—';
  document.getElementById('m-fats').textContent = n.fats ?? '—';
  document.getElementById('m-fiber').textContent = n.fiber ?? '—';
  document.getElementById('m-sugar').textContent = n.sugar ?? '—';

  // Vitamins & Minerals
  const badges = document.getElementById('micro-badges');
  badges.innerHTML = '';
  (f.vitamins || []).forEach(v => {
    const s = document.createElement('span');
    s.className = 'micro-badge vitamin';
    s.textContent = 'Vit ' + v;
    badges.appendChild(s);
  });
  (f.minerals || []).forEach(m => {
    const s = document.createElement('span');
    s.className = 'micro-badge mineral';
    s.textContent = m;
    badges.appendChild(s);
  });

  // Coverage
  const covCard = document.getElementById('coverage-card');
  if (data.personalization?.coveragePercent) {
    covCard.style.display = '';
    const cov = data.personalization.coveragePercent;
    const grid = document.getElementById('coverage-grid');
    grid.innerHTML = ['calories', 'protein', 'carbs', 'fats'].map(k => {
      const pct = Math.min(cov[k] || 0, 100);
      const cls = pct < 20 ? 'low' : pct < 60 ? 'mid' : 'high';
      return `<div class="coverage-item">
        <div class="coverage-header"><span>${k.charAt(0).toUpperCase()+k.slice(1)}</span><span>${cov[k]}%</span></div>
        <div class="coverage-bar-bg"><div class="coverage-bar-fill ${cls}" style="width:${pct}%"></div></div>
      </div>`;
    }).join('');
  } else {
    covCard.style.display = 'none';
  }

  // Recommendations
  const recList = document.getElementById('rec-list');
  recList.innerHTML = (data.recommendations || []).map(r => {
    const cls = r.includes('High') || r.includes('Low') ? 'warn' : '';
    return `<div class="rec-item ${cls}">💡 ${r}</div>`;
  }).join('');

  document.getElementById('result-area').classList.add('show');
}

// ── MEAL PLAN ──────────────────────────────────────────────────
async function generatePlan() {
  const body = {
    dietPreference: document.getElementById('plan-diet').value,
    healthCondition: document.getElementById('plan-health').value,
    activityLevel: document.getElementById('plan-activity').value,
    days: +document.getElementById('plan-days').value,
  };
  const age = document.getElementById('plan-age').value;
  const weight = document.getElementById('plan-weight').value;
  const height = document.getElementById('plan-height').value;
  if (age) body.age = +age;
  if (weight) body.weight = +weight;
  if (height) body.height = +height;

  setLoading('plan-loader', true);
  document.getElementById('plan-placeholder').style.display = 'none';
  document.getElementById('plan-error').innerHTML = '';
  document.getElementById('plan-result-area').innerHTML = '';

  try {
    const res = await fetch(API + '/api/nutrition/plan', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      showInlineError('plan-error', data.error?.message || 'Failed to generate plan');
      toast('Plan generation failed', 'error');
      return;
    }
    renderPlan(data);
    toast('Meal plan generated!', 'success');
  } catch {
    showInlineError('plan-error', 'Network error');
    toast('Network error', 'error');
  } finally {
    setLoading('plan-loader', false);
  }
}

function renderPlan(data) {
  const m = data.dailyMacros;
  const area = document.getElementById('plan-result-area');

  const summaryHtml = `
    <div class="card" style="margin-bottom:16px">
      <div class="card-title">Your Daily Targets</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px">
        <div class="nutrition-card calories"><div class="nutrition-label">Calories</div><div class="nutrition-value">${m.calories}</div><div class="nutrition-unit">kcal</div></div>
        <div class="nutrition-card protein"><div class="nutrition-label">Protein</div><div class="nutrition-value">${m.protein}</div><div class="nutrition-unit">g</div></div>
        <div class="nutrition-card carbs"><div class="nutrition-label">Carbs</div><div class="nutrition-value">${m.carbs}</div><div class="nutrition-unit">g</div></div>
        <div class="nutrition-card fats"><div class="nutrition-label">Fats</div><div class="nutrition-value">${m.fats}</div><div class="nutrition-unit">g</div></div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div class="alert alert-success" style="flex:1;min-width:200px">💧 ${data.hydration}</div>
        ${m.note ? `<div class="alert alert-warn" style="flex:1;min-width:200px">⚠️ ${m.note}</div>` : ''}
      </div>
    </div>`;

  const daysHtml = (data.mealPlan || []).map(day => `
    <div class="day-card">
      <div class="day-header">
        <span class="day-title">Day ${day.day}</span>
        <div class="macro-pills">
          <span class="macro-pill kcal">${day.estimatedMacros.calories} kcal</span>
          <span class="macro-pill prot">${day.estimatedMacros.protein} protein</span>
          <span class="macro-pill carb">${day.estimatedMacros.carbs} carbs</span>
          <span class="macro-pill fat">${day.estimatedMacros.fats} fats</span>
        </div>
      </div>
      <div class="day-meals">
        <div class="meal-row"><span class="meal-type">🌅 Breakfast</span><span class="meal-desc">${day.breakfast}</span></div>
        <div class="meal-row"><span class="meal-type">☀️ Lunch</span><span class="meal-desc">${day.lunch}</span></div>
        <div class="meal-row"><span class="meal-type">🌙 Dinner</span><span class="meal-desc">${day.dinner}</span></div>
        <div class="meal-row"><span class="meal-type">🍎 Snacks</span><span class="meal-desc">${(day.snacks || []).join(', ')}</span></div>
      </div>
    </div>`).join('');

  const tipsHtml = data.generalTips?.length ? `
    <div class="card" style="margin-top:16px">
      <div class="card-title">General Tips</div>
      <div class="rec-list">
        ${data.generalTips.map(t => `<div class="rec-item">💡 ${t}</div>`).join('')}
      </div>
    </div>` : '';

  const exportHtml = `<div class="export-row" style="margin-top:12px">
    <button class="btn btn-secondary btn-sm" onclick="exportPlan()">⬇ Export Plan JSON</button>
  </div>`;

  area.innerHTML = summaryHtml + daysHtml + tipsHtml + exportHtml;
  window._lastPlan = data;
}

function exportPlan() {
  if (!window._lastPlan) return;
  const blob = new Blob([JSON.stringify(window._lastPlan, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'meal-plan.json'; a.click();
  URL.revokeObjectURL(url);
  toast('Plan exported!', 'success');
}

// ── FOOD DATABASE ──────────────────────────────────────────────
async function loadFoods() {
  if (foodsData.length) { renderFoodTable(foodsData); return; } // cache
  const loader = document.getElementById('foods-loader');
  try {
    const res = await fetch(API + '/api/nutrition/foods');
    const data = await res.json();
    foodsData = data.foods || [];
    renderFoodTable(foodsData);
  } catch {
    const wrap = document.getElementById('food-table-wrap');
    if (wrap) wrap.innerHTML = '<div class="alert alert-error">Failed to load food database</div>';
  }
}

function renderFoodTable(foods) {
  const loader = document.getElementById('foods-loader');
  if (loader) loader.style.display = 'none';
  const wrap = document.getElementById('food-table-wrap');
  if (!wrap) return;

  if (!foods.length) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No foods match your search</div></div>';
    return;
  }

  let html = `<table class="food-table">
    <thead><tr><th>#</th><th>Food</th><th>Calories /100g</th><th>Protein /100g</th><th></th></tr></thead>
    <tbody>`;
  foods.forEach((f, i) => {
    html += `<tr>
      <td style="color:var(--text3)">${i + 1}</td>
      <td style="color:var(--text);font-weight:500;text-transform:capitalize">${f.name}</td>
      <td><span class="macro-pill kcal" style="font-size:12px">${f.calories} kcal</span></td>
      <td><span class="macro-pill prot" style="font-size:12px">${f.protein}g</span></td>
      <td><button class="btn btn-secondary btn-sm quick-btn" data-food="${f.name}">Analyze →</button></td>
    </tr>`;
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;

  wrap.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const food = btn.dataset.food;
      navigate('analyze');
      document.getElementById('food-name').value = food;
    });
  });
}

// ── HISTORY ────────────────────────────────────────────────────
async function loadHistory() {
  const el = document.getElementById('history-list');
  el.innerHTML = '<div class="loader show"><div class="spinner"></div></div>';
  try {
    const res = await fetch(API + '/api/history');
    const data = await res.json();
    const hist = data.history || [];
    if (!hist.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">🕑</div><div class="empty-text">No requests yet</div></div>';
      return;
    }
    el.innerHTML = hist.map(r => {
      const methodCls = { GET: 'get', POST: 'post', DELETE: 'delete' }[r.method] || 'get';
      const statusCls = r.statusCode < 400 ? 'ok' : 'err';
      const time = new Date(r.timestamp).toLocaleTimeString();
      return `<div class="history-item">
        <span class="history-method ${methodCls}">${r.method}</span>
        <span class="history-path">${r.path}</span>
        <span class="history-status ${statusCls}">${r.statusCode}</span>
        <span class="history-time">${r.duration}</span>
        <span class="history-time">${time}</span>
      </div>`;
    }).join('');
  } catch {
    el.innerHTML = '<div class="alert alert-error">Failed to load history</div>';
  }
}

async function clearHistory() {
  try {
    const res = await fetch(API + '/api/history', { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { toast('History cleared', 'success'); loadHistory(); }
  } catch { toast('Failed to clear history', 'error'); }
}

// ── UTILS ──────────────────────────────────────────────────────
function setLoading(id, on) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show', on);
}

function showInlineError(containerId, msg) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="alert alert-error" style="margin-bottom:14px">❌ ${msg}</div>`;
}

function exportResult() {
  if (!lastResult) { toast('No result to export', 'info'); return; }
  const blob = new Blob([JSON.stringify(lastResult, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'nutriscan-result.json'; a.click();
  URL.revokeObjectURL(url);
  toast('Exported!', 'success');
}

async function copyResult() {
  if (!lastResult) { toast('No result to copy', 'info'); return; }
  try {
    await navigator.clipboard.writeText(JSON.stringify(lastResult, null, 2));
    toast('Copied to clipboard!', 'success');
  } catch { toast('Copy failed', 'error'); }
}

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  checkHealth();
  setInterval(checkHealth, 30000);

  // Login
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('login-name').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });

  // API status
  document.getElementById('api-status-btn').addEventListener('click', checkHealth);

  // ── Analyze page ──
  document.getElementById('analyze-btn').addEventListener('click', analyzeFood);
  document.getElementById('food-image').addEventListener('change', e => handleImageUpload(e.target));
  document.getElementById('remove-preview-btn').addEventListener('click', removeImage);
  document.getElementById('macro-toggle').addEventListener('click', toggleMacros);
  document.getElementById('export-json-btn').addEventListener('click', exportResult);
  document.getElementById('copy-clipboard-btn').addEventListener('click', copyResult);

  // Food name validation
  const fn = document.getElementById('food-name');
  const fi = document.getElementById('food-image');
  const fnErr = document.getElementById('food-name-err');
  fn.addEventListener('input', () => {
    const ok = fn.value.trim().length > 0 || fi.files.length > 0;
    fn.classList.toggle('invalid', !ok);
    fnErr.classList.toggle('show', !ok);
  });

  // Number validation
  [['age', 'age-err', 1, 120], ['weight', 'weight-err', 1, 500], ['height', 'height-err', 50, 300]].forEach(([id, err, min, max]) => {
    document.getElementById(id)?.addEventListener('input', function () { validateNum(this, err, min, max); });
  });

  // Drag and drop
  const zone = document.getElementById('upload-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      fi.files = e.dataTransfer.files;
      handleImageUpload(fi);
    }
  });

  // ── Plan page ──
  document.getElementById('plan-btn').addEventListener('click', generatePlan);

  // ── Foods page ──
  document.getElementById('food-search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    renderFoodTable(q ? foodsData.filter(f => f.name.includes(q)) : foodsData);
  });

  // ── History page ──
  document.getElementById('history-refresh-btn').addEventListener('click', loadHistory);
  document.getElementById('history-clear-btn').addEventListener('click', clearHistory);
});
