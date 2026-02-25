/**
 * Registration page — create a storefront and optionally generate a wallet in-browser.
 * Private key generation uses viem via the existing client-signer bundle.
 */

const nameInput        = document.getElementById('name');
const serviceInput     = document.getElementById('service-name');
const descInput        = document.getElementById('description');
const cityInput        = document.getElementById('city');
const whatsappInput    = document.getElementById('whatsapp');
const phoneInput       = document.getElementById('phone');
const walletInput      = document.getElementById('wallet');
const slugInput        = document.getElementById('slug');
const lkrInput         = document.getElementById('lkr-rate');
const slugPreview      = document.getElementById('slug-preview');
const slugNote         = document.getElementById('slug-note');
const walletNote       = document.getElementById('wallet-note');
const errorBanner      = document.getElementById('error-banner');
const errorBannerBot   = document.getElementById('error-banner-bottom');
const submitBtn        = document.getElementById('btn-submit');
const genWalletBtn     = document.getElementById('btn-gen-wallet');
const genKeyBox        = document.getElementById('generated-key-box');
const genPrivKeyEl     = document.getElementById('generated-private-key');
const copyKeyBtn       = document.getElementById('btn-copy-key');
const formSection      = document.getElementById('form-section');
const successCard      = document.getElementById('success-card');
const successUrl       = document.getElementById('success-url');
const visitBtn         = document.getElementById('btn-visit');
const copyUrlBtn       = document.getElementById('btn-copy-url');
const shareWaBtn       = document.getElementById('btn-share-wa');

let slugManuallyEdited = false;
let slugCheckTimer     = null;
let currentSlugOk      = false;
let generatedKey       = null; // held in memory until form submit, then cleared

// ── Slug auto-suggest from name ──────────────────────────────────────────────
nameInput.addEventListener('input', () => {
  if (!slugManuallyEdited) {
    slugInput.value = toSlug(nameInput.value);
    onSlugChange();
  }
});

slugInput.addEventListener('input', () => {
  slugManuallyEdited = true;
  slugInput.value = toSlug(slugInput.value);
  onSlugChange();
});

function toSlug(val) {
  return val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
}

function onSlugChange() {
  const slug = slugInput.value;
  if (!slug) {
    slugPreview.textContent = '';
    slugNote.textContent = 'Letters, numbers, hyphens only.';
    slugNote.className = 'field-note';
    currentSlugOk = false;
    return;
  }
  slugPreview.textContent = `${window.location.origin}/p/${slug}`;
  slugNote.textContent = 'Checking availability…';
  slugNote.className = 'field-note';
  currentSlugOk = false;

  clearTimeout(slugCheckTimer);
  slugCheckTimer = setTimeout(() => checkSlugAvailability(slug), 500);
}

async function checkSlugAvailability(slug) {
  try {
    const res = await fetch(`/api/available/${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (data.available) {
      slugNote.textContent = '✓ Available';
      slugNote.className = 'field-note success';
      currentSlugOk = true;
    } else {
      slugNote.textContent = '✗ Already taken — try a different one';
      slugNote.className = 'field-note error';
      currentSlugOk = false;
    }
  } catch {
    slugNote.textContent = 'Could not check availability';
    slugNote.className = 'field-note';
  }
}

// ── In-browser wallet generation ─────────────────────────────────────────────
genWalletBtn.addEventListener('click', async () => {
  genWalletBtn.disabled = true;
  genWalletBtn.textContent = 'Generating…';
  try {
    const { generatePrivateKey, privateKeyToAccount } = await import('/wallet-gen.bundle.js');
    const privateKey = generatePrivateKey();
    const account    = privateKeyToAccount(privateKey);

    walletInput.value     = account.address;
    generatedKey          = privateKey;
    genPrivKeyEl.textContent = privateKey;
    genKeyBox.style.display  = 'block';
    walletNote.textContent   = '✓ New wallet generated — save the private key below';
    walletNote.className     = 'field-note success';
  } catch (err) {
    showError('Could not generate wallet. Make sure the signer bundle is built: npm run build:signer');
    console.error(err);
  } finally {
    genWalletBtn.disabled = false;
    genWalletBtn.textContent = 'Generate one';
  }
});

copyKeyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(genPrivKeyEl.textContent).then(() => {
    copyKeyBtn.textContent = 'Copied!';
    setTimeout(() => { copyKeyBtn.textContent = 'Copy key'; }, 2000);
  });
});

// ── Wallet address validation ─────────────────────────────────────────────────
walletInput.addEventListener('input', () => {
  const val = walletInput.value.trim();
  if (val && !/^0x[0-9a-fA-F]{40}$/.test(val)) {
    walletNote.textContent = 'Must be a valid 0x… address (42 characters)';
    walletNote.className = 'field-note error';
  } else if (val) {
    walletNote.textContent = '✓ Looks good';
    walletNote.className = 'field-note success';
  } else {
    walletNote.textContent = 'Paste an existing Base wallet address, or generate a new one.';
    walletNote.className = 'field-note';
  }
});

// ── Form submission ───────────────────────────────────────────────────────────
submitBtn.addEventListener('click', async () => {
  hideError();

  const name        = nameInput.value.trim();
  const serviceName = serviceInput.value.trim();
  const description = descInput.value.trim();
  const city        = cityInput.value.trim();
  const whatsapp    = whatsappInput.value.trim();
  const phone       = phoneInput.value.trim();
  const wallet      = walletInput.value.trim();
  const slug        = slugInput.value.trim();
  const lkrPerUsdc  = parseFloat(lkrInput.value) || 300;

  // Validation
  if (!name)        return showError('Please enter your name.');
  if (!serviceName) return showError('Please enter what you sell.');
  if (!city)        return showError('Please enter your city.');
  if (!whatsapp)    return showError('Please enter your WhatsApp number.');
  if (!wallet || !/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
    return showError('Please enter a valid USDC wallet address, or generate one.');
  }
  if (!slug)        return showError('Please enter a page identifier (slug).');
  if (!currentSlugOk) return showError('That slug is not available or has not been checked yet. Please wait a moment.');

  submitBtn.disabled  = true;
  submitBtn.textContent = 'Creating your page…';

  try {
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, serviceName, description, city, whatsapp, phone, wallet, slug, lkrPerUsdc }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    // Clear the generated private key from memory (it's been saved, hopefully)
    generatedKey = null;

    const pageUrl = `${window.location.origin}/p/${data.slug}`;
    showSuccess(pageUrl, whatsapp);
  } catch (err) {
    showError(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create my payment page';
  }
});

// ── Success state ─────────────────────────────────────────────────────────────
function showSuccess(pageUrl, whatsapp) {
  formSection.style.display = 'none';
  successCard.style.display = 'block';
  successUrl.textContent    = pageUrl;

  visitBtn.onclick = () => window.open(pageUrl, '_blank');

  copyUrlBtn.onclick = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      copyUrlBtn.textContent = 'Copied!';
      setTimeout(() => { copyUrlBtn.textContent = 'Copy link'; }, 2000);
    });
  };

  const shareText = `Pay me directly in USDC — no bank needed: ${pageUrl}`;
  shareWaBtn.onclick = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function showError(msg) {
  errorBanner.textContent    = msg;
  errorBanner.style.display  = 'block';
  errorBannerBot.textContent   = msg;
  errorBannerBot.style.display = 'block';
  errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  errorBanner.style.display    = 'none';
  errorBannerBot.style.display = 'none';
}
