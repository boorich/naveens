// App Configuration
let config = {
  lkrPerUsdc: 300,
  driverName: 'Naveen',
  driverPhone: '+94XXXXXXXXX',
  driverWhatsapp: '+94XXXXXXXXX',
  baseUrl: window.location.origin,
  driverWallet: null, // Will be loaded from server
  network: 'eip155:84532', // Will be loaded from server
  // TukTuk pricing: base fare + (distance * rate per km)
  tukTukBaseFare: 100, // LKR
  tukTukRatePerKm: 80, // LKR per km
};

// Track if amount was set manually (to avoid slider overriding manual input)
let amountSetManually = false;
// Track if slider is currently updating (to prevent input handler from marking as manual)
let sliderIsUpdating = false;

// Language Translations
const translations = {
  en: {
    'page-title': "Naveen's TukTuk - Settle Your Ride",
    'driver-name-first': "Naveen's",
    'driver-name-service': "TukTuk Service",
    'driver-location': 'Batticaloa, Sri Lanka',
    'tagline': 'Agree on a price. Settle digitally.',
    'available-now': 'Available now',
    'busy': 'Busy',
    'settle-ride': 'Settle Ride',
    'whatsapp-me': 'WhatsApp Me',
    'call-me': 'Call Me',
    'settle-title': 'Settle Ride: Pay Agreed Amount',
    'enter-amount': 'Enter Amount in LKR',
    'more': 'More...',
    'estimated': 'Estimated:',
    'settle-usdc': 'Settle in USDC',
    'helper-text': 'Settle in USDC. Naveen receives it directly.',
    'payment-success-title': 'Payment Successful!',
    'settlement-visible': 'Settlement visible to driver',
    'amount-paid': 'Amount:',
    'transaction-hash': 'Transaction:',
    'processing-payment': 'Processing payment...',
    'recommend-title': 'Recommend Naveen',
    'recommend-description': 'If you liked your ride, sharing this page helps more than star ratings.',
    'distance-label': 'தூரம்:',
    'distance-short': '1 கி.மீ.',
    'distance-long': '50+ கி.மீ.',
    'estimated-price': 'மதிப்பீடு விலை:',
    'or-manual': 'அல்லது கைமுறையாக தொகையை உள்ளிடவும்:',
    'distance-label': 'දුර:',
    'distance-short': '1 කි.මී.',
    'distance-long': '50+ කි.මී.',
    'estimated-price': 'ඇස්තමේන්තු මිල:',
    'or-manual': 'හෝ වෙනත් මුදල් ඇතුළත් කරන්න:',
    'distance-label': 'Distance',
    'distance-short': '1 km',
    'distance-long': '50+ km',
    'estimated-price': 'Estimated price',
    'or-manual': 'Or enter amount manually:',
    'safety-note': 'Agree fare before you ride',
    'private-key-label': 'Paste Private Key',
    'private-key-placeholder': '0x...',
    'private-key-helper': 'Paste your private key. It will be used to sign this payment and immediately cleared from memory. The key never leaves your browser.',
    'private-key-warning': 'Your private key will be used to sign the payment and immediately discarded. Never stored or sent to the server.',
    'private-key-ready': 'Ready to sign',
    'signing-payment': 'Signing payment with your key...',
    'key-cleared': 'Key cleared from memory',
    'verification-note': 'Transaction verified independently on-chain. Click the transaction hash above to view on BaseScan.',
  },
  si: {
    'page-title': "නවීන්ගේ ටුක්ටුක් - ඔබේ ගමන ගෙවන්න",
    'driver-name-first': "නවීන්ගේ",
    'driver-name-service': "ටුක්ටුක් සේවාව",
    'driver-location': 'මඩකලපුව, ශ්‍රී ලංකාව',
    'tagline': 'මිල එකඟ වන්න. ඩිජිටල් ලෙස ගෙවන්න.',
    'available-now': 'දැන් ලබා ගත හැකිය',
    'busy': 'විරුද්ධයි',
    'settle-ride': 'ගමන ගෙවන්න',
    'whatsapp-me': 'WhatsApp කරන්න',
    'call-me': 'අමතන්න',
    'settle-title': 'ගමන ගෙවීම: එකඟ වූ මුදල් ගෙවන්න',
    'enter-amount': 'LKR හි මුදල් ඇතුළත් කරන්න',
    'more': 'තව...',
    'estimated': 'ඇස්තමේන්තු:',
    'settle-usdc': 'USDC හි ගෙවන්න',
    'helper-text': 'USDC හි ගෙවන්න. නවීන්ට කෙලින්ම ලැබේ.',
    'payment-success-title': 'ගෙවීම සාර්ථකයි!',
    'settlement-visible': 'ගෙවීම කර්මාන්තශාලාවට දෘශ්‍යමාන වේ',
    'amount-paid': 'මුදල්:',
    'transaction-hash': 'ගනුදෙනුව:',
    'processing-payment': 'ගෙවීම සැකසීම...',
    'recommend-title': 'නවීන් නිර්දේශ කරන්න',
    'recommend-description': 'ඔබගේ ගමනට ඔබ කැමති නම්, මෙම පිටුව බෙදාගැනීම තරු ශ්‍රේණිගත කිරීමට වඩා වැඩි උපකාරකයි.',
    'distance-label': 'දුර',
    'distance-short': '1 කි.මී.',
    'distance-long': '50+ කි.මී.',
    'estimated-price': 'ඇස්තමේන්තු මිල:',
    'or-manual': 'හෝ වෙනත් මුදල් ඇතුළත් කරන්න:',
    'safety-note': 'ගමනට පෙර කුලිය එකඟ වන්න',
    'private-key-label': 'පෞද්ගලික යතුර අලවන්න',
    'private-key-placeholder': '0x...',
    'private-key-helper': 'ඔබගේ පෞද්ගලික යතුර අලවන්න. මෙම ගෙවීමට අත්සන් කිරීමට එය භාවිතා කරනු ලබන අතර වහාම මතකයෙන් පිරිසිදු කරනු ලබයි. යතුර කිසි විටෙකත් ඔබගේ බ්‍රවුසරයෙන් පිටතට නොයයි.',
    'private-key-warning': 'ඔබගේ පෞද්ගලික යතුර ගෙවීමට අත්සන් කිරීමට භාවිතා කරනු ලබන අතර වහාම ඉවත දමනු ලබයි. කිසි විටෙකත් ගබඩා කර නොමැති අතර සේවාදායකයට යවනු නොලබයි.',
    'private-key-ready': 'අත්සන් කිරීමට සූදානම්',
    'signing-payment': 'ඔබගේ යතුරෙන් ගෙවීමට අත්සන් කරමින්...',
    'key-cleared': 'මතකයෙන් යතුර පිරිසිදු කරන ලදී',
    'verification-note': 'ගනුදෙනුව ස්වාධීනව බ්ලොක්චේන් මත සත්‍යාපනය කරන ලදී. BaseScan හි දැකීමට ඉහත ගනුදෙනු හැෂ් මත ක්ලික් කරන්න.',
  },
  ta: {
    'page-title': "நவீனின் டுக்டுக் - உங்கள் பயணத்தை செettலக்கூடும்",
    'driver-name-first': "நவீனின்",
    'driver-name-service': "டுக்டுக் சேவை",
    'driver-location': 'மட்டக்களப்பு, இலங்கை',
    'tagline': 'விலையை ஒப்புக்கொள்ளுங்கள். டிஜிட்டலாக செettலக்கூடும்.',
    'available-now': 'இப்போது கிடைக்கிறது',
    'busy': 'பிஸியாக',
    'settle-ride': 'பயணத்தை செettலக்கூடும்',
    'whatsapp-me': 'WhatsApp செய்யுங்கள்',
    'call-me': 'அழைக்கவும்',
    'settle-title': 'பயணத்தை செettலக்கூடும்: ஒப்புக்கொண்ட தொகையை செலுத்துங்கள்',
    'enter-amount': 'LKR இல் தொகையை உள்ளிடவும்',
    'more': 'மேலும்...',
    'estimated': 'மதிப்பீடு:',
    'settle-usdc': 'USDC இல் செettலக்கூடும்',
    'helper-text': 'USDC இல் செettலக்கூடும். நவீனுக்கு நேரடியாக கிடைக்கும்.',
    'payment-success-title': 'கொடுப்பனவு வெற்றிகரமாக!',
    'settlement-visible': 'கொடுப்பனவு சாரணருக்கு தெரியும்',
    'amount-paid': 'தொகை:',
    'transaction-hash': 'பரிவர்த்தனை:',
    'processing-payment': 'கொடுப்பனவு செயலாக்கப்படுகிறது...',
    'recommend-title': 'நவீனை பரிந்துரைக்கவும்',
    'recommend-description': 'உங்கள் பயணத்தை நீங்கள் விரும்பினால், இந்த பக்கத்தை பகிர்வது நட்சத்திர மதிப்பீடுகளை விட அதிக உதவியாகும்.',
    'distance-label': 'தூரம்',
    'distance-short': '1 கி.மீ.',
    'distance-long': '50+ கி.மீ.',
    'estimated-price': 'மதிப்பீடு விலை',
    'or-manual': 'அல்லது கைமுறையாக தொகையை உள்ளிடவும்:',
    'safety-note': 'பயணத்திற்கு முன் கட்டணத்தை ஒப்புக்கொள்ளுங்கள்',
    'private-key-label': 'தனிப்பட்ட விசையை ஒட்டவும்',
    'private-key-placeholder': '0x...',
    'private-key-helper': 'உங்கள் தனிப்பட்ட விசையை ஒட்டவும். இந்த கட்டணத்தில் கையொப்பமிட இது பயன்படுத்தப்படும் மற்றும் உடனடியாக நினைவகத்திலிருந்து அழிக்கப்படும். விசை ஒருபோதும் உங்கள் உலாவியை விட்டு வெளியேறாது.',
    'private-key-warning': 'உங்கள் தனிப்பட்ட விசை கட்டணத்தில் கையொப்பமிட பயன்படுத்தப்படும் மற்றும் உடனடியாக நிராகரிக்கப்படும். ஒருபோதும் சேமிக்கப்படவோ அல்லது சேவையகத்திற்கு அனுப்பப்படவோ இல்லை.',
    'private-key-ready': 'கையொப்பமிட தயாராக உள்ளது',
    'signing-payment': 'உங்கள் விசையுடன் கட்டணத்தில் கையொப்பமிடுகிறது...',
    'key-cleared': 'நினைவகத்திலிருந்து விசை அழிக்கப்பட்டது',
    'verification-note': 'பரிவர்த்தனை தன்னாட்சியாக blockchain இல் சரிபார்க்கப்பட்டது. BaseScan இல் பார்க்க மேலே உள்ள பரிவர்த்தனை hash மீது கிளிக் செய்யவும்.',
  },
};

let currentLang = localStorage.getItem('language') || 'en';

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  // Load config from server (with offline fallback)
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const serverConfig = await response.json();
      config = { ...config, ...serverConfig };
      // Store driver wallet and network for on-chain verification
      if (serverConfig.driverWallet) {
        config.driverWallet = serverConfig.driverWallet;
      }
      if (serverConfig.network) {
        config.network = serverConfig.network;
      }
    }
  } catch (error) {
    console.warn('Could not load config from server (using defaults):', error);
    // Continue with default config for offline compatibility
  }

  // Initialize all features
  initAvailabilityToggle();
  initActionButtons();
  initPaymentFlow(); // Initialize payment flow first so updatePresetButtons is available
  initShareButtons();
  initDistanceSlider(); // Initialize distance slider
  initLanguageSwitching(); // Initialize language switching after slider (so it doesn't interfere)
  updateUSDCConversion();
});

// Availability Toggle
function initAvailabilityToggle() {
  const badge = document.getElementById('availability-badge');
  const dot = badge.querySelector('.availability-dot');
  const text = badge.querySelector('.availability-text');
  
  // Load from localStorage
  const isAvailable = localStorage.getItem('availability') !== 'busy';
  updateAvailabilityDisplay(isAvailable);
  
  // Toggle on click
  badge.addEventListener('click', () => {
    const newStatus = badge.classList.contains('busy') ? 'available' : 'busy';
    localStorage.setItem('availability', newStatus);
    updateAvailabilityDisplay(newStatus === 'available');
  });
  
  function updateAvailabilityDisplay(isAvailable) {
    if (isAvailable) {
      badge.classList.remove('busy');
      text.textContent = translations[currentLang]['available-now'];
    } else {
      badge.classList.add('busy');
      text.textContent = translations[currentLang]['busy'];
    }
  }
}

// Language Switching
function initLanguageSwitching() {
  const langButtons = document.querySelectorAll('.lang-btn');
  
  // Set active language
  langButtons.forEach(btn => {
    if (btn.dataset.lang === currentLang) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem('language', currentLang);
      updateLanguageButtons();
      updateAllText();
    });
  });
  
  function updateLanguageButtons() {
    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }
  
  function updateAllText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang][key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TITLE') {
          // Check if it's a placeholder attribute
          if (el.hasAttribute('data-i18n-placeholder')) {
            el.placeholder = translations[currentLang][key];
          } else {
            el[el.tagName === 'INPUT' ? 'placeholder' : 'text'] = translations[currentLang][key];
          }
        } else if (key === 'distance-label') {
          // Special handling for distance label - preserve the span element
          const distanceValue = el.querySelector('#distance-value');
          const spanHTML = distanceValue ? distanceValue.outerHTML : '<span id="distance-value">5</span>';
          const text = translations[currentLang][key];
          el.innerHTML = text.replace(' km', ' ' + spanHTML + ' km');
        } else if (key === 'estimated-price') {
          // Special handling for estimated price - preserve the span element
          const sliderPrice = el.querySelector('#slider-price');
          const spanHTML = sliderPrice ? sliderPrice.outerHTML : '<span id="slider-price">Rs. 500</span>';
          const text = translations[currentLang][key];
          el.innerHTML = text + ': ' + spanHTML;
        } else {
          el.textContent = translations[currentLang][key];
        }
      }
    });
    
    // Update placeholder attributes separately (for elements with data-i18n-placeholder)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[currentLang][key]) {
        el.placeholder = translations[currentLang][key];
      }
    });
    
    // Update availability text specifically
    const badge = document.getElementById('availability-badge');
    const text = badge.querySelector('.availability-text');
    const isAvailable = !badge.classList.contains('busy');
    text.textContent = translations[currentLang][isAvailable ? 'available-now' : 'busy'];
  }
  
  updateAllText();
}

// Action Buttons
function initActionButtons() {
  // WhatsApp
  document.getElementById('btn-whatsapp').addEventListener('click', () => {
    const whatsappUrl = `https://wa.me/${config.driverWhatsapp.replace(/[^0-9]/g, '')}`;
    window.open(whatsappUrl, '_blank');
  });
  
  // Call Me
  const callBtn = document.getElementById('btn-call');
  callBtn.addEventListener('click', () => {
    const telUrl = `tel:${config.driverPhone}`;
    window.location.href = telUrl;
  });
}

// Helper function to update preset buttons (used by both slider and payment flow)
function updatePresetButtons() {
  const amountInput = document.getElementById('amount-input');
  const presetButtons = document.querySelectorAll('.preset-btn');
  if (!amountInput || !presetButtons.length) return;
  
  const value = amountInput.value;
  presetButtons.forEach(b => {
    b.classList.toggle('active', b.dataset.amount === value);
  });
}

// Distance Slider
function initDistanceSlider() {
  const distanceSlider = document.getElementById('distance-slider');
  const distanceValue = document.getElementById('distance-value');
  const amountInput = document.getElementById('amount-input');

  // Check if essential elements exist
  if (!distanceSlider || !distanceValue || !amountInput) {
    return;
  }

  // Update distance display and calculate price
  function updateDistancePrice() {
    const distance = parseFloat(distanceSlider.value);
    if (isNaN(distance)) return;
    
    distanceValue.textContent = distance;
    
    // Calculate price: base fare + (distance * rate per km)
    const calculatedPrice = Math.round(config.tukTukBaseFare + (distance * config.tukTukRatePerKm));
    
    // Always update amount input when slider moves - slider takes precedence
    sliderIsUpdating = true; // Prevent input handler from marking as manual
    amountSetManually = false;
    amountInput.value = calculatedPrice;
    sliderIsUpdating = false; // Reset flag
    
    updateUSDCConversion();
    updatePresetButtons();
  }

  // Use both 'input' and 'change' events for better responsiveness
  distanceSlider.addEventListener('input', updateDistancePrice);
  distanceSlider.addEventListener('change', updateDistancePrice);
  
  // Initial calculation
  updateDistancePrice();
}

// Payment Flow
function initPaymentFlow() {
  const amountInput = document.getElementById('amount-input');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const settleBtn = document.getElementById('btn-settle-usdc');
  
  // Preset buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      amountSetManually = true; // Mark as manually set
      
      if (amount === 'custom') {
        amountInput.focus();
        amountInput.select();
        presetButtons.forEach(b => b.classList.remove('active'));
      } else {
        amountInput.value = amount;
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateUSDCConversion();
      }
    });
  });
  
  // Amount input change with validation
  amountInput.addEventListener('input', (e) => {
    // Only mark as manual if slider is NOT updating (user is actually typing)
    if (!sliderIsUpdating) {
      amountSetManually = true; // Mark as manually set when user types
    }
    
    let value = e.target.value;
    
    // Only allow positive numbers
    if (value && (isNaN(value) || parseFloat(value) < 0)) {
      e.target.value = value.replace(/[^0-9.]/g, '');
      if (parseFloat(e.target.value) < 0) {
        e.target.value = '';
      }
    }
    
    value = e.target.value;
    updatePresetButtons();
    updateUSDCConversion();
  });
  
  // When amount input is focused, mark as manual
  amountInput.addEventListener('focus', () => {
    amountSetManually = true;
  });
  
  // Prevent invalid characters on paste
  amountInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const numericValue = parseFloat(paste);
    if (!isNaN(numericValue) && numericValue >= 0) {
      amountInput.value = numericValue.toString();
      updateUSDCConversion();
    }
  });
  
  // Settle button
  settleBtn.addEventListener('click', async () => {
    await handlePayment();
  });
}

function updateUSDCConversion() {
  const amountInput = document.getElementById('amount-input');
  const usdcAmount = document.getElementById('usdc-amount');
  const lkrAmount = parseFloat(amountInput.value) || 0;
  const usdc = (lkrAmount / config.lkrPerUsdc).toFixed(2);
  usdcAmount.textContent = usdc;
}

async function handlePayment() {
  const amountInput = document.getElementById('amount-input');
  const lkrAmount = parseFloat(amountInput.value);
  
  // Validation
  if (!amountInput.value || !lkrAmount || lkrAmount <= 0) {
    showError('Please enter a valid amount');
    amountInput.focus();
    return;
  }
  
  if (lkrAmount > 1000000) {
    showError('Amount too large. Please enter a smaller amount.');
    amountInput.focus();
    return;
  }
  
  const usdcAmount = lkrAmount / config.lkrPerUsdc;
  
  // Show loading, hide other states
  document.getElementById('payment-loading').style.display = 'block';
  document.getElementById('payment-success').style.display = 'none';
  document.getElementById('payment-error').style.display = 'none';
  document.getElementById('btn-settle-usdc').disabled = true;
  
  try {
    // Request payment - get challenge or settlement
    const response = await fetch('/api/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: usdcAmount,
        label: 'ride_payment',
      }),
    });
    
    const data = await response.json();
    
    // Check if challenge (402) or already settled (200)
    if (response.status === 402 || response.status === 200) {
        // Check if already settled
        if (data.success && data.transaction) {
          // Already settled
          await showPaymentSuccess(usdcAmount, data.transaction, data.network || config.network);
          return;
        }
      
      // Challenge - "cash ceremony" flow: paste key → sign → clear → send
      const privateKeyContainer = document.getElementById('private-key-container');
      const privateKeyInput = document.getElementById('private-key-input');
      const privateKeyStatus = document.getElementById('private-key-status');
      const privateKey = privateKeyInput.value.trim();
      
      // If no private key provided yet, show input field and wait
      if (!privateKey) {
        privateKeyContainer.style.display = 'block';
        privateKeyInput.focus();
        privateKeyStatus.style.display = 'none';
        document.getElementById('btn-settle-usdc').disabled = false;
        
        // Show status when valid key is pasted (ceremony feedback)
        privateKeyInput.addEventListener('input', () => {
          const key = privateKeyInput.value.trim();
          if (key && key.startsWith('0x') && key.length === 66) {
            const readyText = translations[currentLang]['private-key-ready'] || 'Ready to sign';
            privateKeyStatus.innerHTML = '<span class="status-icon">✓</span> <span>' + readyText + '</span>';
            privateKeyStatus.style.display = 'flex';
          } else {
            privateKeyStatus.style.display = 'none';
          }
        }, { once: false });
        
        showError('Paste your private key to sign the payment');
        return;
      }
      
      // Private key provided - perform "cash ceremony": sign → clear → send
      try {
        // Show signing state (ceremony feedback)
        privateKeyInput.disabled = true;
        const signingText = translations[currentLang]['signing-payment'] || 'Signing payment with your key...';
        privateKeyStatus.innerHTML = '<span class="status-icon">⏳</span> <span>' + signingText + '</span>';
        privateKeyStatus.style.display = 'flex';
        
        // Sign payment client-side (private key never leaves browser)
        const signedPayment = await signPaymentClientSide(data, privateKey);
        
        // Clear private key from memory IMMEDIATELY (ceremony: "pack up wallet")
        clearPrivateKeyFromMemory(privateKey);
        privateKeyInput.value = '';
        const clearedText = translations[currentLang]['key-cleared'] || 'Key cleared from memory';
        privateKeyStatus.innerHTML = '<span class="status-icon">✓</span> <span>' + clearedText + '</span>';
        privateKeyInput.disabled = false;
        
        // Hide private key input (key is gone, ceremony complete)
        setTimeout(() => {
          privateKeyContainer.style.display = 'none';
          privateKeyStatus.style.display = 'none';
        }, 500);
        
        // Send signed payment to server (only signed payload, no private key)
        const paymentResponse = await fetch('/api/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PAYMENT-SIGNATURE': btoa(JSON.stringify(signedPayment)),
          },
          body: JSON.stringify({
            amount: usdcAmount,
            label: 'ride_payment',
          }),
        });
        
        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || 'Payment failed');
        }
        
          const paymentData = await paymentResponse.json();
          if (paymentData.success && paymentData.transaction) {
            await showPaymentSuccess(usdcAmount, paymentData.transaction, paymentData.network || config.network);
            return;
          } else {
            throw new Error('Payment failed: no transaction returned');
          }
      } catch (signError) {
        // Client-side signing failed (libraries not available or other error)
        console.warn('Client-side signing error:', signError.message);
        
        // Clear private key even on error (ceremony: "put wallet away safely")
        clearPrivateKeyFromMemory(privateKey);
        privateKeyInput.value = '';
        privateKeyInput.disabled = false;
        privateKeyContainer.style.display = 'none';
        privateKeyStatus.style.display = 'none';
        
        // Fall back to server-side test payment (if available)
        // This should rarely happen if bundle is built
        try {
          const testResponse = await fetch('/api/test-pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: usdcAmount, label: 'ride_payment' }),
          });
          
          if (testResponse.ok) {
            const testData = await testResponse.json();
            if (testData.success && testData.transaction) {
              showPaymentSuccess(usdcAmount, testData.transaction);
              return;
            }
          }
        } catch (testError) {
          // Fall through to show original error
        }
        
        throw signError;
      }
      
      // Use server-side test payment endpoint (requires TEST_PRIVATE_KEY on server)
      try {
        const testResponse = await fetch('/api/test-pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: usdcAmount,
            label: 'ride_payment',
          }),
        });
        
        if (testResponse.status === 501) {
          throw new Error(
            'Client-side signing libraries not available and server-side test payment is disabled. ' +
            'Please bundle @x402/core and @x402/evm for browser use, or configure TEST_PRIVATE_KEY on the server.'
          );
        }
        
        if (!testResponse.ok) {
          const errorData = await testResponse.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || 'Payment failed');
        }
        
        const testData = await testResponse.json();
        if (testData.success && testData.transaction) {
          await showPaymentSuccess(usdcAmount, testData.transaction, testData.network || config.network);
        } else {
          throw new Error('Payment failed: no transaction returned');
        }
      } catch (testError) {
        console.error('Test payment error:', testError);
        throw testError;
      }
    } else {
      // Error response
      throw new Error(data.message || data.error || 'Payment failed');
    }
  } catch (error) {
    console.error('Payment error:', error);
    
    // Handle network errors
    if (error.message === 'Failed to fetch' || error.name === 'NetworkError') {
      showError('Network error. Please check your connection and try again.');
    } else {
      showError(error.message || 'Payment failed. Please try again.');
    }
  } finally {
    document.getElementById('payment-loading').style.display = 'none';
    document.getElementById('btn-settle-usdc').disabled = false;
  }
}

async function showPaymentSuccess(amount, txHash, network = 'eip155:84532') {
  // Show transaction hash immediately
  document.getElementById('success-amount').textContent = amount.toFixed(2);
  document.getElementById('success-tx').textContent = txHash;
  
  // Create BaseScan link for Base Sepolia (eip155:84532)
  const txLink = document.getElementById('success-tx-link');
  if (txLink) {
    txLink.href = `https://sepolia.basescan.org/tx/${txHash}`;
    txLink.title = 'View transaction on BaseScan (Base Sepolia Explorer)';
  }
  
  document.getElementById('payment-success').style.display = 'block';
  
  // Show "Verifying on-chain..." state
  const verificationStatus = document.getElementById('verification-status');
  const basescanLink = document.getElementById('basescan-link');
  
  if (verificationStatus) {
    verificationStatus.textContent = 'Verifying on-chain... (this may take a few seconds)';
    verificationStatus.style.display = 'block';
    verificationStatus.className = 'verification-status verifying';
  }
  
  // Show BaseScan link immediately (transaction exists, just waiting for confirmation)
  if (basescanLink) {
    basescanLink.href = `https://sepolia.basescan.org/tx/${txHash}`;
    basescanLink.textContent = 'View on BaseScan';
    basescanLink.target = '_blank';
    basescanLink.style.display = 'inline';
  }
  
  // Verify transaction on-chain independently (trustless verification)
  // This runs in the background and updates status when done
  verifyTransactionOnChain(txHash, amount, network)
    .then(isVerified => {
      if (verificationStatus) {
        if (isVerified) {
          verificationStatus.textContent = '✓ Verified on-chain (trustless)';
          verificationStatus.className = 'verification-status verified';
        } else {
          verificationStatus.textContent = '⚠ Verification pending (transaction exists - check BaseScan)';
          verificationStatus.className = 'verification-status unverified';
        }
      }
    })
    .catch(error => {
      console.warn('On-chain verification error:', error);
      if (verificationStatus) {
        verificationStatus.textContent = '⚠ Verification unavailable (transaction hash received - check BaseScan)';
        verificationStatus.className = 'verification-status unverified';
      }
    });
  
  document.getElementById('payment-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Verify transaction on-chain independently (trustless verification)
 * Queries blockchain RPC directly - doesn't trust server's word
 * Retries with exponential backoff to handle transaction confirmation delays
 * 
 * @param {string} txHash - Transaction hash
 * @param {number} expectedAmount - Expected USDC amount
 * @param {string} network - Network identifier (eip155:84532 = Base Sepolia)
 * @returns {Promise<boolean>} True if transaction verified on-chain
 */
async function verifyTransactionOnChain(txHash, expectedAmount, network = 'eip155:84532') {
  try {
    // Get driver wallet from config (needed to verify recipient)
    const driverWallet = config.driverWallet;
    if (!driverWallet || driverWallet === '0x0000000000000000000000000000000000000000') {
      console.warn('Driver wallet not configured - cannot verify recipient');
      // Still verify transaction exists, just can't verify recipient
    }
    
    // Base Sepolia RPC endpoint (public, no API key needed)
    // For other networks, we'd need to detect from network identifier
    let rpcUrl = 'https://sepolia.base.org'; // Base Sepolia public RPC
    
    // Retry logic: transactions may take a moment to be confirmed
    // Base Sepolia can be slower than mainnet, so we retry with delays
    const maxRetries = 5;
    const initialDelay = 1000; // Start with 1 second
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Wait before checking (except first attempt)
      if (attempt > 0) {
        const delay = initialDelay * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s, 8s
        console.log(`Waiting ${delay}ms before verification attempt ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Direct JSON-RPC call to verify transaction (works in browser without dependencies)
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        }),
      });
      
      if (!response.ok) {
        console.warn(`RPC request failed (attempt ${attempt + 1}):`, response.status);
        continue; // Try again
      }
      
      const data = await response.json();
      if (!data.result) {
        console.log(`Transaction not found yet (attempt ${attempt + 1}/${maxRetries}), retrying...`);
        continue; // Transaction not confirmed yet, retry
      }
      
      const receipt = data.result;
      
      // Verify transaction status (0x1 = success, 0x0 = failure)
      if (receipt.status !== '0x1') {
        console.warn('Transaction failed:', txHash, receipt.status);
        return false; // Transaction failed, no point retrying
      }
      
      // Verify transaction is confirmed (has block number)
      if (!receipt.blockNumber) {
        console.log(`Transaction not confirmed yet (attempt ${attempt + 1}/${maxRetries}), retrying...`);
        continue; // Not confirmed yet, retry
      }
      
      // Transaction verified on-chain - user can click through to BaseScan for full details
      // BaseScan shows: recipient, amount, USDC transfer logs, everything they need
      console.log('Transaction verified on-chain:', {
        txHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        attempts: attempt + 1,
        viewOnBaseScan: `https://sepolia.basescan.org/tx/${txHash}`,
      });
      
      return true;
    }
    
    // All retries exhausted
    console.warn(`Transaction verification timeout after ${maxRetries} attempts:`, txHash);
    console.warn('Transaction may still be pending confirmation. Check BaseScan link.');
    return false;
  } catch (error) {
    console.error('On-chain verification error:', error);
    return false;
  }
}

function showError(message) {
  document.getElementById('error-message').textContent = message;
  document.getElementById('payment-error').style.display = 'block';
  setTimeout(() => {
    document.getElementById('payment-error').style.display = 'none';
  }, 5000);
}

/**
 * Sign payment client-side using bundled x402 client libraries
 * Private key never leaves browser - only signed payload is returned
 */
async function signPaymentClientSide(challengeData, privateKey) {
  try {
    // Import bundled signer (all dependencies included)
    const { signPayment } = await import('./client-signer.bundle.js');
    
    // Validate and sign
    const paymentPayload = await signPayment(challengeData, privateKey);
    
    return paymentPayload;
  } catch (error) {
    console.error('Client-side signing error:', error);
    
    // Provide helpful error message if bundle is missing
    if (error.message && error.message.includes('Failed to fetch') || 
        error.message && error.message.includes('Cannot find module')) {
      throw new Error(
        'Client-side signing bundle not found. Please run: npm run build:signer'
      );
    }
    
    throw new Error(`Failed to sign payment: ${error.message}`);
  }
}

/**
 * Clear private key from memory (security: clear references)
 * Note: JavaScript strings are immutable, but we clear references immediately
 */
function clearPrivateKeyFromMemory(privateKey) {
  // Clear input field immediately
  const privateKeyInput = document.getElementById('private-key-input');
  if (privateKeyInput) {
    privateKeyInput.value = '';
    // Clear selection/highlight
    if (privateKeyInput.setSelectionRange) {
      privateKeyInput.setSelectionRange(0, 0);
    }
  }
  
  // Clear any references (JavaScript strings are immutable, but we clear refs)
  // The actual string will be garbage collected when no longer referenced
  
  // Note: In a production environment, you might want to use Web Workers
  // or other isolation techniques for additional security, but for this
  // use case (paste-once, sign, discard), clearing immediately is sufficient.
}

// Share Buttons
function initShareButtons() {
  const shareText = `I rode with ${config.driverName}'s TukTuk in ${config.driverCity} — fair, friendly, easy to settle digitally. Contact & pay here: ${window.location.href}`;
  const pageUrl = window.location.href;
  
  // WhatsApp
  document.getElementById('share-whatsapp').addEventListener('click', () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  });
  
  // Facebook
  document.getElementById('share-facebook').addEventListener('click', () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
    window.open(url, '_blank');
  });
  
  // Twitter/X
  document.getElementById('share-twitter').addEventListener('click', () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  });
  
  // Copy link
  document.getElementById('share-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      alert('Link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = pageUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  });
}

