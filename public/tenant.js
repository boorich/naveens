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
    // Contact buttons
    contactWhatsapp:  'WhatsApp',
    contactCall:      'Call',
    // Footer / modals
    myPayments:       'My payments',
    recentPayments:   'Recent Payments',
    linkCopied:       'Link copied!',
    // How it works
    howItWorksTitle:  'How it works',
    howItWorksStep1:  'Scan the QR code or open this link',
    howItWorksStep2:  'Enter the amount in LKR and tap Pay',
    howItWorksStep3:  'The seller receives your payment instantly',
    // FAQ / Trust
    faqTitle:         'Questions & Safety',
    faqQ1:            'Is my money safe?',
    faqA1:            "Yes. Your payment goes directly to the seller's wallet. Naveen's never holds your funds.",
    faqQ2:            'What is USDC?',
    faqA2:            'USDC is a dollar-stable digital currency on the Base network. 1 USDC ≈ 1 USD. It is not speculative — it holds its value.',
    faqQ3:            'What is a Private Key?',
    faqA3:            'Your private key is like a digital signature. It signs your payment on your device and is immediately erased from memory — it is never sent to any server.',
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
    // Contact buttons
    contactWhatsapp:  'WhatsApp',
    contactCall:      'ඇමතුම',
    // Footer / modals
    myPayments:       'මගේ ගෙවීම්',
    recentPayments:   'මෑත ගෙවීම්',
    linkCopied:       'සබැඳිය පිටපත් කරන ලදී!',
    // How it works
    howItWorksTitle:  'ක්‍රියා කරන ආකාරය',
    howItWorksStep1:  'QR කේතය ස්කෑන් කරන්න හෝ මෙම සබැඳිය විවෘත කරන්න',
    howItWorksStep2:  'LKR හි මුදල ඇතුළු කර ගෙවන්න 누르න්න',
    howItWorksStep3:  'විකුණුම්කරු ගෙවීම ක්ෂණිකව ලබා ගනී',
    // FAQ / Trust
    faqTitle:         'ප්‍රශ්න සහ ආරක්ෂාව',
    faqQ1:            'මගේ මුදල් ආරක්ෂිතද?',
    faqA1:            'ඔව්. ඔබේ ගෙවීම කෙළින්ම විකුණුම්කරුගේ පසුම්බියට යයි. Naveen\'s කිසිදා ඔබේ මුදල් රඳවා නොගනී.',
    faqQ2:            'USDC යනු කුමක්ද?',
    faqA2:            'USDC යනු Base ජාලය මත ඩොලර් ස්ථාවර ඩිජිටල් මුදලකි. 1 USDC ≈ 1 USD. එය ආයෝජනකාරී ක්‍රිප්ටෝ නොවේ — එහි වටිනාකම ස්ථාවරව පවතී.',
    faqQ3:            'Private Key යනු කුමක්ද?',
    faqA3:            'ඔබේ Private Key ඩිජිටල් අත්සනක් වැනිය. එය ඔබේ උපකරණයේ ගෙවීම අත්සන් කර ක්ෂණිකව මකා දමනු ලැබේ — කිසිදා server කිසිවකට යවනු නොලැබේ.',
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
    // Contact buttons
    contactWhatsapp:  'WhatsApp',
    contactCall:      'அழைப்பு',
    // Footer / modals
    myPayments:       'என் கட்டணங்கள்',
    recentPayments:   'சமீபத்திய கட்டணங்கள்',
    linkCopied:       'இணைப்பு நகலெடுக்கப்பட்டது!',
    // How it works
    howItWorksTitle:  'இது எப்படி செயல்படுகிறது',
    howItWorksStep1:  'QR குறியீட்டை ஸ்கேன் செய்யவும் அல்லது இந்த இணைப்பை திறக்கவும்',
    howItWorksStep2:  'LKR தொகையை உள்ளிட்டு செலுத்து அழுத்தவும்',
    howItWorksStep3:  'விற்பனையாளர் உடனடியாக கட்டணம் பெறுவார்',
    // FAQ / Trust
    faqTitle:         'கேள்விகள் மற்றும் பாதுகாப்பு',
    faqQ1:            'என் பணம் பாதுகாப்பாக உள்ளதா?',
    faqA1:            'ஆம். உங்கள் கட்டணம் நேரடியாக விற்பனையாளரின் வாலட்டிற்கு செல்கிறது. Naveen\'s உங்கள் நிதியை ஒருபோதும் வைத்திருக்காது.',
    faqQ2:            'USDC என்றால் என்ன?',
    faqA2:            'USDC என்பது Base நெட்வொர்க்கில் உள்ள டாலர்-நிலையான டிஜிட்டல் நாணயம். 1 USDC ≈ 1 USD. இது ஊகக் கிரிப்டோ அல்ல — இது தனது மதிப்பை நிலையாக வைத்திருக்கிறது.',
    faqQ3:            'Private Key என்றால் என்ன?',
    faqA3:            'உங்கள் Private Key ஒரு டிஜிட்டல் கையொப்பம் போன்றது. இது உங்கள் சாதனத்தில் கட்டணத்தில் கையெழுத்திட்டு உடனடியாக நினைவகத்திலிருந்து அழிக்கப்படுகிறது — எந்த சேவையகத்திற்கும் அனுப்பப்படுவதில்லை.',
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

function detectLang() {
  const saved = localStorage.getItem('lang');
  if (saved && T[saved]) return saved;
  const nav = (navigator.language || (navigator.languages && navigator.languages[0]) || 'en').toLowerCase();
  if (nav.startsWith('ta')) return 'ta';
  if (nav.startsWith('si')) return 'si';
  return 'en';
}

let lang = detectLang();

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
  initMyPayments();
});
// wallet-widget.js (loaded separately) handles the floating widget UI.

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

  const footerMyPayments = document.getElementById('footer-my-payments');
  if (footerMyPayments) footerMyPayments.textContent = t('myPayments');

  const myPaymentsTitle = document.querySelector('.my-payments-title');
  if (myPaymentsTitle) myPaymentsTitle.textContent = t('recentPayments');

  const managePromptEl = document.querySelector('.manage-token-label');
  if (managePromptEl) managePromptEl.textContent = t('managePrompt');
  const manageConfirmEl = document.getElementById('manage-token-confirm');
  if (manageConfirmEl) manageConfirmEl.textContent = t('manageConfirm');
  const manageCancelEl = document.getElementById('manage-token-cancel');
  if (manageCancelEl) manageCancelEl.textContent = t('manageCancel');

  // Contact buttons
  const waBtnLabel = document.getElementById('contact-whatsapp-label');
  if (waBtnLabel) waBtnLabel.textContent = t('contactWhatsapp');
  const callBtnLabel = document.getElementById('contact-call-label');
  if (callBtnLabel) callBtnLabel.textContent = t('contactCall');

  // How it works
  const hiwTitle = document.getElementById('hiw-title');
  if (hiwTitle) hiwTitle.textContent = t('howItWorksTitle');
  const hiwStep1 = document.getElementById('hiw-step1');
  if (hiwStep1) hiwStep1.textContent = t('howItWorksStep1');
  const hiwStep2 = document.getElementById('hiw-step2');
  if (hiwStep2) hiwStep2.textContent = t('howItWorksStep2');
  const hiwStep3 = document.getElementById('hiw-step3');
  if (hiwStep3) hiwStep3.textContent = t('howItWorksStep3');

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

  badge.addEventListener('click', () => {
    requireManageToken((token) => toggleAvailability(token, badge, badgeText));
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
      requireManageToken((token) => toggleAvailability(token, badge, badgeText));
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

// ─── Shared manage-token gate ─────────────────────────────────────────────────
// Call requireManageToken(cb) anywhere; cb(token) fires immediately if already
// saved, or after the user enters it once in the shared prompt.
function requireManageToken(callback) {
  const saved = localStorage.getItem(`manage-token:${slug}`);
  if (saved) { callback(saved); return; }
  showUnlockPrompt(callback);
}

function showUnlockPrompt(callback) {
  const overlay    = document.getElementById('manage-token-prompt');
  const input      = document.getElementById('manage-token-input');
  const errorEl    = document.getElementById('manage-token-error');
  const confirmBtn = document.getElementById('manage-token-confirm');
  const cancelBtn  = document.getElementById('manage-token-cancel');

  input.value = '';
  errorEl.style.display = 'none';
  overlay.style.display = 'flex';
  input.focus();

  const close = () => { overlay.style.display = 'none'; };

  const onConfirm = () => {
    const token = input.value.trim();
    if (!token) return;
    // Save optimistically — the callback clears it if the server returns 403
    localStorage.setItem(`manage-token:${slug}`, token);
    close();
    callback(token);
  };

  confirmBtn.onclick = onConfirm;
  cancelBtn.onclick  = close;
  input.onkeydown = (e) => { if (e.key === 'Enter') onConfirm(); if (e.key === 'Escape') close(); };
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

  // Helper: get (or prompt for) private key — checks wallet widget storage first
  const getPrivateKey = () => {
    const stored = wwLoad();
    if (stored?.key) return stored.key;        // ← one-tap if widget has a key

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

  // Track whether key came from storage (to decide whether to offer saving after payment)
  const keyWasStored = !!wwLoad();

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

    // Capture key before clearing — needed to offer saving it
    const justUsedKey = keyInput.value.trim();

    // Clear manual input
    keyInput.value    = '';
    keyInput.disabled = false;
    if (statusSpan) statusSpan.textContent = t('keyCleared');
    setTimeout(() => { keyContainer.style.display = 'none'; keyStatus.style.display = 'none'; }, 600);

    await showSuccess(vendorUsdc, vendorTx, config.network || 'eip155:84532');

    // Offer to save if the key was typed manually (not from the widget)
    if (!keyWasStored && justUsedKey) {
      window.dispatchEvent(new CustomEvent('ww:offer-save', { detail: { key: justUsedKey } }));
    }

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
      'X-Payment': btoa(JSON.stringify(signed)),
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
    alert(t('linkCopied'));
  });
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function setLoading(on, message) {
  const btn = document.getElementById('btn-pay');
  const successEl = document.getElementById('payment-success');
  if (successEl && on) successEl.style.display = 'none';
  document.getElementById('payment-error').style.display = 'none';

  if (on) {
    btn.disabled = true;
    btn.innerHTML = `<span class="pay-spinner"></span>${message || t('processing')}`;
    btn.classList.add('btn-loading');
  } else {
    btn.disabled = false;
    btn.textContent = t('payBtn');
    btn.classList.remove('btn-loading');
  }
}

function showError(msg) {
  const el = document.getElementById('error-message');
  el.textContent = msg;
  document.getElementById('payment-error').style.display = 'block';
  setTimeout(() => { document.getElementById('payment-error').style.display = 'none'; }, 6000);
}


// ─── Wallet storage helpers (shared key with wallet-widget.js) ─────────────────
// These are minimal localStorage ops only — no network, no server.
const WW_KEY  = 'x402:wallet:v1';
const wwLoad  = () => { try { return JSON.parse(localStorage.getItem(WW_KEY)); } catch { return null; } };
const wwSave  = (k, a) => localStorage.setItem(WW_KEY, JSON.stringify({ key: k, address: a, savedAt: Date.now() }));
const wwClear = () => localStorage.removeItem(WW_KEY);

// ─── My Payments (merchant self-service) ──────────────────────────────────────
function initMyPayments() {
  const overlay   = document.getElementById('my-payments-overlay');
  const closeBtn  = document.getElementById('my-payments-close');
  const footerBtn = document.getElementById('footer-my-payments');
  const listPanel = document.getElementById('my-payments-list');
  const body      = document.getElementById('my-payments-body');
  if (!overlay || !footerBtn) return;

  function open() {
    requireManageToken((token) => {
      overlay.style.display = 'flex';
      listPanel.style.display = 'block';
      fetchAndShow(token);
    });
  }

  function close() {
    overlay.style.display = 'none';
  }

  async function fetchAndShow(token) {
    body.innerHTML = '<p class="my-payments-loading">Loading…</p>';
    try {
      const res = await fetch(`${apiBase}/my-transactions`, {
        headers: { 'x-manage-token': token },
      });
      if (res.status === 403) {
        localStorage.removeItem(`manage-token:${slug}`);
        body.innerHTML = '';
        // Re-prompt via the shared gate; keep the modal open
        requireManageToken((t) => fetchAndShow(t));
        return;
      }
      const txs = await res.json();
      if (!txs.length) {
        body.innerHTML = '<p class="my-payments-empty">No payments yet.</p>';
        return;
      }
      body.innerHTML = txs.map(tx => {
        const date = new Date(tx.createdAt + 'Z').toLocaleString();
        const link = tx.vendorTx
          ? `<a class="my-payments-tx-link" href="https://sepolia.basescan.org/tx/${tx.vendorTx}" target="_blank" rel="noopener">↗ BaseScan</a>`
          : '';
        return `
          <div class="my-payments-row">
            <div class="my-payments-row-main">
              <span class="my-payments-amount">${tx.vendorAmount.toFixed(4)} USDC</span>
              ${link}
            </div>
            <div class="my-payments-date">${date}</div>
          </div>`;
      }).join('');
    } catch {
      body.innerHTML = '<p class="my-payments-empty">Could not load payments.</p>';
    }
  }

  footerBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}
