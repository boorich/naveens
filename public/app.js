// App Configuration
let config = {
  lkrPerUsdc: 300,
  driverName: 'Naveen',
  driverPhone: '+94XXXXXXXXX',
  driverWhatsapp: '+94XXXXXXXXX',
  baseUrl: window.location.origin,
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
          el[el.tagName === 'INPUT' ? 'placeholder' : 'text'] = translations[currentLang][key];
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
    // Initial payment request
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
    
    if (response.status === 402) {
      // Payment required - decode PAYMENT-REQUIRED header
      const paymentRequiredHeader = response.headers.get('PAYMENT-REQUIRED');
      if (!paymentRequiredHeader) {
        throw new Error('Missing PAYMENT-REQUIRED header');
      }
      
      const paymentRequired = JSON.parse(
        atob(paymentRequiredHeader)
      );
      
      // Use test payment endpoint if available (server-side payment module execution)
      // Otherwise fall back to mock for development
      let paymentResponse;
      
      try {
        // Try test payment endpoint first (uses payment module server-side)
        console.log(`💳 Attempting test payment: ${usdcAmount} USDC`);
        paymentResponse = await fetch('/api/test-pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: usdcAmount,
            label: 'ride_payment',
          }),
        });
        
        console.log(`Test payment response status: ${paymentResponse.status}`);
        
        // If test endpoint is disabled (501), fall back to mock
        if (paymentResponse.status === 501) {
          throw new Error('TEST_DISABLED');
        }
        
      } catch (testError) {
        // Fall back to mock payment if test endpoint unavailable
        console.error('Test payment error:', testError);
        if (testError.message === 'TEST_DISABLED' || testError.name === 'TypeError') {
          console.log('Test payment unavailable, falling back to mock payment (will fail in coinbase mode)');
          const mockPaymentPayload = {
            version: 2,
            requirements: paymentRequired.accepts[0],
            signature: `0x${generateRandomHex(130)}`,
          };
          
          const paymentHeader = btoa(JSON.stringify(mockPaymentPayload));
          
          paymentResponse = await fetch('/api/pay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'PAYMENT-SIGNATURE': paymentHeader,
            },
            body: JSON.stringify({
              amount: usdcAmount,
              label: 'ride_payment',
            }),
          });
        } else {
          throw testError;
        }
      }
      
      // Handle response (test endpoint returns JSON directly)
      if (paymentResponse.ok) {
        const data = await paymentResponse.json();
        const settlement = { transaction: data.transaction, network: data.network };
        showPaymentSuccess(usdcAmount, settlement.transaction);
      } else {
        // Read error response
        let errorData;
        try {
          const text = await paymentResponse.text();
          errorData = text ? JSON.parse(text) : { error: 'Payment failed', message: `Status: ${paymentResponse.status}` };
        } catch (e) {
          errorData = { error: 'Payment failed', message: `Status: ${paymentResponse.status}` };
        }
        console.error('Payment failed:', errorData);
        throw new Error(errorData.message || errorData.error || 'Payment failed');
      }
    } else if (response.ok) {
      const settlementHeader = response.headers.get('PAYMENT-RESPONSE');
      const settlement = JSON.parse(
        Buffer.from(settlementHeader, 'base64').toString('utf-8')
      );
      showPaymentSuccess(usdcAmount, settlement.transaction);
    } else {
      let errorMessage = 'Payment failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Response not JSON, use default message
      }
      throw new Error(errorMessage);
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

function showPaymentSuccess(amount, txHash) {
  document.getElementById('success-amount').textContent = amount.toFixed(2);
  document.getElementById('success-tx').textContent = txHash;
  document.getElementById('payment-success').style.display = 'block';
  document.getElementById('payment-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showError(message) {
  document.getElementById('error-message').textContent = message;
  document.getElementById('payment-error').style.display = 'block';
  setTimeout(() => {
    document.getElementById('payment-error').style.display = 'none';
  }, 5000);
}

function generateRandomHex(length) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
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

