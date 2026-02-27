/**
 * Floating Wallet Widget
 * Self-injecting, entirely client-side. The server never sees the private key.
 * Reads/writes only to localStorage at this origin.
 *
 * Proactive warnings:
 *  - Key age > WW_AGE_WARN_DAYS  → yellow
 *  - Key age > WW_AGE_CRIT_DAYS  → red + pulse
 *  - USDC balance > WW_BAL_WARN  → yellow
 *  - USDC balance > WW_BAL_CRIT  → red + pulse
 */

// ─── Config ────────────────────────────────────────────────────────────────────
const WW_KEY            = 'x402:wallet:v1';
const WW_AGE_WARN_DAYS  = 30;
const WW_AGE_CRIT_DAYS  = 90;
const WW_BAL_WARN_USDC  = 10;
const WW_BAL_CRIT_USDC  = 50;

// Base Sepolia testnet — swap to mainnet values when going live
const RPC_URL       = 'https://sepolia.base.org';
const USDC_CONTRACT = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// ─── Storage (localStorage only, never touches network) ────────────────────────
const wwLoad  = () => { try { return JSON.parse(localStorage.getItem(WW_KEY)); } catch { return null; } };
const wwSave  = (key, address) => localStorage.setItem(WW_KEY, JSON.stringify({ key, address, savedAt: Date.now() }));
const wwClear = () => localStorage.removeItem(WW_KEY);

// ─── Helpers ───────────────────────────────────────────────────────────────────
const wwMask    = (k) => k ? k.slice(0, 6) + '•'.repeat(48) + k.slice(-4) : '';
const wwShorten = (a) => a ? a.slice(0, 8) + '…' + a.slice(-6) : '';
const wwAgeDays = (ts) => (Date.now() - ts) / 86_400_000;

// ─── Balance fetch (pure browser → public Base RPC) ───────────────────────────
let _balCache = null;   // { usdc, ts }
async function fetchBalance(address) {
  if (_balCache && Date.now() - _balCache.ts < 60_000) return _balCache.usdc;
  try {
    const data = '0x70a08231' + address.slice(2).toLowerCase().padStart(64, '0');
    const res  = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_call',
        params: [{ to: USDC_CONTRACT, data }, 'latest'], id: 1 }),
    });
    const { result } = await res.json();
    const usdc = parseInt(result, 16) / 1e6;
    _balCache = { usdc, ts: Date.now() };
    return usdc;
  } catch { return null; }
}

// ─── Status computation ────────────────────────────────────────────────────────
function computeStatus(stored, balUsdc) {
  if (!stored) return { level: 'none', warnings: [] };
  const warnings = [];
  let level = 'ok';

  const ageDays = wwAgeDays(stored.savedAt);
  if (ageDays >= WW_AGE_CRIT_DAYS) {
    warnings.push(`Key is ${Math.floor(ageDays)} days old — rotate now`);
    level = 'critical';
  } else if (ageDays >= WW_AGE_WARN_DAYS) {
    warnings.push(`Key is ${Math.floor(ageDays)} days old — consider rotating`);
    if (level === 'ok') level = 'warn';
  }

  if (balUsdc != null) {
    if (balUsdc >= WW_BAL_CRIT_USDC) {
      warnings.push(`Balance ${balUsdc.toFixed(2)} USDC — move funds to safer storage`);
      level = 'critical';
    } else if (balUsdc >= WW_BAL_WARN_USDC) {
      warnings.push(`Balance ${balUsdc.toFixed(2)} USDC — consider moving some funds`);
      if (level === 'ok') level = 'warn';
    }
  }

  return { level, warnings };
}

// ─── Inject CSS ────────────────────────────────────────────────────────────────
function injectCSS() {
  const s = document.createElement('style');
  s.textContent = `
:root {
  --ww-green:  #166534;
  --ww-yellow: #92400e;
  --ww-red:    #991b1b;
  --ww-bg-y:   #fffbeb;
  --ww-bg-r:   #fff5f5;
  --ww-border: #e2e8f0;
  --ww-shadow: 0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
}

#ww-root {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
}

/* ── Pill ──────────────────────────────────────────────────── */
#ww-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px 8px 11px;
  background: #fff;
  border: 1.5px solid var(--ww-border);
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
  cursor: pointer;
  transition: box-shadow .15s, border-color .15s;
  white-space: nowrap;
  color: #1a1a1a;
  font-weight: 500;
  line-height: 1;
}
#ww-pill:hover { box-shadow: 0 6px 16px rgba(0,0,0,.14); }

#ww-pill.ww-warn  { border-color: #f59e0b; }
#ww-pill.ww-crit  { border-color: #ef4444; animation: ww-pulse 2s ease-in-out infinite; }

@keyframes ww-pulse {
  0%,100% { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
  50%      { box-shadow: 0 4px 20px rgba(239,68,68,.35); }
}

.ww-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.ww-dot--none { background: #94a3b8; }
.ww-dot--ok   { background: #22c55e; }
.ww-dot--warn { background: #f59e0b; }
.ww-dot--crit { background: #ef4444; }

.ww-pill-addr {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: #374151;
}
.ww-pill-label { font-size: 0.78rem; color: #6b7280; }

/* ── Panel ─────────────────────────────────────────────────── */
#ww-panel {
  width: 300px;
  background: #fff;
  border: 1.5px solid var(--ww-border);
  border-radius: 16px;
  box-shadow: var(--ww-shadow);
  overflow: hidden;
  transform-origin: bottom right;
  transition: opacity .18s ease, transform .18s ease;
  opacity: 0;
  transform: scale(.96) translateY(6px);
  pointer-events: none;
}
#ww-panel.ww-open {
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: all;
}

.ww-panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--ww-border);
}
.ww-panel-title {
  font-weight: 700;
  font-size: 0.88rem;
  color: #111;
  flex: 1;
}
.ww-panel-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 2px 7px;
}
.ww-panel-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; font-size: 1rem; padding: 0 2px; line-height: 1;
}
.ww-panel-close:hover { color: #374151; }

/* ── Panel body ────────────────────────────────────────────── */
.ww-body { padding: 14px 16px; }

.ww-warnings {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ww-warn-item {
  font-size: 0.78rem;
  padding: 6px 10px;
  border-radius: 8px;
  line-height: 1.4;
}
.ww-warn-item--warn { background: #fffbeb; color: var(--ww-yellow); border: 1px solid #fde68a; }
.ww-warn-item--crit { background: #fff5f5; color: var(--ww-red);    border: 1px solid #fecaca; }

.ww-addr-row {
  display: flex; align-items: center; gap: 6px; margin-bottom: 8px;
}
.ww-addr-label {
  font-size: 0.68rem; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: #9ca3af;
}
.ww-addr-val {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem; color: #374151;
}

.ww-key-box {
  display: flex; align-items: center; gap: 5px;
  background: #f8f7f4; border: 1px solid var(--ww-border);
  border-radius: 8px; padding: 7px 10px; margin-bottom: 10px;
  flex-wrap: wrap;
}
.ww-key-val {
  font-family: 'Courier New', monospace;
  font-size: 0.72rem; color: #6b7280; flex: 1; word-break: break-all;
}
.ww-balance {
  font-size: 0.78rem; color: #374151; margin-bottom: 10px;
}
.ww-balance span { font-weight: 600; }

.ww-divider { height: 1px; background: var(--ww-border); margin: 10px 0; }

.ww-hint {
  font-size: 0.76rem; color: #6b7280; line-height: 1.5; margin-bottom: 12px;
  border-left: 2px solid #d4a017; padding-left: 8px; font-style: italic;
}

.ww-btn-row { display: flex; gap: 7px; flex-wrap: wrap; }

.ww-btn {
  font-size: 0.78rem; font-weight: 600; border-radius: 8px;
  padding: 7px 12px; cursor: pointer; border: 1.5px solid transparent;
  transition: opacity .15s, background .15s;
}
.ww-btn:hover { opacity: .85; }
.ww-btn--p  { background: #166534; color: #fff; border-color: #166534; }
.ww-btn--s  { background: transparent; color: #374151; border-color: var(--ww-border); }
.ww-btn--s:hover { background: #f1f0ec; }
.ww-btn--d  { background: transparent; color: #b91c1c; border-color: #fecaca; }
.ww-btn--d:hover { background: #fff5f5; }

.ww-input {
  width: 100%; font-family: 'Courier New', monospace; font-size: 0.8rem;
  border: 1.5px solid var(--ww-border); border-radius: 8px;
  padding: 8px 10px; background: #f8f7f4; color: #1a1a1a;
  outline: none; box-sizing: border-box; margin: 6px 0 10px;
}
.ww-input:focus { border-color: #166534; }

.ww-inp-label { font-size: 0.72rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: #9ca3af; }

.ww-btn-inline {
  font-size: 0.68rem; font-weight: 600; color: #166534;
  background: none; border: 1px solid var(--ww-border); border-radius: 5px;
  padding: 2px 7px; cursor: pointer; white-space: nowrap;
}
.ww-btn-inline:hover { background: #f1f0ec; }
  `;
  document.head.appendChild(s);
}

// ─── Inject HTML ───────────────────────────────────────────────────────────────
function injectHTML() {
  const root = document.createElement('div');
  root.id = 'ww-root';
  root.innerHTML = `
    <div id="ww-panel">
      <div class="ww-panel-head">
        <span class="ww-panel-title">My Payment Key</span>
        <span class="ww-panel-badge" id="ww-panel-badge" style="display:none;">Saved on device</span>
        <button class="ww-panel-close" id="ww-close" title="Close">✕</button>
      </div>
      <div class="ww-body" id="ww-body"></div>
    </div>

    <button id="ww-pill" title="My Payment Key">
      <span class="ww-dot ww-dot--none" id="ww-dot"></span>
      <span class="ww-pill-addr" id="ww-pill-addr">
        <span class="ww-pill-label">No key saved</span>
      </span>
    </button>
  `;
  document.body.appendChild(root);
}

// ─── Panel content renderers ───────────────────────────────────────────────────
let _pendingKey   = null;
let _newRotateKey = null;
let _currentBal   = null;

function renderBody(panel, stored) {
  const body = document.getElementById('ww-body');
  if (!body) return;

  const { level, warnings } = computeStatus(stored, _currentBal);

  if (!stored) {
    body.innerHTML = `
      <p style="font-size:.82rem;color:#6b7280;margin:0 0 12px;line-height:1.5;">
        Add your key for one-tap payments. It never leaves this device — the server cannot see it.
      </p>
      <div class="ww-btn-row">
        <button class="ww-btn ww-btn--p" id="ww-do-add">Add my key</button>
        <button class="ww-btn ww-btn--s" id="ww-do-gen">Generate new key</button>
      </div>`;
    document.getElementById('ww-do-add').onclick = () => renderAddForm();
    document.getElementById('ww-do-gen').onclick  = () => doGenerate(false);
    return;
  }

  const warningHtml = warnings.map(w =>
    `<div class="ww-warn-item ww-warn-item--${level === 'critical' ? 'crit' : 'warn'}">${w}</div>`
  ).join('');

  const balHtml = _currentBal != null
    ? `<div class="ww-balance">Balance: <span>${_currentBal.toFixed(4)} USDC</span></div>`
    : `<div class="ww-balance" style="color:#9ca3af;">Balance: <span id="ww-bal-loading">fetching…</span></div>`;

  body.innerHTML = `
    ${warnings.length ? `<div class="ww-warnings">${warningHtml}</div>` : ''}
    <div class="ww-addr-row">
      <span class="ww-addr-label">Address</span>
      <span class="ww-addr-val">${wwShorten(stored.address)}</span>
    </div>
    <div class="ww-key-box">
      <span class="ww-key-val" id="ww-kv" data-key="${stored.key}" data-revealed="false">${wwMask(stored.key)}</span>
      <button class="ww-btn-inline" id="ww-reveal">Reveal</button>
      <button class="ww-btn-inline" id="ww-copy-key">Copy</button>
    </div>
    ${balHtml}
    <p class="ww-hint">Keep your balance low — treat this like cash in a pocket. Rotate when it feels full.</p>
    <div class="ww-divider"></div>
    <div class="ww-btn-row">
      <button class="ww-btn ww-btn--s" id="ww-do-rotate">Rotate key</button>
      <button class="ww-btn ww-btn--d" id="ww-do-forget">Forget</button>
    </div>`;

  document.getElementById('ww-reveal').onclick = () => {
    const el = document.getElementById('ww-kv');
    const btn = document.getElementById('ww-reveal');
    const revealed = el.dataset.revealed === 'true';
    el.textContent     = revealed ? wwMask(el.dataset.key) : el.dataset.key;
    el.dataset.revealed = String(!revealed);
    btn.textContent    = revealed ? 'Reveal' : 'Hide';
  };
  document.getElementById('ww-copy-key').onclick = () => {
    navigator.clipboard.writeText(stored.key).then(() => {
      const btn = document.getElementById('ww-copy-key');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  };
  document.getElementById('ww-do-rotate').onclick = () => doGenerate(true);
  document.getElementById('ww-do-forget').onclick  = () => {
    if (confirm('Remove this key from this device? Make sure you have it saved elsewhere.')) {
      wwClear(); _currentBal = null; _balCache = null; wwRender();
    }
  };

  // Fetch balance in background if not cached
  if (_currentBal == null && stored?.address) {
    fetchBalance(stored.address).then(usdc => {
      _currentBal = usdc;
      const balEl = document.getElementById('ww-bal-loading');
      if (balEl && usdc != null) {
        balEl.parentElement.innerHTML = `Balance: <span>${usdc.toFixed(4)} USDC</span>`;
      }
      updatePill();   // recompute dot color with balance
    });
  }
}

function renderAddForm() {
  const body = document.getElementById('ww-body');
  body.innerHTML = `
    <span class="ww-inp-label">Paste your private key</span>
    <input type="password" id="ww-add-in" class="ww-input" placeholder="0x…" autocomplete="off" spellcheck="false">
    <div class="ww-btn-row">
      <button class="ww-btn ww-btn--p" id="ww-save-it">Save on this device</button>
      <button class="ww-btn ww-btn--s" id="ww-add-cancel">Cancel</button>
    </div>`;
  document.getElementById('ww-add-in').focus();
  document.getElementById('ww-save-it').onclick = async () => {
    const key = document.getElementById('ww-add-in').value.trim();
    if (!key || !key.startsWith('0x') || key.length !== 66) return;
    const { privateKeyToAccount } = await import('/wallet-gen.bundle.js');
    wwSave(key, privateKeyToAccount(key).address);
    _currentBal = null;
    wwRender();
  };
  document.getElementById('ww-add-cancel').onclick = () => wwRender();
}

function renderRotateForm(newKey, newAddress) {
  const body = document.getElementById('ww-body');
  body.innerHTML = `
    <p style="font-size:.78rem;color:#374151;margin:0 0 10px;line-height:1.5;">
      New key ready. Move your USDC to the new address first, then activate.
    </p>
    <div class="ww-addr-row">
      <span class="ww-addr-label">New address</span>
      <span class="ww-addr-val">${wwShorten(newAddress)}</span>
    </div>
    <div class="ww-key-box">
      <span class="ww-key-val" id="ww-nkv" data-key="${newKey}" data-revealed="false">${wwMask(newKey)}</span>
      <button class="ww-btn-inline" id="ww-nreveal">Reveal</button>
      <button class="ww-btn-inline" id="ww-ncopy">Copy new key</button>
    </div>
    <div class="ww-btn-row">
      <button class="ww-btn ww-btn--p" id="ww-activate">Activate new key</button>
      <button class="ww-btn ww-btn--s" id="ww-rot-cancel">Cancel</button>
    </div>`;
  document.getElementById('ww-nreveal').onclick = () => {
    const el = document.getElementById('ww-nkv');
    const btn = document.getElementById('ww-nreveal');
    const r = el.dataset.revealed === 'true';
    el.textContent = r ? wwMask(el.dataset.key) : el.dataset.key;
    el.dataset.revealed = String(!r);
    btn.textContent = r ? 'Reveal' : 'Hide';
  };
  document.getElementById('ww-ncopy').onclick = () => {
    navigator.clipboard.writeText(newKey).then(() => {
      const btn = document.getElementById('ww-ncopy');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy new key'; }, 2000);
    });
  };
  document.getElementById('ww-activate').onclick = async () => {
    const { privateKeyToAccount } = await import('/wallet-gen.bundle.js');
    wwSave(newKey, privateKeyToAccount(newKey).address);
    _currentBal = null; _balCache = null;
    wwRender();
  };
  document.getElementById('ww-rot-cancel').onclick = () => wwRender();
}

function renderSavePrompt(key) {
  const body = document.getElementById('ww-body');
  body.innerHTML = `
    <p style="font-size:.82rem;color:#374151;margin:0 0 12px;line-height:1.5;">
      Save this key for one-tap payments next time? It stays on this device only.
    </p>
    <div class="ww-btn-row">
      <button class="ww-btn ww-btn--p" id="ww-confirm-save">Save on this device</button>
      <button class="ww-btn ww-btn--s" id="ww-skip-save">Not now</button>
    </div>`;
  document.getElementById('ww-confirm-save').onclick = async () => {
    const { privateKeyToAccount } = await import('/wallet-gen.bundle.js');
    wwSave(key, privateKeyToAccount(key).address);
    _pendingKey = null; _currentBal = null;
    wwRender();
  };
  document.getElementById('ww-skip-save').onclick = () => { _pendingKey = null; wwRender(); };
}

async function doGenerate(isRotate) {
  const { generatePrivateKey, privateKeyToAccount } = await import('/wallet-gen.bundle.js');
  const newKey  = generatePrivateKey();
  const account = privateKeyToAccount(newKey);
  if (isRotate) {
    _newRotateKey = newKey;
    renderRotateForm(newKey, account.address);
  } else {
    wwSave(newKey, account.address);
    _currentBal = null;
    wwRender();
  }
}

// ─── Pill updater ──────────────────────────────────────────────────────────────
function updatePill() {
  const stored  = wwLoad();
  const pill    = document.getElementById('ww-pill');
  const dot     = document.getElementById('ww-dot');
  const addrEl  = document.getElementById('ww-pill-addr');
  const badge   = document.getElementById('ww-panel-badge');

  if (!stored) {
    addrEl.innerHTML = `<span class="ww-pill-label">No key saved</span>`;
    dot.className    = 'ww-dot ww-dot--none';
    pill.className   = '';
    if (badge) badge.style.display = 'none';
    return;
  }

  const { level } = computeStatus(stored, _currentBal);
  addrEl.textContent = wwShorten(stored.address);
  dot.className  = `ww-dot ww-dot--${level === 'critical' ? 'crit' : level === 'warn' ? 'warn' : 'ok'}`;
  pill.className = level === 'critical' ? 'ww-crit' : level === 'warn' ? 'ww-warn' : '';
  if (badge) badge.style.display = 'inline';
}

// ─── Full render ───────────────────────────────────────────────────────────────
function wwRender() {
  const stored = wwLoad();
  const panel  = document.getElementById('ww-panel');

  if (_pendingKey) {
    renderSavePrompt(_pendingKey);
  } else {
    renderBody(panel, stored);
  }

  updatePill();
}

// ─── Toggle expanded / collapsed ──────────────────────────────────────────────
let _open = false;
function wwToggle(forceOpen) {
  _open = forceOpen !== undefined ? forceOpen : !_open;
  const panel = document.getElementById('ww-panel');
  if (_open) {
    panel.classList.add('ww-open');
    wwRender();   // refresh content every time panel opens
  } else {
    panel.classList.remove('ww-open');
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
function init() {
  injectCSS();
  injectHTML();

  document.getElementById('ww-pill').addEventListener('click', () => wwToggle());
  document.getElementById('ww-close').addEventListener('click', () => wwToggle(false));

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (_open && !document.getElementById('ww-root').contains(e.target)) {
      wwToggle(false);
    }
  });

  updatePill();   // set initial pill state without opening

  // Listen for offer-save events dispatched by other scripts (e.g. tenant.js)
  window.addEventListener('ww:offer-save', (e) => {
    _pendingKey = e.detail?.key;
    wwToggle(true);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
