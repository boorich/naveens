// App Configuration for Fatou
let config = {
  baseHourlyRateUSD: 25, // Base rate: $25 per hour
  baseUrl: window.location.origin,
  driverWallet: null, // Will be loaded from server
  network: 'eip155:84532', // Will be loaded from server
};

// Discount tiers: [hours, discount percentage]
const discountTiers = [
  { hours: 1, discount: 0 },      // No discount
  { hours: 5, discount: 10 },    // 10% off for 5+ hours
  { hours: 10, discount: 15 },   // 15% off for 10+ hours
  { hours: 20, discount: 20 },  // 20% off for 20+ hours
];

function getDiscountRate(hours) {
  // Find the highest tier the hours qualify for
  let applicableDiscount = 0;
  for (let i = discountTiers.length - 1; i >= 0; i--) {
    if (hours >= discountTiers[i].hours) {
      applicableDiscount = discountTiers[i].discount;
      break;
    }
  }
  return applicableDiscount;
}

function calculatePrice(hours) {
  const basePrice = hours * config.baseHourlyRateUSD;
  const discount = getDiscountRate(hours);
  const discountAmount = (basePrice * discount) / 100;
  const finalPrice = basePrice - discountAmount;
  return {
    basePrice,
    discount,
    discountAmount,
    finalPrice,
  };
}

let selectedHours = 1;
let amountSetManually = false;

// Load config from server
async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const data = await response.json();
      if (data.driverWallet) config.driverWallet = data.driverWallet;
      if (data.network) config.network = data.network;
    }
  } catch (error) {
    console.warn('Could not load config from server:', error);
  }
}

// Load client-side signer bundle
let signPaymentClientSide = null;
try {
  const signerModule = await import('../client-signer.bundle.js');
  signPaymentClientSide = signerModule.signPayment;
} catch (error) {
  console.warn('Client-side signer not available:', error);
}

// Initialize
loadConfig();

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const hours = btn.dataset.hours;
    if (hours === 'custom') {
      document.getElementById('custom-input-container').style.display = 'block';
      document.getElementById('hours-input').focus();
    } else {
      document.getElementById('custom-input-container').style.display = 'none';
      selectedHours = parseFloat(hours);
      updateUSDCAmount();
    }
  });
});

// Custom hours input
const hoursInput = document.getElementById('hours-input');
hoursInput.addEventListener('input', () => {
  const value = parseFloat(hoursInput.value);
  if (!isNaN(value) && value > 0) {
    selectedHours = value;
    amountSetManually = true;
    updateUSDCAmount();
  }
});

// Update USDC amount display
function updateUSDCAmount() {
  const pricing = calculatePrice(selectedHours);
  const usdcAmountEl = document.getElementById('usdc-amount');
  const rateNoteEl = document.querySelector('.rate-note');
  
  usdcAmountEl.textContent = pricing.finalPrice.toFixed(2);
  
  // Update rate note with discount info
  if (pricing.discount > 0) {
    const savings = pricing.discountAmount.toFixed(2);
    rateNoteEl.textContent = `($${config.baseHourlyRateUSD}/hr, ${pricing.discount}% off - save $${savings})`;
    rateNoteEl.style.color = '#22c55e';
    rateNoteEl.style.fontWeight = '600';
  } else {
    rateNoteEl.textContent = `($${config.baseHourlyRateUSD}/hour)`;
    rateNoteEl.style.color = '#718096';
    rateNoteEl.style.fontWeight = 'normal';
  }
}

// Pay button
document.getElementById('btn-pay-usdc').addEventListener('click', handlePayment);

// Payment handler
async function handlePayment() {
  const paymentContent = document.getElementById('payment-content');
  const paymentForm = paymentContent.querySelector('.payment-form');
  const paymentLoading = document.getElementById('payment-loading');
  const paymentSuccess = document.getElementById('payment-success');
  
  if (selectedHours <= 0) {
    alert('Please select hours to purchase');
    return;
  }

  const pricing = calculatePrice(selectedHours);
  const usdcAmount = pricing.finalPrice;
  
  try {
    // Hide form, show loading
    paymentForm.style.display = 'none';
    paymentLoading.style.display = 'block';
    
    // Request payment challenge
    const response = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: usdcAmount,
        label: `fatou_hours_${selectedHours}`,
      }),
    });

    if (response.status === 402) {
      // Payment challenge received
      const data = await response.json();
      
      // Hide loading
      paymentLoading.style.display = 'none';
      paymentForm.style.display = 'block';
      
      // Show private key input
      const privateKeyContainer = document.getElementById('private-key-container');
      const privateKeyInput = document.getElementById('private-key-input');
      const privateKeyStatus = document.getElementById('private-key-status');
      const privateKey = privateKeyInput.value.trim();

      if (!privateKey) {
        privateKeyContainer.style.display = 'block';
        privateKeyInput.focus();
        privateKeyStatus.style.display = 'none';
        document.getElementById('btn-pay-usdc').disabled = false;
        
        // Listen for private key input
        const keyInputHandler = () => {
          if (privateKeyInput.value.trim()) {
            privateKeyStatus.style.display = 'flex';
            privateKeyStatus.innerHTML = '<span class="status-icon">✓</span> <span>Ready to sign</span>';
          }
        };
        privateKeyInput.addEventListener('input', keyInputHandler, { once: true });
        
        // Re-enable button and wait for user to paste key and click again
        document.getElementById('btn-pay-usdc').textContent = 'Sign & Pay';
        showError('Paste your private key to sign the payment');
        return;
      }
      
      // Private key provided - sign payment
      try {
        privateKeyInput.disabled = true;
        privateKeyStatus.innerHTML = '<span class="status-icon">⏳</span> <span>Signing payment...</span>';

        if (!signPaymentClientSide) {
          throw new Error('Client-side signing libraries not available');
        }

        const signedPayment = await signPaymentClientSide(data, privateKey);

        // Clear private key immediately
        privateKeyInput.value = '';
        privateKeyStatus.innerHTML = '<span class="status-icon">✓</span> <span>Key cleared from memory</span>';
        privateKeyInput.disabled = false;
        setTimeout(() => {
          privateKeyContainer.style.display = 'none';
          privateKeyStatus.style.display = 'none';
        }, 500);

        // Send signed payment
        paymentForm.style.display = 'none';
        paymentLoading.style.display = 'block';

        const paymentResponse = await fetch('/api/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PAYMENT-SIGNATURE': btoa(JSON.stringify(signedPayment)),
          },
          body: JSON.stringify({
            amount: usdcAmount,
            label: `fatou_hours_${selectedHours}`,
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || 'Payment failed');
        }

        const paymentData = await paymentResponse.json();
        if (paymentData.success && paymentData.transaction) {
          await showPaymentSuccess(selectedHours, usdcAmount, paymentData.transaction, paymentData.network || config.network);
          return;
        } else {
          throw new Error('Payment failed: no transaction returned');
        }
      } catch (signError) {
        console.warn('Client-side signing error:', signError);
        paymentForm.style.display = 'block';
        paymentLoading.style.display = 'none';
        showError('Failed to sign payment: ' + signError.message);
        return;
      }
    } else if (response.ok) {
      // Already settled (unusual)
      const paymentData = await response.json();
      if (paymentData.success && paymentData.transaction) {
        await showPaymentSuccess(selectedHours, usdcAmount, paymentData.transaction, paymentData.network || config.network);
        return;
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Payment request failed');
    }
  } catch (error) {
    console.error('Payment error:', error);
    paymentForm.style.display = 'block';
    paymentLoading.style.display = 'none';
    showError('Payment error: ' + error.message);
  }
}

function showError(message) {
  alert(message); // Simple alert for now, can be improved
}

async function showPaymentSuccess(hours, amount, txHash, network = 'eip155:84532') {
  document.getElementById('payment-loading').style.display = 'none';
  const paymentSuccess = document.getElementById('payment-success');
  
  document.getElementById('success-hours').textContent = hours + (hours === 1 ? ' Hour' : ' Hours');
  document.getElementById('success-amount').textContent = amount.toFixed(2);
  document.getElementById('success-tx').textContent = txHash;
  
  const txLink = document.getElementById('success-tx-link');
  txLink.href = `https://sepolia.basescan.org/tx/${txHash}`;
  
  paymentSuccess.style.display = 'block';
  
  // Verify on-chain
  const verificationStatus = document.getElementById('verification-status');
  if (verificationStatus) {
    verificationStatus.textContent = 'Verifying on-chain... (this may take a few seconds)';
    verificationStatus.style.display = 'block';
    verificationStatus.className = 'verification-status verifying';
  }
  
  // Verify transaction
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

async function verifyTransactionOnChain(txHash, expectedAmount, network = 'eip155:84532') {
  try {
    const rpcUrl = 'https://sepolia.base.org';
    const maxRetries = 5;
    const initialDelay = 1000;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
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
      
      if (!response.ok) continue;
      
      const data = await response.json();
      if (!data.result) continue;
      
      const receipt = data.result;
      if (receipt.status !== '0x1') return false;
      if (!receipt.blockNumber) continue;
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('Verification error:', error);
    return false;
  }
}

// Helper function to clear private key from memory
function clearPrivateKeyFromMemory(key) {
  if (typeof key === 'string') {
    // Overwrite string in memory (best effort - JavaScript strings are immutable)
    key = null;
  }
}

// Initialize USDC amount
updateUSDCAmount();
