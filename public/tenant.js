/**
 * Generic tenant storefront — all content driven by server config at /api/p/:slug/config
 */

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    available:        'Available now',
    busy:             'Busy',
    pay:              (name) => `Pay ${name}`,
    amountLabel:      'Amount in LKR',
    payBtn:           'Pay in USDC',
    helperText:       (name) => `Funds go directly to ${name}'s wallet.`,
    shareTitle:       (name) => `Recommend ${name}`,
    shareDesc:        (name) => `Share this page to help ${name} grow.`,
    pasteKey:         'Paste Private Key',
    keyWarning:       'Your private key signs this payment and is immediately cleared from memory. It is never sent to the server.',
    readyToSign:      'Ready to sign',
    signing:          'Signing…',
    keyCleared:       'Key cleared',
    pasteKeyPrompt:   'Paste your private key to sign the payment.',
    processing:       'Processing payment…',
    processingFee:    'Collecting platform fee…',
    successTitle:     'Payment Successful!',
    successAmount:    'Amount',
    successTx:        'Transaction',
    verifying:        'Verifying on-chain…',
    verified:         '✓ Verified on-chain (trustless)',
    unverified:       '⚠ Verification pending — check BaseScan',
    verifyUnavail:    '⚠ Verification unavailable — check BaseScan',
    recommend:        'Recommend this seller',
    recommendDesc:    'Share this page to help them grow.',
    feeNote:          (fee) => `+ ${fee} USDC platform fee`,
    printQr:          'Print QR',
    managePrompt:     'Enter your manage token to update availability',
    manageConfirm:    'Confirm',
    manageCancel:     'Cancel',
    manageError:      'Invalid token. Check the token from your registration confirmation.',
    invalidAmount:    'Please enter a valid amount.',
    amountTooLarge:   'Amount too large.',
    payFailed:        'Payment failed. Please try again.',
  },
  si: {
    available:        'දැන් ලබාගත හැකිය',
    busy:             'කාර්යබහුල',
    pay:              (name) => `${name} ට ගෙවන්න`,
    amountLabel:      'LKR හි මුදල',
    payBtn:           'USDC හි ගෙවන්න',
    helperText:       (name) => `මුදල් කෙළින්ම ${name}ගේ පසුම්බියට යයි.`,
    shareTitle:       (name) => `${name} නිර්දේශ කරන්න`,
    shareDesc:        (name) => `${name}ගේ වර්ධනයට සහාය වීමට මෙම පිටුව බෙදාගන්න.`,
    pasteKey:         'Private Key ඇලවන්න',
    keyWarning:       'ඔබේ Private Key මෙම ගෙවීම අත්සන් කරයි. එය කිසිවිටෙකත් server වෙත නොයවනු ලැබේ.',
    readyToSign:      'අත්සන් කිරීමට සූදානම්',
    signing:          'අත්සන් කරමින්…',
    keyCleared:       'Key ඉවත් කරන ලදී',
    pasteKeyPrompt:   'ගෙවීම අත්සන් කිරීමට ඔබේ Private Key ඇලවන්න.',
    processing:       'ගෙවීම සකසමින්…',
    processingFee:    'ගාස්තු එකතු කරමින්…',
    successTitle:     'ගෙවීම සාර්ථකව සිදු විය!',
    successAmount:    'මුදල',
    successTx:        'ගනුදෙනුව',
    verifying:        'On-chain සත්‍යාපනය කරමින්…',
    verified:         '✓ On-chain සත්‍යාපිත',
    unverified:       '⚠ සත්‍යාපනය අපේක්ෂාවෙන් — BaseScan පරීක්ෂා කරන්න',
    verifyUnavail:    '⚠ සත්‍යාපනය නොතිබේ',
    recommend:        'මෙම විකුණුම්කරු නිර්දේශ කරන්න',
    recommendDesc:    'ඔවුන්ගේ වර්ධනයට සහාය වීමට මෙම පිටුව බෙදාගන්න.',
    feeNote:          (fee) => `+ ${fee} USDC ගාස්තු`,
    printQr:          'QR මුද්‍රණය',
    managePrompt:     'ලබා ගැනීමේ හැකියාව යාවත්කාල කිරීමට ඔබේ කළමනාකරණ token ඇතුළු කරන්න',
    manageConfirm:    'තහවුරු කරන්න',
    manageCancel:     'අවලංගු කරන්න',
    manageError:      'වලංගු නොවන token. ලියාපදිංචි තහවුරු කිරීමෙන් token පරීක්ෂා කරන්න.',
    invalidAmount:    'වලංගු මුදලක් ඇතුළු කරන්න.',
    amountTooLarge:   'මුදල ඉතා විශාලයි.',
    payFailed:        'ගෙවීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  },
  ta: {
    available:        'இப்போது கிடைக்கிறது',
    busy:             'பிஸியாக உள்ளது',
    pay:              (name) => `${name} க்கு செலுத்து`,
    amountLabel:      'LKR இல் தொகை',
    payBtn:           'USDC இல் செலுத்து',
    helperText:       (name) => `நிதி நேரடியாக ${name}இன் வாலட்டிற்கு செல்கிறது.`,
    shareTitle:       (name) => `${name}ஐ பரிந்துரை செய்`,
    shareDesc:        (name) => `${name} வளர உதவ இந்த பக்கத்தை பகிரவும்.`,
    pasteKey:         'Private Key ஐ ஒட்டவும்',
    keyWarning:       'உங்கள் Private Key இந்த கட்டணத்தில் கையெழுத்திடுகிறது. இது சேவையகத்திற்கு அனுப்பப்படவில்லை.',
    readyToSign:      'கையெழுத்திட தயார்',
    signing:          'கையெழுத்திடுகிறது…',
    keyCleared:       'Key அழிக்கப்பட்டது',
    pasteKeyPrompt:   'கட்டணத்தில் கையெழுத்திட உங்கள் Private Key ஐ ஒட்டவும்.',
    processing:       'கட்டணம் செயலாக்கப்படுகிறது…',
    processingFee:    'தளக் கட்டணம் சேகரிக்கப்படுகிறது…',
    successTitle:     'கட்டணம் வெற்றிகரமாக முடிந்தது!',
    successAmount:    'தொகை',
    successTx:        'பரிவர்த்தனை',
    verifying:        'On-chain சரிபார்க்கிறது…',
    verified:         '✓ On-chain சரிபார்க்கப்பட்டது',
    unverified:       '⚠ சரிபார்ப்பு நிலுவையில் உள்ளது — BaseScan பார்க்கவும்',
    verifyUnavail:    '⚠ சரிபார்ப்பு கிடைக்கவில்லை',
    recommend:        'இந்த விற்பனையாளரை பரிந்துரை செய்',
    recommendDesc:    'அவர்கள் வளர உதவ இந்த பக்கத்தை பகிரவும்.',
    feeNote:          (fee) => `+ ${fee} USDC தள கட்டணம்`,
    printQr:          'QR அச்சிடு',
    managePrompt:     'கிடைக்கும் தன்மையை புதுப்பிக்க உங்கள் நிர்வாக token ஐ உள்ளிடவும்',
    manageConfirm:    'உறுதிப்படுத்து',
    manageCancel:     'ரத்துசெய்',
    manageError:      'தவறான token. பதிவு உறுதிப்படுத்தலிலிருந்து token ஐ சரிபார்க்கவும்.',
    invalidAmount:    'சரியான தொகையை உள்ளிடவும்.',
    amountTooLarge:   'தொகை மிகவும் அதிகம்.',
    payFailed:        'கட்டணம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
  },
};

// ── State ─────────────────────────────────────────────────────────────────────
function getSlugFromPath() {
  const match = window.location.pathname.match(/^\/p\/([a-z0-9_-]+)\/?$/i);
  return match ? match[1] : null;
}

const slug    = getSlugFromPath();
const apiBase = slug ? `/api/p/${slug}` : '/api';

let config = {
  sellerName:        '',
  serviceName:       '',
  city:              '',
  description:       '',
  phone:             '',
  whatsapp:          '',
  lkrPerUsdc:        300,
  driverWallet:      null,
  network:           'eip155:84532',
  isAvailable:       true,
  platformFeeBps:    0,
  platformFeeWallet: '',
};

let lang = localStorage.getItem('lang') || 'en';

function t(key, ...args) {
  const entry = T[lang]?.[key] ?? T.en[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  renderPage();
  initLanguage();
  initAvailability();
  initPresets();
  initPayButton();
  initShare();
  initQrFooter();
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

// ── Language switching ────────────────────────────────────────────────────────
function initLanguage() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === lang) btn.classList.add('active');
    btn.addEventListener('click', () => {
      lang = btn.dataset.lang;
      localStorage.setItem('lang', lang);
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      applyLanguage();
    });
  });
  applyLanguage();
}

function applyLanguage() {
  document.documentElement.lang = lang;
  const name = config.sellerName || 'Seller';

  document.getElementById('page-title').textContent        = `${name}'s ${config.serviceName || 'Page'}`;
  document.getElementById('hero-seller-name').textContent  = name + '\u2019s';
  document.getElementById('hero-service-name').textContent = config.serviceName || '';
  document.getElementById('pay-title').textContent         = t('pay', name);
  document.getElementById('helper-text').textContent       = t('helperText', name);
  document.getElementById('share-title').textContent       = t('shareTitle', name);
  document.getElementById('share-description').textContent = t('shareDesc', name);

  const amountLabel = document.querySelector('label[for="amount-input"]');
  if (amountLabel) amountLabel.textContent = t('amountLabel');
  document.getElementById('btn-pay').textContent = t('payBtn');

  const keyWarningEl = document.querySelector('.private-key-warning p');
  if (keyWarningEl) keyWarningEl.textContent = t('keyWarning');
  const keyLabel = document.querySelector('label[for="private-key-input"]');
  if (keyLabel) keyLabel.textContent = t('pasteKey');

  const loadingText = document.querySelector('.payment-loading p');
  if (loadingText) loadingText.textContent = t('processing');

  const successTitle = document.querySelector('.payment-success h3');
  if (successTitle) successTitle.textContent = t('successTitle');

  const avail = config.isAvailable;
  const badge = document.getElementById('availability-badge');
  const badgeText = badge?.querySelector('.availability-text');
  if (badgeText) badgeText.textContent = avail ? t('available') : t('busy');

  const footerQr = document.getElementById('footer-qr-link');
  if (footerQr) footerQr.textContent = t('printQr');

  const managePromptEl = document.querySelector('.manage-token-label');
  if (managePromptEl) managePromptEl.textContent = t('managePrompt');
  const manageConfirmEl = document.getElementById('manage-token-confirm');
  if (manageConfirmEl) manageConfirmEl.textContent = t('manageConfirm');
  const manageCancelEl = document.getElementById('manage-token-cancel');
  if (manageCancelEl) manageCancelEl.textContent = t('manageCancel');

  updateUsdcDisplay();
}

// ── Render page content from config ──────────────────────────────────────────
function renderPage() {
  const city        = config.city        || '';
  const description = config.description || '';

  document.getElementById('hero-city').textContent          = city;
  document.getElementById('service-description').textContent = description;

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
}

// ── Availability toggle ───────────────────────────────────────────────────────
function initAvailability() {
  const badge = document.getElementById('availability-badge');
  if (!badge) return;
  const badgeText = badge.querySelector('.availability-text');

  const isAvail = config.isAvailable !== false;
  badge.classList.toggle('busy', !isAvail);
  if (badgeText) badgeText.textContent = isAvail ? t('available') : t('busy');

  badge.addEventListener('click', async () => {
    const savedToken = localStorage.getItem(`manage-token:${slug}`);
    if (savedToken) {
      await toggleAvailability(savedToken, badge, badgeText);
    } else {
      showManagePrompt(badge, badgeText);
    }
  });
}

async function toggleAvailability(token, badge, badgeText) {
  const currentlyAvailable = !badge.classList.contains('busy');
  try {
    const res = await fetch(`${apiBase}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !currentlyAvailable, token }),
    });
    if (res.status === 403) {
      localStorage.removeItem(`manage-token:${slug}`);
      showManagePrompt(badge, badgeText);
      return;
    }
    const data = await res.json();
    badge.classList.toggle('busy', !data.isAvailable);
    config.isAvailable = data.isAvailable;
    if (badgeText) badgeText.textContent = data.isAvailable ? t('available') : t('busy');
  } catch (err) {
    console.warn('Availability toggle failed:', err);
  }
}

function showManagePrompt(badge, badgeText) {
  const overlay  = document.getElementById('manage-token-prompt');
  const input    = document.getElementById('manage-token-input');
  const errorEl  = document.getElementById('manage-token-error');
  const confirmBtn = document.getElementById('manage-token-confirm');
  const cancelBtn  = document.getElementById('manage-token-cancel');

  input.value = '';
  errorEl.style.display = 'none';
  overlay.style.display = 'flex';
  input.focus();

  const close = () => { overlay.style.display = 'none'; };

  const onConfirm = async () => {
    const token = input.value.trim();
    if (!token) return;
    const currentlyAvailable = !badge.classList.contains('busy');
    try {
      const res = await fetch(`${apiBase}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentlyAvailable, token }),
      });
      if (res.status === 403) {
        errorEl.textContent = t('manageError');
        errorEl.style.display = 'block';
        return;
      }
      const data = await res.json();
      localStorage.setItem(`manage-token:${slug}`, token);
      badge.classList.toggle('busy', !data.isAvailable);
      config.isAvailable = data.isAvailable;
      if (badgeText) badgeText.textContent = data.isAvailable ? t('available') : t('busy');
      close();
    } catch (err) {
      errorEl.textContent = t('manageError');
      errorEl.style.display = 'block';
    }
  };

  confirmBtn.onclick = onConfirm;
  cancelBtn.onclick  = close;
  input.onkeydown    = (e) => { if (e.key === 'Enter') onConfirm(); if (e.key === 'Escape') close(); };
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

  updateUsdcDisplay();
}

function updateUsdcDisplay() {
  const lkr       = parseFloat(document.getElementById('amount-input').value) || 0;
  const vendorUsdc = lkr / (config.lkrPerUsdc || 300);
  const feeUsdc    = config.platformFeeWallet
    ? vendorUsdc * (config.platformFeeBps || 0) / 10000
    : 0;

  document.getElementById('usdc-amount').textContent = vendorUsdc.toFixed(2);

  let feeEl = document.getElementById('usdc-fee-note');
  if (feeUsdc > 0) {
    if (!feeEl) {
      feeEl = document.createElement('div');
      feeEl.id = 'usdc-fee-note';
      feeEl.className = 'usdc-fee-note';
      document.querySelector('.usdc-conversion').insertAdjacentElement('afterend', feeEl);
    }
    feeEl.textContent = t('feeNote', feeUsdc.toFixed(4));
  } else if (feeEl) {
    feeEl.remove();
  }
}

// ── Payment flow ──────────────────────────────────────────────────────────────
function initPayButton() {
  document.getElementById('btn-pay').addEventListener('click', () => handlePayment());
}

async function handlePayment() {
  const amountInput = document.getElementById('amount-input');
  const lkrAmount   = parseFloat(amountInput.value);

  if (!lkrAmount || lkrAmount <= 0)  return showError(t('invalidAmount'));
  if (lkrAmount > 1_000_000)         return showError(t('amountTooLarge'));

  const vendorUsdc = lkrAmount / (config.lkrPerUsdc || 300);
  const feeUsdc    = config.platformFeeWallet
    ? vendorUsdc * (config.platformFeeBps || 0) / 10000
    : 0;

  setLoading(true, t('processing'));

  const keyContainer = document.getElementById('private-key-container');
  const keyInput     = document.getElementById('private-key-input');
  const keyStatus    = document.getElementById('private-key-status');

  // Helper: get (or prompt for) private key
  const getPrivateKey = () => {
    const k = keyInput.value.trim();
    if (!k) {
      keyContainer.style.display = 'block';
      keyInput.focus();
      keyStatus.style.display = 'none';
      setLoading(false);
      keyInput.addEventListener('input', () => {
        const v = keyInput.value.trim();
        keyStatus.style.display = (v && v.startsWith('0x') && v.length === 66) ? 'flex' : 'none';
        const span = keyStatus.querySelector('span:last-child');
        if (span) span.textContent = t('readyToSign');
      }, { once: false });
      showError(t('pasteKeyPrompt'));
    }
    return k;
  };

  try {
    // ── Step 1: vendor payment ────────────────────────────────────────────────
    const privateKey = getPrivateKey();
    if (!privateKey) return;

    keyInput.disabled = true;
    const statusSpan = keyStatus.querySelector('span:last-child');
    if (statusSpan) statusSpan.textContent = t('signing');
    keyStatus.style.display = 'flex';

    const vendorTx = await runPaymentChallenge(`${apiBase}/pay`, vendorUsdc, 'payment', privateKey);

    // Record vendor payment; get transaction DB id for fee update
    let txDbId = null;
    try {
      const recRes = await fetch(`${apiBase}/record-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorAmount: vendorUsdc,
          feeAmount:    feeUsdc,
          vendorTx,
          feeStatus:    feeUsdc > 0 ? 'pending' : 'none',
        }),
      });
      if (recRes.ok) txDbId = (await recRes.json()).id;
    } catch { /* non-critical */ }

    // ── Step 2: platform fee (if configured) ─────────────────────────────────
    let feeTx = null;
    if (feeUsdc > 0 && config.platformFeeWallet) {
      setLoading(true, t('processingFee'));
      try {
        feeTx = await runPaymentChallenge('/api/platform/fee', feeUsdc, 'platform_fee', privateKey);
        if (txDbId) {
          fetch(`${apiBase}/record-transaction/${txDbId}/fee`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feeTx, feeStatus: 'settled' }),
          }).catch(() => {});
        }
      } catch (feeErr) {
        console.warn('Fee payment failed (vendor payment succeeded):', feeErr);
        // Continue — vendor was paid; fee tracked as pending in DB
      }
    }

    // Clear key
    keyInput.value    = '';
    keyInput.disabled = false;
    if (statusSpan) statusSpan.textContent = t('keyCleared');
    setTimeout(() => { keyContainer.style.display = 'none'; keyStatus.style.display = 'none'; }, 600);

    await showSuccess(vendorUsdc, vendorTx, config.network || 'eip155:84532');

  } catch (error) {
    keyInput.value    = '';
    keyInput.disabled = false;
    keyContainer.style.display = 'none';
    keyStatus.style.display    = 'none';
    console.error('Payment error:', error);
    showError(error.message || t('payFailed'));
  } finally {
    setLoading(false);
  }
}

/**
 * Full x402 challenge → sign → settle cycle for one payment.
 * Returns the transaction hash on success.
 */
async function runPaymentChallenge(endpoint, amount, label, privateKey) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, label }),
  });
  const data = await response.json();

  if (data.success && data.transaction) return data.transaction;

  if (response.status !== 402 && response.status !== 200) {
    throw new Error(data.message || data.error || 'Payment request failed');
  }

  const signed    = await signPaymentClientSide(data, privateKey);
  const settleRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PAYMENT-SIGNATURE': btoa(JSON.stringify(signed)),
    },
    body: JSON.stringify({ amount, label }),
  });
  const settled = await settleRes.json();
  if (!settleRes.ok) throw new Error(settled.message || settled.error || 'Payment failed');
  if (settled.success && settled.transaction) return settled.transaction;
  throw new Error('Payment failed: no transaction returned');
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

  const successTitle = document.querySelector('.payment-success h3');
  if (successTitle) successTitle.textContent = t('successTitle');

  const verStatus = document.getElementById('verification-status');
  if (verStatus) {
    verStatus.textContent  = t('verifying');
    verStatus.style.display = 'block';
    verStatus.className    = 'verification-status verifying';
    verifyOnChain(txHash, network).then(ok => {
      verStatus.textContent = ok ? t('verified') : t('unverified');
      verStatus.className   = `verification-status ${ok ? 'verified' : 'unverified'}`;
    }).catch(() => {
      verStatus.textContent = t('verifyUnavail');
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

// ── QR footer link ────────────────────────────────────────────────────────────
function initQrFooter() {
  const link = document.getElementById('footer-qr-link');
  if (link && slug) link.href = `/api/p/${slug}/qr`;
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
function setLoading(on, message) {
  const loadingEl = document.getElementById('payment-loading');
  const loadingText = loadingEl?.querySelector('p');
  if (loadingText && message) loadingText.textContent = message;
  if (loadingEl) loadingEl.style.display = on ? 'block' : 'none';
  const successEl = document.getElementById('payment-success');
  if (successEl && on) successEl.style.display = 'none';
  document.getElementById('payment-error').style.display = 'none';
  document.getElementById('btn-pay').disabled = on;
}

function showError(msg) {
  const el = document.getElementById('error-message');
  el.textContent = msg;
  document.getElementById('payment-error').style.display = 'block';
  setTimeout(() => { document.getElementById('payment-error').style.display = 'none'; }, 6000);
}
