/**
 * Coinbase x402 Payment Provider
 * Real implementation using @x402/core and @x402/evm packages
 */

import { HTTPFacilitatorClient } from "@x402/core/server";
import { x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

// Cache resource server instance per configuration
let resourceServerCache = null;
let cacheConfig = null;
let initializationPromise = null;

/**
 * Get or create resource server instance (initialized)
 */
async function getResourceServer(facilitatorUrl, network) {
  // Check if cache is still valid for this config
  if (resourceServerCache && cacheConfig?.facilitatorUrl === facilitatorUrl && cacheConfig?.network === network) {
    return resourceServerCache;
  }

  // Reset initialization promise when config changes
  initializationPromise = null;
  
  const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
  resourceServerCache = new x402ResourceServer(facilitatorClient).register(
    network,
    new ExactEvmScheme()
  );
  
  cacheConfig = { facilitatorUrl, network };

  // Initialize to fetch supported kinds from facilitator
  initializationPromise = resourceServerCache.initialize();
  await initializationPromise;

  return resourceServerCache;
}

/**
 * Create payment requirements using Coinbase facilitator
 */
export async function createPaymentChallenge(amountInUSDC, label, config) {
  const {
    facilitatorUrl,
    driverWallet,
    network,
    baseUrl,
  } = config;

  if (!facilitatorUrl) {
    throw new Error("FACILITATOR_URL must be configured for Coinbase payments");
  }

  if (!driverWallet) {
    throw new Error("DRIVER_USDC_WALLET must be configured");
  }

  try {
    const resourceServer = await getResourceServer(facilitatorUrl, network);

    // Build ResourceConfig from USDC amount
    const priceStr = `$${amountInUSDC.toFixed(6)}`;

    const routeConfig = {
      scheme: "exact",
      price: priceStr,
      network: network,
      payTo: driverWallet,
    };

    // Build payment requirements
    const builtRequirements = await resourceServer.buildPaymentRequirements(routeConfig);
    
    if (builtRequirements.length === 0) {
      throw new Error("Failed to build payment requirements from facilitator");
    }

    const requirements = builtRequirements[0];

    const payUrl = config.resourceUrl || `${baseUrl}/api/pay`;
    // Create payment required response
    const paymentRequired = resourceServer.createPaymentRequiredResponse([requirements], {
      url: payUrl,
      description: label || "ride_payment",
      mimeType: "application/json",
    });

    // Ensure x402-axios compatibility: add error field if missing
    if (!paymentRequired.error) {
      paymentRequired.error = "Payment required";
    }
    
    // Ensure x402Version is set
    if (!paymentRequired.x402Version) {
      paymentRequired.x402Version = 2;
    }

    return paymentRequired;
  } catch (error) {
    console.error("Error creating payment challenge:", error);
    throw new Error(`Failed to create payment challenge: ${error.message}`);
  }
}

/**
 * Verify payment using Coinbase facilitator
 * 
 * @param {Object} paymentPayload - Payment payload from client
 * @param {Object} requirements - Payment requirements (from createPaymentChallenge)
 * @param {Object} config - Configuration with facilitatorUrl and network
 */
export async function verifyPayment(paymentPayload, requirements, config) {
  const facilitatorUrl = config?.facilitatorUrl;
  const network = config?.network || "eip155:84532";

  if (!facilitatorUrl) {
    throw new Error("Facilitator URL not available for verification");
  }

  try {
    const resourceServer = await getResourceServer(facilitatorUrl, network);
    const verifyResult = await resourceServer.verifyPayment(paymentPayload, requirements);

    return {
      isValid: verifyResult.isValid,
      invalidReason: verifyResult.invalidReason || null,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      isValid: false,
      invalidReason: error.message || "Payment verification failed",
    };
  }
}

/**
 * Settle payment using Coinbase facilitator
 * 
 * @param {Object} paymentPayload - Payment payload from client
 * @param {Object} requirements - Payment requirements (from createPaymentChallenge)
 * @param {Object} config - Configuration with facilitatorUrl and network
 */
export async function settlePayment(paymentPayload, requirements, config) {
  const facilitatorUrl = config?.facilitatorUrl;
  const network = config?.network || "eip155:84532";

  if (!facilitatorUrl) {
    throw new Error("Facilitator URL not available for settlement");
  }

  try {
    const resourceServer = await getResourceServer(facilitatorUrl, network);

    const settleResult = await resourceServer.settlePayment(paymentPayload, requirements);

    return {
      success: true,
      transaction: settleResult.transaction,
      network: network,
      payer: settleResult.payer || paymentPayload?.signer || null,
      requirements: requirements,
    };
  } catch (error) {
    console.error("Error settling payment:", error);
    throw new Error(`Payment settlement failed: ${error.message}`);
  }
}
