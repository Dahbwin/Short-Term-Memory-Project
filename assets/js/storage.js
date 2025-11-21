/* storage.js — simple wrapper around localStorage for rounds and settings (moved) */
const KEY_ROUNDS = 'nst_rounds_v1';
const KEY_SETTINGS = 'nst_settings_v1';

function loadRounds(){
  try{
    const raw = localStorage.getItem(KEY_ROUNDS);
    if (!raw) return [];
    return JSON.parse(raw);
  }catch(e){ console.error('loadRounds',e); return []; }
}

function saveRound(obj){
  const arr = loadRounds();
  arr.push(obj);
  localStorage.setItem(KEY_ROUNDS, JSON.stringify(arr));
}

function loadSettings(){
  try{ const raw = localStorage.getItem(KEY_SETTINGS); return raw?JSON.parse(raw):{};}catch(e){return{}}}

function saveSettings(obj){ localStorage.setItem(KEY_SETTINGS, JSON.stringify(obj)); }

export { loadRounds, saveRound, loadSettings, saveSettings };
