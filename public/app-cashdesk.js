// Cash Register App - Config-driven, owner-editable

let storeConfig = null;
let ownerSession = null; // { token, expiresAt }
let selectedQuantity = 1;

// Load store config
async function loadStoreConfig() {
  try {
    const response = await fetch('/api/store-config');
    if (response.ok) {
      storeConfig = await response.json();
      renderStoreConfig();
      return storeConfig;
    }
  } catch (error) {
    console.error('Failed to load store config:', error);
  }
  return null;
}

// Render store config to page
function renderStoreConfig() {
  if (!storeConfig) return;

  // Profile
  const profile = storeConfig.profile || {};
  document.getElementById('profile-photo').src = profile.photoUrl || '';
  document.getElementById('profile-photo').alt = profile.name || '';
  document.getElementById('profile-photo').style.display = profile.photoUrl ? 'block' : 'none';
  
  document.getElementById('profile-name').textContent = profile.name || '';
  
  if (profile.title) {
    document.getElementById('profile-title').textContent = profile.title;
    document.getElementById('profile-title').style.display = 'block';
  }
  
  if (profile.subtitle) {
    document.getElementById('profile-subtitle').textContent = profile.subtitle;
    document.getElementById('profile-subtitle').style.display = 'block';
  }
  
  if (profile.tagline) {
    document.getElementById('profile-tagline').textContent = profile.tagline;
    document.getElementById('profile-tagline').style.display = 'block';
  }

  document.getElementById('page-title').textContent = `${profile.name || 'Cash Register'} - Buy & Pay`;

  // Product
  const product = storeConfig.product || {};
  document.getElementById('product-title').textContent = product.title || 'Purchase';
  document.getElementById('product-description').textContent = product.description || 'Buy and pay in USDC.';

  // Check if owner is set - show appropriate UI
  const hasOwner = storeConfig.owner && 
                   storeConfig.owner !== '0x0000000000000000000000000000000000000000' &&
                   storeConfig.owner.startsWith('0x');
  
  if (hasOwner) {
    // Owner exists - show regular payment section and edit button
    document.getElementById('claim-ownership-section').style.display = 'none';
    document.getElementById('payment-section').style.display = 'block';
    
    // Setup payment presets
    setupPaymentPresets(product);
    
    // Update price display
    updatePrice();
    
    // Show edit button
    setupEditButton();
  } else {
    // No owner - show claim ownership section
    document.getElementById('claim-ownership-section').style.display = 'block';
    document.getElementById('payment-section').style.display = 'none';
    
    // Don't show edit button until ownership is claimed
    document.getElementById('btn-edit').style.display = 'none';
  }
}

// Always show Edit button - ownership verification happens when clicked (discrete action)
function setupEditButton() {
  const editBtn = document.getElementById('btn-edit');
  if (editBtn) {
    editBtn.style.display = 'inline-block';
    // Remove existing listeners to avoid duplicates
    const newBtn = editBtn.cloneNode(true);
    editBtn.parentNode.replaceChild(newBtn, editBtn);
    document.getElementById('btn-edit').addEventListener('click', async () => await showEditModal());
  }
}

function setupPaymentPresets(product) {
  const presets = product.presets || [1, 5, 10, 20];
  const container = document.getElementById('preset-buttons');
  container.innerHTML = '';
  
  presets.forEach((preset, index) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn' + (index === 0 ? ' active' : '');
    btn.dataset.quantity = preset;
    
    const discount = getDiscount(preset, product.discounts || []);
    let label = `${preset} ${product.unit || 'item'}`;
    if (discount > 0) {
      label += ` <span class="discount-badge">${discount}% off</span>`;
    }
    btn.innerHTML = label;
    
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('custom-input-container').style.display = 'none';
      selectedQuantity = preset;
      updatePrice();
    });
    
    container.appendChild(btn);
  });
  
  // Add custom button
  const customBtn = document.createElement('button');
  customBtn.className = 'preset-btn';
  customBtn.dataset.quantity = 'custom';
  customBtn.textContent = 'Custom';
  customBtn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    customBtn.classList.add('active');
    document.getElementById('custom-input-container').style.display = 'block';
    document.getElementById('quantity-input').focus();
  });
  container.appendChild(customBtn);
}

function getDiscount(quantity, discounts) {
  for (let i = discounts.length - 1; i >= 0; i--) {
    if (quantity >= discounts[i].threshold) {
      return discounts[i].discount;
    }
  }
  return 0;
}

function calculatePrice(quantity, product) {
  const basePrice = (product.basePrice || 0) * quantity;
  const discount = getDiscount(quantity, product.discounts || []);
  const discountAmount = (basePrice * discount) / 100;
  const finalPrice = basePrice - discountAmount;
  return { basePrice, discount, discountAmount, finalPrice };
}

function updatePrice() {
  const product = storeConfig?.product || {};
  const pricing = calculatePrice(selectedQuantity, product);
  const rateNote = document.getElementById('rate-note');
  
  document.getElementById('usdc-amount').textContent = pricing.finalPrice.toFixed(2);
  
  if (pricing.discount > 0) {
    rateNote.textContent = `($${product.basePrice || 0}/${product.unit || 'unit'}, ${pricing.discount}% off - save $${pricing.discountAmount.toFixed(2)})`;
    rateNote.style.color = '#22c55e';
    rateNote.style.fontWeight = '600';
  } else {
    rateNote.textContent = `($${product.basePrice || 0}/${product.unit || 'unit'})`;
    rateNote.style.color = '#718096';
    rateNote.style.fontWeight = 'normal';
  }
}

// Custom quantity input
document.getElementById('quantity-input')?.addEventListener('input', (e) => {
  const value = parseFloat(e.target.value);
  if (!isNaN(value) && value > 0) {
    selectedQuantity = value;
    updatePrice();
  }
});

// Load client-side signer
let signPaymentClientSide = null;
let signMessageClientSide = null;
let getAddressFromPrivateKey = null;
let generateWalletClientSide = null;
try {
  const signerModule = await import('./client-signer.bundle.js');
  signPaymentClientSide = signerModule.signPayment;
  signMessageClientSide = signerModule.signMessage;
  getAddressFromPrivateKey = signerModule.getAddressFromPrivateKey;
  generateWalletClientSide = signerModule.generateWallet;
} catch (error) {
  console.warn('Client-side signer not available:', error);
}

// Load QRCode library (from npm package, bundled or CDN)
let QRCode = null;
try {
  // Try to use qrcode library if available via CDN or import
  // For browser use, we'll use a simple approach with qrcode.js CDN
  if (typeof window !== 'undefined' && window.QRCode) {
    QRCode = window.QRCode;
  }
} catch (error) {
  console.warn('QRCode library not available:', error);
}

// Claim Ownership handler (fixed $1 USDC)
document.getElementById('btn-claim-ownership')?.addEventListener('click', handleClaimOwnership);

// Payment handler
document.getElementById('btn-pay-usdc')?.addEventListener('click', handlePayment);

// Handle claim ownership flow ($1 USDC)
async function handleClaimOwnership() {
  const claimContent = document.getElementById('claim-content');
  const claimForm = claimContent.querySelector('.claim-form');
  const claimLoading = document.getElementById('claim-loading');
  const claimSuccess = document.getElementById('claim-success');
  const CLAIM_AMOUNT = 1.00; // Fixed $1 USDC for ownership claim
  
  try {
    claimForm.style.display = 'none';
    claimLoading.style.display = 'block';
    
    const response = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: CLAIM_AMOUNT,
        label: 'ownership_claim',
      }),
    });

    if (response.status === 402) {
      const data = await response.json();
      claimLoading.style.display = 'none';
      claimForm.style.display = 'block';
      
      const privateKeyContainer = document.getElementById('claim-private-key-container');
      const privateKeyInput = document.getElementById('claim-private-key-input');
      const privateKeyStatus = document.getElementById('claim-private-key-status');
      const privateKey = privateKeyInput.value.trim();

      if (!privateKey) {
        privateKeyContainer.style.display = 'block';
        privateKeyInput.focus();
        privateKeyStatus.style.display = 'none';
        document.getElementById('btn-claim-ownership').disabled = false;
        
        const keyInputHandler = () => {
          if (privateKeyInput.value.trim()) {
            privateKeyStatus.style.display = 'flex';
            privateKeyStatus.innerHTML = '<span class="status-icon">✓</span> <span>Ready to sign</span>';
          }
        };
        privateKeyInput.addEventListener('input', keyInputHandler, { once: true });
        
        document.getElementById('btn-claim-ownership').textContent = 'Sign & Claim Ownership';
        return;
      }
      
      try {
        privateKeyInput.disabled = true;
        privateKeyStatus.innerHTML = '<span class="status-icon">⏳</span> <span>Signing payment...</span>';

        if (!signPaymentClientSide) {
          throw new Error('Client-side signing libraries not available');
        }

        const signedPayment = await signPaymentClientSide(data, privateKey);
        privateKeyInput.value = '';
        privateKeyStatus.innerHTML = '<span class="status-icon">✓</span> <span>Key cleared from memory</span>';
        privateKeyInput.disabled = false;
        setTimeout(() => {
          privateKeyContainer.style.display = 'none';
          privateKeyStatus.style.display = 'none';
        }, 500);

        claimForm.style.display = 'none';
        claimLoading.style.display = 'block';

        const paymentResponse = await fetch('/api/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PAYMENT-SIGNATURE': btoa(JSON.stringify(signedPayment)),
          },
          body: JSON.stringify({
            amount: CLAIM_AMOUNT,
            label: 'ownership_claim',
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || 'Ownership claim failed');
        }

        const paymentData = await paymentResponse.json();
        console.log('Payment response data:', paymentData);
        
        // Payment succeeded - owner may have been set even if transaction hash is missing
        if (paymentData.success) {
          // Owner was set! Reload config and go directly to edit form
          if (paymentData.ownerOptIn) {
            // Force reload config from server (with owner now set)
            await loadStoreConfig();
            
            // Hide claim section, show payment section
            document.getElementById('claim-ownership-section').style.display = 'none';
            document.getElementById('payment-section').style.display = 'block';
            
            // Setup edit button now that owner exists
            setupEditButton();
          }
          
          // Show brief success message, then directly open edit modal
          const successMsg = paymentData.transaction 
            ? `✅ Ownership claimed! Transaction: ${paymentData.transaction.substring(0, 10)}...`
            : `✅ Ownership claimed! Payment processed successfully.`;
          
          // Small delay to show success, then open edit
          alert(successMsg + '\n\nOpening edit form to customize your cash register...');
          
          // Open edit modal directly (async)
          await showEditModal();
          
          return;
        } else {
          // Payment failed
          console.error('Payment response indicates failure:', paymentData);
          throw new Error(`Ownership claim failed: ${paymentData.error || paymentData.message || 'payment processing failed'}`);
        }
      } catch (signError) {
        console.warn('Client-side signing error:', signError);
        claimForm.style.display = 'block';
        claimLoading.style.display = 'none';
        alert('Failed to sign payment: ' + signError.message);
        return;
      }
    } else if (response.ok) {
      const paymentData = await response.json();
      if (paymentData.success && paymentData.transaction) {
        await showClaimSuccess(CLAIM_AMOUNT, paymentData.transaction, paymentData.network || 'eip155:84532');
        return;
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Ownership claim request failed');
    }
  } catch (error) {
    console.error('Ownership claim error:', error);
    claimForm.style.display = 'block';
    claimLoading.style.display = 'none';
    alert('Ownership claim error: ' + error.message);
  }
}

async function showClaimSuccess(amount, txHash, network = 'eip155:84532') {
  document.getElementById('claim-loading').style.display = 'none';
  const claimSuccess = document.getElementById('claim-success');
  
  document.getElementById('claim-tx').textContent = txHash;
  const txLink = document.getElementById('claim-tx-link');
  txLink.href = `https://sepolia.basescan.org/tx/${txHash}`;
  
  claimSuccess.style.display = 'block';
  
  const verificationStatus = document.getElementById('claim-verification-status');
  if (verificationStatus) {
    verificationStatus.textContent = 'Verifying on-chain... (this may take a few seconds)';
    verificationStatus.style.display = 'block';
    verificationStatus.className = 'verification-status verifying';
  }
  
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
  
  // Handle continue button - reload config and show regular payment section
  document.getElementById('btn-continue-after-claim')?.addEventListener('click', async () => {
    await loadStoreConfig(); // Reload to get updated config with owner
    window.location.reload(); // Simple reload to switch to payment section
  });
}

async function handlePayment() {
  const paymentContent = document.getElementById('payment-content');
  const paymentForm = paymentContent.querySelector('.payment-form');
  const paymentLoading = document.getElementById('payment-loading');
  const paymentSuccess = document.getElementById('payment-success');
  
  if (selectedQuantity <= 0) {
    alert('Please select quantity to purchase');
    return;
  }

  const product = storeConfig?.product || {};
  const pricing = calculatePrice(selectedQuantity, product);
  const usdcAmount = pricing.finalPrice;
  
  try {
    paymentForm.style.display = 'none';
    paymentLoading.style.display = 'block';
    
    const response = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: usdcAmount,
        label: `purchase_${selectedQuantity}_${product.unit || 'item'}`,
      }),
    });

    if (response.status === 402) {
      const data = await response.json();
      paymentLoading.style.display = 'none';
      paymentForm.style.display = 'block';
      
      const privateKeyContainer = document.getElementById('private-key-container');
      const privateKeyInput = document.getElementById('private-key-input');
      const privateKeyStatus = document.getElementById('private-key-status');
      const privateKey = privateKeyInput.value.trim();

      if (!privateKey) {
        privateKeyContainer.style.display = 'block';
        privateKeyInput.focus();
        privateKeyStatus.style.display = 'none';
        document.getElementById('btn-pay-usdc').disabled = false;
        
        const keyInputHandler = () => {
          if (privateKeyInput.value.trim()) {
            privateKeyStatus.style.display = 'flex';
            privateKeyStatus.innerHTML = '<span class="status-icon">✓</span> <span>Ready to sign</span>';
          }
        };
        privateKeyInput.addEventListener('input', keyInputHandler, { once: true });
        
        document.getElementById('btn-pay-usdc').textContent = 'Sign & Pay';
        alert('Paste your private key to sign the payment');
        return;
      }
      
      try {
        privateKeyInput.disabled = true;
        privateKeyStatus.innerHTML = '<span class="status-icon">⏳</span> <span>Signing payment...</span>';

        if (!signPaymentClientSide) {
          throw new Error('Client-side signing libraries not available');
        }

        const signedPayment = await signPaymentClientSide(data, privateKey);
        privateKeyInput.value = '';
        privateKeyStatus.innerHTML = '<span class="status-icon">✓</span> <span>Key cleared from memory</span>';
        privateKeyInput.disabled = false;
        setTimeout(() => {
          privateKeyContainer.style.display = 'none';
          privateKeyStatus.style.display = 'none';
        }, 500);

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
            label: `purchase_${selectedQuantity}_${product.unit || 'item'}`,
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || 'Payment failed');
        }

        const paymentData = await paymentResponse.json();
        if (paymentData.success && paymentData.transaction) {
          // Reload config in case owner was set (first payment opt-in)
          if (paymentData.ownerOptIn) {
            await loadStoreConfig();
          }
          await showPaymentSuccess(selectedQuantity, usdcAmount, paymentData.transaction, paymentData.network || 'eip155:84532', paymentData.ownerOptIn);
          return;
        } else {
          throw new Error('Payment failed: no transaction returned');
        }
      } catch (signError) {
        console.warn('Client-side signing error:', signError);
        paymentForm.style.display = 'block';
        paymentLoading.style.display = 'none';
        alert('Failed to sign payment: ' + signError.message);
        return;
      }
    } else if (response.ok) {
      const paymentData = await response.json();
      if (paymentData.success && paymentData.transaction) {
        // Reload config in case owner was set (first payment opt-in)
        if (paymentData.ownerOptIn) {
          await loadStoreConfig();
        }
        await showPaymentSuccess(selectedQuantity, usdcAmount, paymentData.transaction, paymentData.network || 'eip155:84532', paymentData.ownerOptIn);
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
    alert('Payment error: ' + error.message);
  }
}

async function showPaymentSuccess(quantity, amount, txHash, network = 'eip155:84532', ownerOptIn = false) {
  document.getElementById('payment-loading').style.display = 'none';
  const paymentSuccess = document.getElementById('payment-success');
  const product = storeConfig?.product || {};
  
  document.getElementById('success-quantity').textContent = quantity + ' ' + (product.unit || 'item' + (quantity === 1 ? '' : 's'));
  document.getElementById('success-amount').textContent = amount.toFixed(2);
  document.getElementById('success-tx').textContent = txHash;
  
  const txLink = document.getElementById('success-tx-link');
  txLink.href = `https://sepolia.basescan.org/tx/${txHash}`;
  
  // Show opt-in message if this was the first payment
  if (ownerOptIn) {
    const optInMsg = document.createElement('div');
    optInMsg.className = 'opt-in-notice';
    optInMsg.innerHTML = `
      <div style="background: #22c55e; color: white; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-weight: 600;">
        🎉 You're now the owner! This was the first payment. Click "Edit" to customize this cash register.
      </div>
    `;
    paymentSuccess.insertBefore(optInMsg, paymentSuccess.firstChild);
  }
  
  paymentSuccess.style.display = 'block';
  
  const verificationStatus = document.getElementById('verification-status');
  if (verificationStatus) {
    verificationStatus.textContent = 'Verifying on-chain... (this may take a few seconds)';
    verificationStatus.style.display = 'block';
    verificationStatus.className = 'verification-status verifying';
  }
  
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

// Edit Modal
async function showEditModal() {
  // Always reload config from server before showing edit modal
  // This ensures we have the latest owner address (important on Vercel/serverless)
  await loadStoreConfig();
  
  document.getElementById('edit-modal').style.display = 'flex';
  
  // Load current values
  if (storeConfig) {
    const profile = storeConfig.profile || {};
    document.getElementById('edit-name').value = profile.name || '';
    document.getElementById('edit-title').value = profile.title || '';
    document.getElementById('edit-tagline').value = profile.tagline || '';
    document.getElementById('edit-photo').value = profile.photoUrl || '';
    
    const product = storeConfig.product || {};
    document.getElementById('edit-product-title').value = product.title || '';
    document.getElementById('edit-product-desc').value = product.description || '';
    document.getElementById('edit-base-price').value = product.basePrice || 0;
    document.getElementById('edit-unit').value = product.unit || '';
    
    // Show onboarding helper section if owner exists
    const hasOwner = storeConfig.owner && 
                     storeConfig.owner !== '0x0000000000000000000000000000000000000000';
    if (hasOwner) {
      document.getElementById('onboarding-helper-section').style.display = 'block';
    }
  }
}

function hideEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
  document.getElementById('edit-auth').style.display = 'block';
  document.getElementById('edit-form').style.display = 'none';
  document.getElementById('edit-private-key').value = '';
}

document.getElementById('btn-close-edit')?.addEventListener('click', hideEditModal);
document.getElementById('btn-cancel-edit')?.addEventListener('click', hideEditModal);

// Verify ownership - this happens AFTER the $1 payment has set the owner on-chain
// We just need to prove the private key matches the owner address stored in config.json
document.getElementById('btn-verify-ownership')?.addEventListener('click', async () => {
  const privateKeyInput = document.getElementById('edit-private-key');
  const privateKey = privateKeyInput.value.trim();
  
  if (!privateKey || !privateKey.startsWith('0x') || privateKey.length !== 66) {
    alert('Invalid private key format. Must start with 0x and be 66 characters.');
    return;
  }

  if (!signMessageClientSide || !getAddressFromPrivateKey) {
    alert('Signing libraries not available. Please ensure client-signer.bundle.js is built.');
    return;
  }

  try {
    // Get address from private key to verify it matches owner
    const keyAddress = getAddressFromPrivateKey(privateKey);
    
    // Check if this address matches the owner (sanity check before signing)
    if (storeConfig?.owner && keyAddress.toLowerCase() !== storeConfig.owner.toLowerCase()) {
      alert(`This private key corresponds to address ${keyAddress}, but the owner is ${storeConfig.owner}. Please use the private key that matches the address that paid the $1 ownership fee.`);
      return;
    }
    
    // Sign challenge message - server will verify signature matches owner address from config.json
    // The owner address was set from the on-chain $1 payment transaction
    const challengeMessage = `Cash Register Ownership Verification\nOwner: ${storeConfig?.owner || 'unknown'}\nTimestamp: ${Date.now()}`;
    const signature = await signMessageClientSide(challengeMessage, privateKey);

    // Clear private key immediately after signing (discrete action - used once, discarded)
    privateKeyInput.value = '';

    // Verify with server - server checks signature matches owner address (from $1 payment)
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: challengeMessage,
        signature: signature,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      ownerSession = { token: data.sessionToken, expiresAt: data.expiresAt };
      
      // Hide auth, show edit form
      document.getElementById('edit-auth').style.display = 'none';
      document.getElementById('edit-form').style.display = 'block';
    } else {
      const error = await response.json();
      alert('Verification failed: ' + (error.error || 'Invalid signature. Make sure you\'re using the private key that matches the address that paid the $1 ownership fee.'));
    }
  } catch (error) {
    console.error('Ownership verification error:', error);
    privateKeyInput.value = ''; // Clear on error too
    alert('Verification failed: ' + error.message);
  }
});

// Save config
document.getElementById('btn-save-config')?.addEventListener('click', async () => {
  if (!ownerSession || Date.now() > ownerSession.expiresAt) {
    alert('Session expired. Please verify ownership again.');
    hideEditModal();
    return;
  }

  const updatedConfig = {
    ...storeConfig,
    profile: {
      name: document.getElementById('edit-name').value,
      title: document.getElementById('edit-title').value || undefined,
      subtitle: undefined, // Not editable in this version
      tagline: document.getElementById('edit-tagline').value || undefined,
      photoUrl: document.getElementById('edit-photo').value || undefined,
    },
    product: {
      ...storeConfig.product,
      title: document.getElementById('edit-product-title').value,
      description: document.getElementById('edit-product-desc').value,
      basePrice: parseFloat(document.getElementById('edit-base-price').value),
      unit: document.getElementById('edit-unit').value,
    },
  };

  try {
    const response = await fetch('/api/store-config/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken: ownerSession.token,
        config: updatedConfig,
      }),
    });

    if (response.ok) {
      await loadStoreConfig(); // Reload config
      hideEditModal();
      alert('Changes saved successfully!');
    } else {
      const error = await response.json();
      alert('Failed to save: ' + (error.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Save config error:', error);
    alert('Failed to save: ' + error.message);
  }
});

// ==================== ONBOARDING MODAL ====================

// Modal state - store wallet in memory (not localStorage)
let onboardingModalState = {
  wallet: null, // { address, privateKey }
  currentStep: 1
};

// Show onboarding modal
function showOnboardingModal() {
  const modal = document.getElementById('onboarding-modal');
  if (modal) {
    modal.style.display = 'flex';
    resetOnboardingModal();
  }
}

// Hide onboarding modal
function hideOnboardingModal() {
  const modal = document.getElementById('onboarding-modal');
  if (modal) {
    modal.style.display = 'none';
    resetOnboardingModal();
  }
}

// Reset modal to initial state
function resetOnboardingModal() {
  onboardingModalState = { wallet: null, currentStep: 1 };
  showOnboardingStep(1);
  document.getElementById('wallet-generation-result').style.display = 'none';
  document.getElementById('btn-generate-wallet').style.display = 'block';
  document.getElementById('onboarding-private-key-container').style.display = 'none';
  document.getElementById('onboarding-claim-loading').style.display = 'none';
}

// Show specific step
function showOnboardingStep(stepNumber) {
  onboardingModalState.currentStep = stepNumber;
  
  // Hide all steps
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById(`onboarding-step-${i}`);
    if (step) step.style.display = 'none';
  }
  
  // Show requested step
  const step = document.getElementById(`onboarding-step-${stepNumber}`);
  if (step) step.style.display = 'block';
}

// Generate QR code using canvas
async function generateQRCode(text, canvasId) {
  try {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Use QRCode from window (loaded from CDN in HTML head)
    if (typeof window !== 'undefined' && window.QRCode && window.QRCode.toCanvas) {
      await window.QRCode.toCanvas(canvas, text, { width: 200, margin: 2 });
    } else {
      // Fallback: Show text if QRCode library not available
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#000';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', 100, 95);
      ctx.fillText('Library loading...', 100, 110);
      
      // Wait a bit and try again
      setTimeout(() => {
        if (window.QRCode && window.QRCode.toCanvas) {
          window.QRCode.toCanvas(canvas, text, { width: 200, margin: 2 }).catch(err => 
            console.error('QR generation failed:', err)
          );
        }
      }, 500);
    }
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }
}

// Copy to clipboard helper
async function copyToClipboard(text, buttonElement) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = buttonElement.textContent;
    buttonElement.textContent = '✓ Copied!';
    setTimeout(() => {
      buttonElement.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
    alert('Failed to copy to clipboard. Please copy manually: ' + text);
  }
}

// Handle wallet generation (Step 1)
async function handleGenerateWallet() {
  if (!generateWalletClientSide) {
    alert('Wallet generation not available. Please ensure client-signer.bundle.js is loaded.');
    return;
  }
  
  try {
    const wallet = generateWalletClientSide();
    onboardingModalState.wallet = wallet;
    
    // Display wallet info
    document.getElementById('generated-address').value = wallet.address;
    document.getElementById('generated-private-key').value = wallet.privateKey;
    document.getElementById('wallet-generation-result').style.display = 'block';
    document.getElementById('btn-generate-wallet').style.display = 'none';
    
    // Generate QR code for address
    await generateQRCode(wallet.address, 'qr-code-canvas');
  } catch (error) {
    console.error('Wallet generation error:', error);
    alert('Failed to generate wallet: ' + error.message);
  }
}

// Handle step 2 setup (Get $1 USDC)
function setupStep2() {
  if (!onboardingModalState.wallet) {
    alert('Please generate a wallet first.');
    return;
  }
  
  const wallet = onboardingModalState.wallet;
  document.getElementById('funding-address').value = wallet.address;
  
  // Generate QR code for funding address
  generateQRCode(wallet.address, 'funding-qr-code-canvas');
  
  // Update share message template
  const shareMessage = `Hey! I need $1 USDC on Base network. Can you send it to ${wallet.address}?`;
  document.getElementById('share-message').value = shareMessage;
}

// Handle claim ownership from modal (Step 3)
async function handleClaimOwnershipFromModal() {
  if (!onboardingModalState.wallet) {
    alert('No wallet found. Please start from Step 1.');
    return;
  }
  
  const privateKey = onboardingModalState.wallet.privateKey;
  
  // Reuse existing claim ownership logic
  try {
    document.getElementById('onboarding-claim-loading').style.display = 'block';
    document.getElementById('btn-claim-ownership-modal').disabled = true;
    
    // Request payment challenge
    const challengeResponse = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1.0,
        currency: 'USD',
        metadata: { type: 'ownership_claim' }
      }),
    });
    
    if (!challengeResponse.ok) {
      throw new Error('Failed to get payment challenge');
    }
    
    const challengeData = await challengeResponse.json();
    
    if (!challengeData.challenge) {
      throw new Error('Invalid challenge response');
    }
    
    // Sign payment client-side
    if (!signPaymentClientSide) {
      throw new Error('Client-side signing not available');
    }
    
    const paymentPayload = await signPaymentClientSide(challengeData.challenge, privateKey);
    
    // Submit payment
    const paymentResponse = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: paymentPayload }),
    });
    
    const paymentData = await paymentResponse.json();
    
    if (paymentData.success || paymentData.ownerOptIn) {
      // Success! Show step 4
      showOnboardingStep(4);
    } else {
      throw new Error(paymentData.error || 'Payment failed');
    }
  } catch (error) {
    console.error('Claim ownership error:', error);
    alert('Failed to claim ownership: ' + error.message);
  } finally {
    document.getElementById('onboarding-claim-loading').style.display = 'none';
    document.getElementById('btn-claim-ownership-modal').disabled = false;
  }
}

// Event handlers for onboarding modal
document.getElementById('btn-get-storefront')?.addEventListener('click', (e) => {
  e.preventDefault();
  showOnboardingModal();
});

document.getElementById('btn-close-onboarding')?.addEventListener('click', () => {
  hideOnboardingModal();
});

document.getElementById('btn-close-onboarding-success')?.addEventListener('click', () => {
  hideOnboardingModal();
  // Reload page to show owner's storefront
  window.location.reload();
});

document.getElementById('btn-generate-wallet')?.addEventListener('click', handleGenerateWallet);

document.getElementById('btn-continue-step-2')?.addEventListener('click', () => {
  setupStep2();
  showOnboardingStep(2);
});

document.getElementById('btn-continue-step-3')?.addEventListener('click', () => {
  // Pre-fill private key when entering step 3
  if (onboardingModalState.wallet) {
    const privateKeyInput = document.getElementById('onboarding-private-key-input');
    if (privateKeyInput) {
      privateKeyInput.value = onboardingModalState.wallet.privateKey;
      document.getElementById('onboarding-private-key-container').style.display = 'block';
    }
  }
  showOnboardingStep(3);
});

document.getElementById('btn-claim-ownership-modal')?.addEventListener('click', handleClaimOwnershipFromModal);

// Copy buttons
document.getElementById('btn-copy-address')?.addEventListener('click', () => {
  const address = document.getElementById('generated-address').value;
  copyToClipboard(address, document.getElementById('btn-copy-address'));
});

document.getElementById('btn-copy-private-key')?.addEventListener('click', () => {
  const privateKey = document.getElementById('generated-private-key').value;
  copyToClipboard(privateKey, document.getElementById('btn-copy-private-key'));
});

document.getElementById('btn-copy-funding-address')?.addEventListener('click', () => {
  const address = document.getElementById('funding-address').value;
  copyToClipboard(address, document.getElementById('btn-copy-funding-address'));
});

document.getElementById('btn-copy-share-message')?.addEventListener('click', () => {
  const message = document.getElementById('share-message').value;
  copyToClipboard(message, document.getElementById('btn-copy-share-message'));
});

// Toggle private key visibility
document.getElementById('btn-toggle-key-visibility')?.addEventListener('click', () => {
  const input = document.getElementById('generated-private-key');
  const button = document.getElementById('btn-toggle-key-visibility');
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
  } else {
    input.type = 'password';
    button.textContent = '👁️';
  }
});

// Onboarding helper in edit modal
document.getElementById('btn-copy-instructions')?.addEventListener('click', () => {
  const instructions = document.getElementById('onboarding-instructions').value;
  copyToClipboard(instructions, document.getElementById('btn-copy-instructions'));
});


// Close modal when clicking outside
document.getElementById('onboarding-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'onboarding-modal') {
    hideOnboardingModal();
  }
});

// ==================== END ONBOARDING MODAL ====================

// Initialize
await loadStoreConfig();
setupEditButton();
