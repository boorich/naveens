/**
 * Generic tenant storefront — all content driven by server config at /api/p/:slug/config
 */

// Detect slug from URL path /p/:slug
function getSlugFromPath() {
  const match = window.location.pathname.match(/^\/p\/([a-z0-9_-]+)\/?$/i);
  return match ? match[1] : null;
}

const slug    = getSlugFromPath();
const apiBase = slug ? `/api/p/${slug}` : '/api';

let config = {
  sellerName:  '',
  serviceName: '',
  city:        '',
  description: '',
  phone:       '',
  whatsapp:    '',
  lkrPerUsdc:  300,
  driverWallet: null,
  network:     'eip155:84532',
};

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  renderPage();
  initAvailability();
  initPresets();
  initPayButton();
  initShare();
});

async function loadConfig() {
  try {
    const res = await fetch(`${apiBase}/config`);
    if (res.ok) {
      const data = await res.json();
      config = { ...config, ...data };
    }
  } catch (err) {
    console.warn('Could not load tenant config:', err);
  }
}

// ── Render page content from config ──────────────────────────────────────────
function renderPage() {
  const sellerName  = config.sellerName  || 'Seller';
  const serviceName = config.serviceName || 'Payment Page';
  const city        = config.city        || '';
  const description = config.description || '';

  document.getElementById('page-title').textContent        = `${sellerName}'s ${serviceName}`;
  document.getElementById('hero-seller-name').textContent  = sellerName + '\u2019s';
  document.getElementById('hero-service-name').textContent = serviceName;
  document.getElementById('hero-city').textContent         = city;
  document.getElementById('service-description').textContent = description;
  document.getElementById('pay-title').textContent         = `Pay ${sellerName}`;
  document.getElementById('helper-text').textContent       = `Funds go directly to ${sellerName}'s wallet.`;
  document.getElementById('share-title').textContent       = `Recommend ${sellerName}`;
  document.getElementById('share-description').textContent = `Share this page to help ${sellerName} grow.`;

  // Contact buttons
  const contactSection = document.getElementById('contact-buttons');
  const waBtn          = document.getElementById('btn-whatsapp');
  const callBtn        = document.getElementById('btn-call');
  if (config.whatsapp) {
    waBtn.style.display = '';
    waBtn.addEventListener('click', () => {
      window.open(`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    });
  }
  if (config.phone) {
    callBtn.style.display = '';
    callBtn.addEventListener('click', () => { window.location.href = `tel:${config.phone}`; });
  }
  if (config.whatsapp || config.phone) contactSection.style.display = '';

  updateUsdcDisplay();
}

// ── Availability toggle (local state, just UX) ────────────────────────────────
function initAvailability() {
  const badge = document.getElementById('availability-badge');
  const text  = badge.querySelector('.availability-text');
  const isAvailable = localStorage.getItem(`availability:${slug}`) !== 'busy';
  update(isAvailable);
  badge.addEventListener('click', () => {
    const now = badge.classList.contains('busy') ? 'available' : 'busy';
    localStorage.setItem(`availability:${slug}`, now);
    update(now === 'available');
  });
  function update(avail) {
    badge.classList.toggle('busy', !avail);
    text.textContent = avail ? 'Available now' : 'Busy';
  }
}

// ── Preset amount buttons ─────────────────────────────────────────────────────
function initPresets() {
  const amountInput   = document.getElementById('amount-input');
  const presetButtons = document.querySelectorAll('.preset-btn');

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.amount === 'custom') {
        amountInput.focus();
        presetButtons.forEach(b => b.classList.remove('active'));
      } else {
        amountInput.value = btn.dataset.amount;
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateUsdcDisplay();
      }
    });
  });

  amountInput.addEventListener('input', () => {
    presetButtons.forEach(b => b.classList.toggle('active', b.dataset.amount === amountInput.value));
    updateUsdcDisplay();
  });

  amountInput.addEventListener('paste', e => {
    e.preventDefault();
    const v = parseFloat((e.clipboardData || window.clipboardData).getData('text'));
    if (!isNaN(v) && v > 0) { amountInput.value = v; updateUsdcDisplay(); }
  });
}

function updateUsdcDisplay() {
  const lkr  = parseFloat(document.getElementById('amount-input').value) || 0;
  const usdc = (lkr / (config.lkrPerUsdc || 300)).toFixed(2);
  document.getElementById('usdc-amount').textContent = usdc;
}

// ── Payment flow ──────────────────────────────────────────────────────────────
function initPayButton() {
  document.getElementById('btn-pay').addEventListener('click', () => handlePayment());
}

async function handlePayment() {
  const amountInput = document.getElementById('amount-input');
  const lkrAmount   = parseFloat(amountInput.value);

  if (!lkrAmount || lkrAmount <= 0)    return showError('Please enter a valid amount.');
  if (lkrAmount > 1_000_000)           return showError('Amount too large.');

  const usdcAmount = lkrAmount / (config.lkrPerUsdc || 300);

  setLoading(true);

  try {
    const response = await fetch(`${apiBase}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: usdcAmount, label: 'payment' }),
    });

    const data = await response.json();

    if (response.status === 402 || response.status === 200) {
      if (data.success && data.transaction) {
        await showSuccess(usdcAmount, data.transaction, data.network || config.network);
        return;
      }

      // Challenge — need private key to sign
      const keyContainer = document.getElementById('private-key-container');
      const keyInput     = document.getElementById('private-key-input');
      const keyStatus    = document.getElementById('private-key-status');
      const privateKey   = keyInput.value.trim();

      if (!privateKey) {
        keyContainer.style.display = 'block';
        keyInput.focus();
        keyStatus.style.display = 'none';
        setLoading(false);
        keyInput.addEventListener('input', () => {
          const k = keyInput.value.trim();
          keyStatus.style.display = (k && k.startsWith('0x') && k.length === 66) ? 'flex' : 'none';
        }, { once: false });
        showError('Paste your private key to sign the payment.');
        return;
      }

      // Sign and submit
      keyInput.disabled = true;
      keyStatus.querySelector('span:last-child').textContent = 'Signing…';
      keyStatus.style.display = 'flex';

      try {
        const signed = await signPaymentClientSide(data, privateKey);

        // Clear key immediately
        keyInput.value    = '';
        keyInput.disabled = false;
        keyStatus.querySelector('span:last-child').textContent = 'Key cleared';
        setTimeout(() => { keyContainer.style.display = 'none'; keyStatus.style.display = 'none'; }, 600);

        const settleRes = await fetch(`${apiBase}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PAYMENT-SIGNATURE': btoa(JSON.stringify(signed)),
          },
          body: JSON.stringify({ amount: usdcAmount, label: 'payment' }),
        });
        const settled = await settleRes.json();
        if (!settleRes.ok) throw new Error(settled.message || settled.error || 'Payment failed');
        if (settled.success && settled.transaction) {
          await showSuccess(usdcAmount, settled.transaction, settled.network || config.network);
        } else {
          throw new Error('Payment failed: no transaction returned');
        }
      } catch (signErr) {
        keyInput.value    = '';
        keyInput.disabled = false;
        keyContainer.style.display = 'none';
        keyStatus.style.display    = 'none';
        throw signErr;
      }
    } else {
      throw new Error(data.message || data.error || 'Payment failed');
    }
  } catch (error) {
    console.error('Payment error:', error);
    showError(error.message || 'Payment failed. Please try again.');
  } finally {
    setLoading(false);
  }
}

async function signPaymentClientSide(challengeData, privateKey) {
  try {
    const { signPayment } = await import('./client-signer.bundle.js');
    return await signPayment(challengeData, privateKey);
  } catch (err) {
    throw new Error(`Failed to sign payment: ${err.message}`);
  }
}

async function showSuccess(amount, txHash, network) {
  document.getElementById('success-amount').textContent = amount.toFixed(2);
  document.getElementById('success-tx').textContent     = txHash;
  const link = document.getElementById('success-tx-link');
  if (link) link.href = `https://sepolia.basescan.org/tx/${txHash}`;
  document.getElementById('payment-success').style.display = 'block';
  document.getElementById('payment-section').scrollIntoView({ behavior: 'smooth', block: 'center' });

  const verStatus = document.getElementById('verification-status');
  if (verStatus) {
    verStatus.textContent  = 'Verifying on-chain…';
    verStatus.style.display = 'block';
    verStatus.className    = 'verification-status verifying';
    verifyOnChain(txHash, network).then(ok => {
      verStatus.textContent = ok
        ? '✓ Verified on-chain (trustless)'
        : '⚠ Verification pending — check BaseScan';
      verStatus.className = `verification-status ${ok ? 'verified' : 'unverified'}`;
    }).catch(() => {
      verStatus.textContent = '⚠ Verification unavailable — check BaseScan';
      verStatus.className   = 'verification-status unverified';
    });
  }
}

async function verifyOnChain(txHash, network = 'eip155:84532') {
  const rpcUrl = 'https://sepolia.base.org';
  for (let i = 0; i < 5; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i - 1)));
    try {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [txHash] }),
      });
      const { result } = await res.json();
      if (result && result.status === '0x1' && result.blockNumber) return true;
    } catch { /* retry */ }
  }
  return false;
}

// ── Share buttons ─────────────────────────────────────────────────────────────
function initShare() {
  const pageUrl = window.location.href;
  const text    = () => `Pay ${config.sellerName || 'this seller'} directly in USDC: ${pageUrl}`;

  document.getElementById('share-whatsapp').addEventListener('click', () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text())}`, '_blank');
  });
  document.getElementById('share-facebook').addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank');
  });
  document.getElementById('share-twitter').addEventListener('click', () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text())}`, '_blank');
  });
  document.getElementById('share-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(pageUrl); }
    catch { /* fallback */ }
    alert('Link copied!');
  });
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function setLoading(on) {
  document.getElementById('payment-loading').style.display  = on ? 'block' : 'none';
  document.getElementById('payment-success').style.display  = on ? 'none'  : document.getElementById('payment-success').style.display;
  document.getElementById('payment-error').style.display    = 'none';
  document.getElementById('btn-pay').disabled               = on;
}

function showError(msg) {
  const el = document.getElementById('error-message');
  el.textContent = msg;
  document.getElementById('payment-error').style.display = 'block';
  setTimeout(() => { document.getElementById('payment-error').style.display = 'none'; }, 6000);
}
