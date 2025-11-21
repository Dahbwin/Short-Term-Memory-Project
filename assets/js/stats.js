// stats.js - Statistics page with theme and i18n support
import { loadRounds } from './storage.js';
import { initTheme, toggleTheme } from './theme.js';
import { initI18n, t } from './i18n.js';

// Initialize theme immediately
initTheme();

function render(){
  const rounds = loadRounds();
  const tbody = document.querySelector('#rounds-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (rounds.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.className = 'muted';
    td.textContent = t('stats_no_data');
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  
  rounds.forEach(r => {
    const tr = document.createElement('tr');
    const ts = document.createElement('td'); ts.textContent = new Date(r.ts).toLocaleString();
    const diff = document.createElement('td'); 
    const diffMap = { '1': 'Easy', '2': 'Medium', '3': 'Hard', '4': 'Very Hard' };
    diff.textContent = diffMap[r.difficulty] || r.difficulty;
    const items = document.createElement('td'); items.textContent = (r.key||[]).length;
    const time = document.createElement('td'); time.textContent = r.result && r.result.elapsed ? r.result.elapsed.toFixed(2) : '';
    const errors = document.createElement('td'); errors.textContent = r.result ? r.result.errors : '';
    const res = document.createElement('td'); res.textContent = r.result && r.result.correct ? '✓' : '✗';
    res.className = r.result && r.result.correct ? 'success' : 'error';
    tr.append(ts,diff,items,time,errors,res);
    tbody.appendChild(tr);
  });
  
  // Update KPIs
  const kpiRow = document.getElementById('kpi-row');
  if (kpiRow && rounds.length > 0) {
    const totalRounds = rounds.length;
    const accuracies = rounds.map(r => {
      if (!r.result || !r.result.details) return 0;
      const total = r.result.details.length;
      const correct = total - r.result.errors;
      return total > 0 ? (correct / total) * 100 : 0;
    });
    const avgAccuracy = accuracies.reduce((a,b) => a+b, 0) / accuracies.length;
    const bestTime = Math.min(...rounds.map(r => r.result?.elapsed || Infinity));
    
    kpiRow.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-value">${totalRounds}</div>
        <div class="kpi-label">${t('stats_total_rounds')}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${avgAccuracy.toFixed(1)}%</div>
        <div class="kpi-label">${t('stats_accuracy_avg')}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${bestTime < Infinity ? bestTime.toFixed(2) + 's' : '—'}</div>
        <div class="kpi-label">${t('stats_best_time')}</div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initI18n();
  
  // Setup theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      toggleTheme();
      render(); // Re-render to apply translations
    });
  }
  
  render();
});
