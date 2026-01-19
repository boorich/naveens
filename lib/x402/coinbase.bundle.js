// Bundled server-side x402 coinbase provider
// Includes @x402/core/server and @x402/evm/exact/server


// ../../../x402/typescript/packages/core/dist/esm/chunk-VE37GDG2.mjs
var x402Version = 2;

// ../../../x402/typescript/packages/core/dist/esm/chunk-X4W4S5RB.mjs
var VerifyError = class extends Error {
  /**
   * Creates a VerifyError from a failed verification response.
   *
   * @param statusCode - HTTP status code from the facilitator
   * @param response - The verify response containing error details
   */
  constructor(statusCode, response) {
    super(`verification failed: ${response.invalidReason || "unknown reason"}`);
    this.name = "VerifyError";
    this.statusCode = statusCode;
    this.invalidReason = response.invalidReason;
    this.payer = response.payer;
  }
};
var SettleError = class extends Error {
  /**
   * Creates a SettleError from a failed settlement response.
   *
   * @param statusCode - HTTP status code from the facilitator
   * @param response - The settle response containing error details
   */
  constructor(statusCode, response) {
    super(`settlement failed: ${response.errorReason || "unknown reason"}`);
    this.name = "SettleError";
    this.statusCode = statusCode;
    this.errorReason = response.errorReason;
    this.payer = response.payer;
    this.transaction = response.transaction;
    this.network = response.network;
  }
};

// ../../../x402/typescript/packages/core/dist/esm/chunk-TDLQZ6MP.mjs
var findSchemesByNetwork = (map, network) => {
  let implementationsByScheme = map.get(network);
  if (!implementationsByScheme) {
    for (const [registeredNetworkPattern, implementations] of map.entries()) {
      const pattern = registeredNetworkPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*");
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(network)) {
        implementationsByScheme = implementations;
        break;
      }
    }
  }
  return implementationsByScheme;
};
var findByNetworkAndScheme = (map, scheme, network) => {
  return findSchemesByNetwork(map, network)?.get(scheme);
};
function deepEqual(obj1, obj2) {
  const normalize = (obj) => {
    if (obj === null || obj === void 0) return JSON.stringify(obj);
    if (typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) {
      return JSON.stringify(
        obj.map(
          (item) => typeof item === "object" && item !== null ? JSON.parse(normalize(item)) : item
        )
      );
    }
    const sorted = {};
    Object.keys(obj).sort().forEach((key) => {
      const value = obj[key];
      sorted[key] = typeof value === "object" && value !== null ? JSON.parse(normalize(value)) : value;
    });
    return JSON.stringify(sorted);
  };
  try {
    return normalize(obj1) === normalize(obj2);
  } catch {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}

// ../../../x402/typescript/packages/core/dist/esm/chunk-6MJ7ECNN.mjs
var DEFAULT_FACILITATOR_URL = "https://x402.org/facilitator";
var HTTPFacilitatorClient = class {
  /**
   * Creates a new HTTPFacilitatorClient instance.
   *
   * @param config - Configuration options for the facilitator client
   */
  constructor(config) {
    this.url = config?.url || DEFAULT_FACILITATOR_URL;
    this._createAuthHeaders = config?.createAuthHeaders;
  }
  /**
   * Verify a payment with the facilitator
   *
   * @param paymentPayload - The payment to verify
   * @param paymentRequirements - The requirements to verify against
   * @returns Verification response
   */
  async verify(paymentPayload, paymentRequirements) {
    let headers = {
      "Content-Type": "application/json"
    };
    if (this._createAuthHeaders) {
      const authHeaders = await this.createAuthHeaders("verify");
      headers = { ...headers, ...authHeaders.headers };
    }
    const response = await fetch(`${this.url}/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        x402Version: paymentPayload.x402Version,
        paymentPayload: this.toJsonSafe(paymentPayload),
        paymentRequirements: this.toJsonSafe(paymentRequirements)
      })
    });
    const data = await response.json();
    if (typeof data === "object" && data !== null && "isValid" in data) {
      const verifyResponse = data;
      if (!response.ok) {
        throw new VerifyError(response.status, verifyResponse);
      }
      return verifyResponse;
    }
    throw new Error(`Facilitator verify failed (${response.status}): ${JSON.stringify(data)}`);
  }
  /**
   * Settle a payment with the facilitator
   *
   * @param paymentPayload - The payment to settle
   * @param paymentRequirements - The requirements for settlement
   * @returns Settlement response
   */
  async settle(paymentPayload, paymentRequirements) {
    let headers = {
      "Content-Type": "application/json"
    };
    if (this._createAuthHeaders) {
      const authHeaders = await this.createAuthHeaders("settle");
      headers = { ...headers, ...authHeaders.headers };
    }
    const response = await fetch(`${this.url}/settle`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        x402Version: paymentPayload.x402Version,
        paymentPayload: this.toJsonSafe(paymentPayload),
        paymentRequirements: this.toJsonSafe(paymentRequirements)
      })
    });
    const data = await response.json();
    if (typeof data === "object" && data !== null && "success" in data) {
      const settleResponse = data;
      if (!response.ok) {
        throw new SettleError(response.status, settleResponse);
      }
      return settleResponse;
    }
    throw new Error(`Facilitator settle failed (${response.status}): ${JSON.stringify(data)}`);
  }
  /**
   * Get supported payment kinds and extensions from the facilitator
   *
   * @returns Supported payment kinds and extensions
   */
  async getSupported() {
    let headers = {
      "Content-Type": "application/json"
    };
    if (this._createAuthHeaders) {
      const authHeaders = await this.createAuthHeaders("supported");
      headers = { ...headers, ...authHeaders.headers };
    }
    const response = await fetch(`${this.url}/supported`, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Facilitator getSupported failed (${response.status}): ${errorText}`);
    }
    return await response.json();
  }
  /**
   * Creates authentication headers for a specific path.
   *
   * @param path - The path to create authentication headers for (e.g., "verify", "settle", "supported")
   * @returns An object containing the authentication headers for the specified path
   */
  async createAuthHeaders(path) {
    if (this._createAuthHeaders) {
      const authHeaders = await this._createAuthHeaders();
      return {
        headers: authHeaders[path] ?? {}
      };
    }
    return {
      headers: {}
    };
  }
  /**
   * Helper to convert objects to JSON-safe format.
   * Handles BigInt and other non-JSON types.
   *
   * @param obj - The object to convert
   * @returns The JSON-safe representation of the object
   */
  toJsonSafe(obj) {
    return JSON.parse(
      JSON.stringify(obj, (_, value) => typeof value === "bigint" ? value.toString() : value)
    );
  }
};

// ../../../x402/typescript/packages/core/dist/esm/server/index.mjs
var x402ResourceServer = class {
  /**
   * Creates a new x402ResourceServer instance.
   *
   * @param facilitatorClients - Optional facilitator client(s) for payment processing
   */
  constructor(facilitatorClients) {
    this.registeredServerSchemes = /* @__PURE__ */ new Map();
    this.supportedResponsesMap = /* @__PURE__ */ new Map();
    this.facilitatorClientsMap = /* @__PURE__ */ new Map();
    this.registeredExtensions = /* @__PURE__ */ new Map();
    this.beforeVerifyHooks = [];
    this.afterVerifyHooks = [];
    this.onVerifyFailureHooks = [];
    this.beforeSettleHooks = [];
    this.afterSettleHooks = [];
    this.onSettleFailureHooks = [];
    if (!facilitatorClients) {
      this.facilitatorClients = [new HTTPFacilitatorClient()];
    } else if (Array.isArray(facilitatorClients)) {
      this.facilitatorClients = facilitatorClients.length > 0 ? facilitatorClients : [new HTTPFacilitatorClient()];
    } else {
      this.facilitatorClients = [facilitatorClients];
    }
  }
  /**
   * Register a scheme/network server implementation.
   *
   * @param network - The network identifier
   * @param server - The scheme/network server implementation
   * @returns The x402ResourceServer instance for chaining
   */
  register(network, server) {
    if (!this.registeredServerSchemes.has(network)) {
      this.registeredServerSchemes.set(network, /* @__PURE__ */ new Map());
    }
    const serverByScheme = this.registeredServerSchemes.get(network);
    if (!serverByScheme.has(server.scheme)) {
      serverByScheme.set(server.scheme, server);
    }
    return this;
  }
  /**
   * Check if a scheme is registered for a given network.
   *
   * @param network - The network identifier
   * @param scheme - The payment scheme name
   * @returns True if the scheme is registered for the network, false otherwise
   */
  hasRegisteredScheme(network, scheme) {
    return !!findByNetworkAndScheme(this.registeredServerSchemes, scheme, network);
  }
  /**
   * Registers a resource service extension that can enrich extension declarations.
   *
   * @param extension - The extension to register
   * @returns The x402ResourceServer instance for chaining
   */
  registerExtension(extension) {
    this.registeredExtensions.set(extension.key, extension);
    return this;
  }
  /**
   * Enriches declared extensions using registered extension hooks.
   *
   * @param declaredExtensions - Extensions declared on the route
   * @param transportContext - Transport-specific context (HTTP, A2A, MCP, etc.)
   * @returns Enriched extensions map
   */
  enrichExtensions(declaredExtensions, transportContext) {
    const enriched = {};
    for (const [key, declaration] of Object.entries(declaredExtensions)) {
      const extension = this.registeredExtensions.get(key);
      if (extension?.enrichDeclaration) {
        enriched[key] = extension.enrichDeclaration(declaration, transportContext);
      } else {
        enriched[key] = declaration;
      }
    }
    return enriched;
  }
  /**
   * Register a hook to execute before payment verification.
   * Can abort verification by returning { abort: true, reason: string }
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */
  onBeforeVerify(hook) {
    this.beforeVerifyHooks.push(hook);
    return this;
  }
  /**
   * Register a hook to execute after successful payment verification.
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */
  onAfterVerify(hook) {
    this.afterVerifyHooks.push(hook);
    return this;
  }
  /**
   * Register a hook to execute when payment verification fails.
   * Can recover from failure by returning { recovered: true, result: VerifyResponse }
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */
  onVerifyFailure(hook) {
    this.onVerifyFailureHooks.push(hook);
    return this;
  }
  /**
   * Register a hook to execute before payment settlement.
   * Can abort settlement by returning { abort: true, reason: string }
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */
  onBeforeSettle(hook) {
    this.beforeSettleHooks.push(hook);
    return this;
  }
  /**
   * Register a hook to execute after successful payment settlement.
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */
  onAfterSettle(hook) {
    this.afterSettleHooks.push(hook);
    return this;
  }
  /**
   * Register a hook to execute when payment settlement fails.
   * Can recover from failure by returning { recovered: true, result: SettleResponse }
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */
  onSettleFailure(hook) {
    this.onSettleFailureHooks.push(hook);
    return this;
  }
  /**
   * Initialize by fetching supported kinds from all facilitators
   * Creates mappings for supported responses and facilitator clients
   * Earlier facilitators in the array get precedence
   */
  async initialize() {
    this.supportedResponsesMap.clear();
    this.facilitatorClientsMap.clear();
    for (const facilitatorClient of this.facilitatorClients) {
      try {
        const supported = await facilitatorClient.getSupported();
        for (const kind of supported.kinds) {
          const x402Version2 = kind.x402Version;
          if (!this.supportedResponsesMap.has(x402Version2)) {
            this.supportedResponsesMap.set(x402Version2, /* @__PURE__ */ new Map());
          }
          const responseVersionMap = this.supportedResponsesMap.get(x402Version2);
          if (!this.facilitatorClientsMap.has(x402Version2)) {
            this.facilitatorClientsMap.set(x402Version2, /* @__PURE__ */ new Map());
          }
          const clientVersionMap = this.facilitatorClientsMap.get(x402Version2);
          if (!responseVersionMap.has(kind.network)) {
            responseVersionMap.set(kind.network, /* @__PURE__ */ new Map());
          }
          const responseNetworkMap = responseVersionMap.get(kind.network);
          if (!clientVersionMap.has(kind.network)) {
            clientVersionMap.set(kind.network, /* @__PURE__ */ new Map());
          }
          const clientNetworkMap = clientVersionMap.get(kind.network);
          if (!responseNetworkMap.has(kind.scheme)) {
            responseNetworkMap.set(kind.scheme, supported);
            clientNetworkMap.set(kind.scheme, facilitatorClient);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch supported kinds from facilitator: ${error}`);
      }
    }
  }
  /**
   * Get supported kind for a specific version, network, and scheme
   *
   * @param x402Version - The x402 version
   * @param network - The network identifier
   * @param scheme - The payment scheme
   * @returns The supported kind or undefined if not found
   */
  getSupportedKind(x402Version2, network, scheme) {
    const versionMap = this.supportedResponsesMap.get(x402Version2);
    if (!versionMap) return void 0;
    const supportedResponse = findByNetworkAndScheme(versionMap, scheme, network);
    if (!supportedResponse) return void 0;
    return supportedResponse.kinds.find(
      (kind) => kind.x402Version === x402Version2 && kind.network === network && kind.scheme === scheme
    );
  }
  /**
   * Get facilitator extensions for a specific version, network, and scheme
   *
   * @param x402Version - The x402 version
   * @param network - The network identifier
   * @param scheme - The payment scheme
   * @returns The facilitator extensions or empty array if not found
   */
  getFacilitatorExtensions(x402Version2, network, scheme) {
    const versionMap = this.supportedResponsesMap.get(x402Version2);
    if (!versionMap) return [];
    const supportedResponse = findByNetworkAndScheme(versionMap, scheme, network);
    return supportedResponse?.extensions || [];
  }
  /**
   * Build payment requirements for a protected resource
   *
   * @param resourceConfig - Configuration for the protected resource
   * @returns Array of payment requirements
   */
  async buildPaymentRequirements(resourceConfig) {
    const requirements = [];
    const scheme = resourceConfig.scheme;
    const SchemeNetworkServer = findByNetworkAndScheme(
      this.registeredServerSchemes,
      scheme,
      resourceConfig.network
    );
    if (!SchemeNetworkServer) {
      console.warn(
        `No server implementation registered for scheme: ${scheme}, network: ${resourceConfig.network}`
      );
      return requirements;
    }
    const supportedKind = this.getSupportedKind(
      x402Version,
      resourceConfig.network,
      SchemeNetworkServer.scheme
    );
    if (!supportedKind) {
      throw new Error(
        `Facilitator does not support ${SchemeNetworkServer.scheme} on ${resourceConfig.network}. Make sure to call initialize() to fetch supported kinds from facilitators.`
      );
    }
    const facilitatorExtensions = this.getFacilitatorExtensions(
      x402Version,
      resourceConfig.network,
      SchemeNetworkServer.scheme
    );
    const parsedPrice = await SchemeNetworkServer.parsePrice(
      resourceConfig.price,
      resourceConfig.network
    );
    const baseRequirements = {
      scheme: SchemeNetworkServer.scheme,
      network: resourceConfig.network,
      amount: parsedPrice.amount,
      asset: parsedPrice.asset,
      payTo: resourceConfig.payTo,
      maxTimeoutSeconds: resourceConfig.maxTimeoutSeconds || 300,
      // Default 5 minutes
      extra: {
        ...parsedPrice.extra
      }
    };
    const requirement = await SchemeNetworkServer.enhancePaymentRequirements(
      baseRequirements,
      {
        ...supportedKind,
        x402Version
      },
      facilitatorExtensions
    );
    requirements.push(requirement);
    return requirements;
  }
  /**
   * Build payment requirements from multiple payment options
   * This method handles resolving dynamic payTo/price functions and builds requirements for each option
   *
   * @param paymentOptions - Array of payment options to convert
   * @param context - HTTP request context for resolving dynamic functions
   * @returns Array of payment requirements (one per option)
   */
  async buildPaymentRequirementsFromOptions(paymentOptions, context) {
    const allRequirements = [];
    for (const option of paymentOptions) {
      const resolvedPayTo = typeof option.payTo === "function" ? await option.payTo(context) : option.payTo;
      const resolvedPrice = typeof option.price === "function" ? await option.price(context) : option.price;
      const resourceConfig = {
        scheme: option.scheme,
        payTo: resolvedPayTo,
        price: resolvedPrice,
        network: option.network,
        maxTimeoutSeconds: option.maxTimeoutSeconds
      };
      const requirements = await this.buildPaymentRequirements(resourceConfig);
      allRequirements.push(...requirements);
    }
    return allRequirements;
  }
  /**
   * Create a payment required response
   *
   * @param requirements - Payment requirements
   * @param resourceInfo - Resource information
   * @param error - Error message
   * @param extensions - Optional extensions
   * @returns Payment required response object
   */
  createPaymentRequiredResponse(requirements, resourceInfo, error, extensions) {
    const response = {
      x402Version: 2,
      error,
      resource: resourceInfo,
      accepts: requirements
    };
    if (extensions && Object.keys(extensions).length > 0) {
      response.extensions = extensions;
    }
    return response;
  }
  /**
   * Verify a payment against requirements
   *
   * @param paymentPayload - The payment payload to verify
   * @param requirements - The payment requirements
   * @returns Verification response
   */
  async verifyPayment(paymentPayload, requirements) {
    const context = {
      paymentPayload,
      requirements
    };
    for (const hook of this.beforeVerifyHooks) {
      const result = await hook(context);
      if (result && "abort" in result && result.abort) {
        return {
          isValid: false,
          invalidReason: result.reason
        };
      }
    }
    try {
      const facilitatorClient = this.getFacilitatorClient(
        paymentPayload.x402Version,
        requirements.network,
        requirements.scheme
      );
      let verifyResult;
      if (!facilitatorClient) {
        let lastError;
        for (const client of this.facilitatorClients) {
          try {
            verifyResult = await client.verify(paymentPayload, requirements);
            break;
          } catch (error) {
            lastError = error;
          }
        }
        if (!verifyResult) {
          throw lastError || new Error(
            `No facilitator supports ${requirements.scheme} on ${requirements.network} for v${paymentPayload.x402Version}`
          );
        }
      } else {
        verifyResult = await facilitatorClient.verify(paymentPayload, requirements);
      }
      const resultContext = {
        ...context,
        result: verifyResult
      };
      for (const hook of this.afterVerifyHooks) {
        await hook(resultContext);
      }
      return verifyResult;
    } catch (error) {
      const failureContext = {
        ...context,
        error
      };
      for (const hook of this.onVerifyFailureHooks) {
        const result = await hook(failureContext);
        if (result && "recovered" in result && result.recovered) {
          return result.result;
        }
      }
      throw error;
    }
  }
  /**
   * Settle a verified payment
   *
   * @param paymentPayload - The payment payload to settle
   * @param requirements - The payment requirements
   * @returns Settlement response
   */
  async settlePayment(paymentPayload, requirements) {
    const context = {
      paymentPayload,
      requirements
    };
    for (const hook of this.beforeSettleHooks) {
      const result = await hook(context);
      if (result && "abort" in result && result.abort) {
        throw new Error(`Settlement aborted: ${result.reason}`);
      }
    }
    try {
      const facilitatorClient = this.getFacilitatorClient(
        paymentPayload.x402Version,
        requirements.network,
        requirements.scheme
      );
      let settleResult;
      if (!facilitatorClient) {
        let lastError;
        for (const client of this.facilitatorClients) {
          try {
            settleResult = await client.settle(paymentPayload, requirements);
            break;
          } catch (error) {
            lastError = error;
          }
        }
        if (!settleResult) {
          throw lastError || new Error(
            `No facilitator supports ${requirements.scheme} on ${requirements.network} for v${paymentPayload.x402Version}`
          );
        }
      } else {
        settleResult = await facilitatorClient.settle(paymentPayload, requirements);
      }
      const resultContext = {
        ...context,
        result: settleResult
      };
      for (const hook of this.afterSettleHooks) {
        await hook(resultContext);
      }
      return settleResult;
    } catch (error) {
      const failureContext = {
        ...context,
        error
      };
      for (const hook of this.onSettleFailureHooks) {
        const result = await hook(failureContext);
        if (result && "recovered" in result && result.recovered) {
          return result.result;
        }
      }
      throw error;
    }
  }
  /**
   * Find matching payment requirements for a payment
   *
   * @param availableRequirements - Array of available payment requirements
   * @param paymentPayload - The payment payload
   * @returns Matching payment requirements or undefined
   */
  findMatchingRequirements(availableRequirements, paymentPayload) {
    switch (paymentPayload.x402Version) {
      case 2:
        return availableRequirements.find(
          (paymentRequirements) => deepEqual(paymentRequirements, paymentPayload.accepted)
        );
      case 1:
        return availableRequirements.find(
          (req) => req.scheme === paymentPayload.accepted.scheme && req.network === paymentPayload.accepted.network
        );
      default:
        throw new Error(
          `Unsupported x402 version: ${paymentPayload.x402Version}`
        );
    }
  }
  /**
   * Process a payment request
   *
   * @param paymentPayload - Optional payment payload if provided
   * @param resourceConfig - Configuration for the protected resource
   * @param resourceInfo - Information about the resource being accessed
   * @param extensions - Optional extensions to include in the response
   * @returns Processing result
   */
  async processPaymentRequest(paymentPayload, resourceConfig, resourceInfo, extensions) {
    const requirements = await this.buildPaymentRequirements(resourceConfig);
    if (!paymentPayload) {
      return {
        success: false,
        requiresPayment: this.createPaymentRequiredResponse(
          requirements,
          resourceInfo,
          "Payment required",
          extensions
        )
      };
    }
    const matchingRequirements = this.findMatchingRequirements(requirements, paymentPayload);
    if (!matchingRequirements) {
      return {
        success: false,
        requiresPayment: this.createPaymentRequiredResponse(
          requirements,
          resourceInfo,
          "No matching payment requirements found",
          extensions
        )
      };
    }
    const verificationResult = await this.verifyPayment(paymentPayload, matchingRequirements);
    if (!verificationResult.isValid) {
      return {
        success: false,
        error: verificationResult.invalidReason,
        verificationResult
      };
    }
    return {
      success: true,
      verificationResult
    };
  }
  /**
   * Get facilitator client for a specific version, network, and scheme
   *
   * @param x402Version - The x402 version
   * @param network - The network identifier
   * @param scheme - The payment scheme
   * @returns The facilitator client or undefined if not found
   */
  getFacilitatorClient(x402Version2, network, scheme) {
    const versionMap = this.facilitatorClientsMap.get(x402Version2);
    if (!versionMap) return void 0;
    return findByNetworkAndScheme(versionMap, scheme, network);
  }
};

// ../../../x402/typescript/packages/mechanisms/evm/dist/esm/exact/server/index.mjs
var ExactEvmScheme = class {
  constructor() {
    this.scheme = "exact";
    this.moneyParsers = [];
  }
  /**
   * Register a custom money parser in the parser chain.
   * Multiple parsers can be registered - they will be tried in registration order.
   * Each parser receives a decimal amount (e.g., 1.50 for $1.50).
   * If a parser returns null, the next parser in the chain will be tried.
   * The default parser is always the final fallback.
   *
   * @param parser - Custom function to convert amount to AssetAmount (or null to skip)
   * @returns The server instance for chaining
   *
   * @example
   * evmServer.registerMoneyParser(async (amount, network) => {
   *   // Custom conversion logic
   *   if (amount > 100) {
   *     // Use different token for large amounts
   *     return { amount: (amount * 1e18).toString(), asset: "0xCustomToken" };
   *   }
   *   return null; // Use next parser
   * });
   */
  registerMoneyParser(parser) {
    this.moneyParsers.push(parser);
    return this;
  }
  /**
   * Parses a price into an asset amount.
   * If price is already an AssetAmount, returns it directly.
   * If price is Money (string | number), parses to decimal and tries custom parsers.
   * Falls back to default conversion if all custom parsers return null.
   *
   * @param price - The price to parse
   * @param network - The network to use
   * @returns Promise that resolves to the parsed asset amount
   */
  async parsePrice(price, network) {
    if (typeof price === "object" && price !== null && "amount" in price) {
      if (!price.asset) {
        throw new Error(`Asset address must be specified for AssetAmount on network ${network}`);
      }
      return {
        amount: price.amount,
        asset: price.asset,
        extra: price.extra || {}
      };
    }
    const amount = this.parseMoneyToDecimal(price);
    for (const parser of this.moneyParsers) {
      const result = await parser(amount, network);
      if (result !== null) {
        return result;
      }
    }
    return this.defaultMoneyConversion(amount, network);
  }
  /**
   * Build payment requirements for this scheme/network combination
   *
   * @param paymentRequirements - The base payment requirements
   * @param supportedKind - The supported kind from facilitator (unused)
   * @param supportedKind.x402Version - The x402 version
   * @param supportedKind.scheme - The logical payment scheme
   * @param supportedKind.network - The network identifier in CAIP-2 format
   * @param supportedKind.extra - Optional extra metadata regarding scheme/network implementation details
   * @param extensionKeys - Extension keys supported by the facilitator (unused)
   * @returns Payment requirements ready to be sent to clients
   */
  enhancePaymentRequirements(paymentRequirements, supportedKind, extensionKeys) {
    void supportedKind;
    void extensionKeys;
    return Promise.resolve(paymentRequirements);
  }
  /**
   * Parse Money (string | number) to a decimal number.
   * Handles formats like "$1.50", "1.50", 1.50, etc.
   *
   * @param money - The money value to parse
   * @returns Decimal number
   */
  parseMoneyToDecimal(money) {
    if (typeof money === "number") {
      return money;
    }
    const cleanMoney = money.replace(/^\$/, "").trim();
    const amount = parseFloat(cleanMoney);
    if (isNaN(amount)) {
      throw new Error(`Invalid money format: ${money}`);
    }
    return amount;
  }
  /**
   * Default money conversion implementation.
   * Converts decimal amount to the default stablecoin on the specified network.
   *
   * @param amount - The decimal amount (e.g., 1.50)
   * @param network - The network to use
   * @returns The parsed asset amount in the default stablecoin
   */
  defaultMoneyConversion(amount, network) {
    const assetInfo = this.getDefaultAsset(network);
    const tokenAmount = this.convertToTokenAmount(amount.toString(), assetInfo.decimals);
    return {
      amount: tokenAmount,
      asset: assetInfo.address,
      extra: {
        name: assetInfo.name,
        version: assetInfo.version
      }
    };
  }
  /**
   * Convert decimal amount to token units (e.g., 0.10 -> 100000 for 6-decimal tokens)
   *
   * @param decimalAmount - The decimal amount to convert
   * @param decimals - The number of decimals for the token
   * @returns The token amount as a string
   */
  convertToTokenAmount(decimalAmount, decimals) {
    const amount = parseFloat(decimalAmount);
    if (isNaN(amount)) {
      throw new Error(`Invalid amount: ${decimalAmount}`);
    }
    const [intPart, decPart = ""] = String(amount).split(".");
    const paddedDec = decPart.padEnd(decimals, "0").slice(0, decimals);
    const tokenAmount = (intPart + paddedDec).replace(/^0+/, "") || "0";
    return tokenAmount;
  }
  /**
   * Get the default asset info for a network (typically USDC)
   *
   * @param network - The network to get asset info for
   * @returns The asset information including address, name, version, and decimals
   */
  getDefaultAsset(network) {
    const stablecoins = {
      "eip155:8453": {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        name: "USD Coin",
        version: "2",
        decimals: 6
      },
      // Base mainnet USDC
      "eip155:84532": {
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        name: "USDC",
        version: "2",
        decimals: 6
      }
      // Base Sepolia USDC
    };
    const assetInfo = stablecoins[network];
    if (!assetInfo) {
      throw new Error(`No default asset configured for network ${network}`);
    }
    return assetInfo;
  }
};

// lib/x402/coinbase.js
var resourceServerCache = null;
var cacheConfig = null;
var initializationPromise = null;
async function getResourceServer(facilitatorUrl, network) {
  if (resourceServerCache && cacheConfig?.facilitatorUrl === facilitatorUrl && cacheConfig?.network === network) {
    return resourceServerCache;
  }
  initializationPromise = null;
  const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
  resourceServerCache = new x402ResourceServer(facilitatorClient).register(
    network,
    new ExactEvmScheme()
  );
  cacheConfig = { facilitatorUrl, network };
  initializationPromise = resourceServerCache.initialize();
  await initializationPromise;
  return resourceServerCache;
}
async function createPaymentChallenge(amountInUSDC, label, config) {
  const {
    facilitatorUrl,
    driverWallet,
    network,
    baseUrl
  } = config;
  if (!facilitatorUrl) {
    throw new Error("FACILITATOR_URL must be configured for Coinbase payments");
  }
  if (!driverWallet) {
    throw new Error("DRIVER_USDC_WALLET must be configured");
  }
  try {
    const resourceServer = await getResourceServer(facilitatorUrl, network);
    const priceStr = `$${amountInUSDC.toFixed(6)}`;
    const routeConfig = {
      scheme: "exact",
      price: priceStr,
      network,
      payTo: driverWallet
    };
    const builtRequirements = await resourceServer.buildPaymentRequirements(routeConfig);
    if (builtRequirements.length === 0) {
      throw new Error("Failed to build payment requirements from facilitator");
    }
    const requirements = builtRequirements[0];
    const paymentRequired = resourceServer.createPaymentRequiredResponse([requirements], {
      url: `${baseUrl}/api/pay`,
      description: label || "ride_payment",
      mimeType: "application/json"
    });
    if (!paymentRequired.error) {
      paymentRequired.error = "Payment required";
    }
    if (!paymentRequired.x402Version) {
      paymentRequired.x402Version = 2;
    }
    return paymentRequired;
  } catch (error) {
    console.error("Error creating payment challenge:", error);
    throw new Error(`Failed to create payment challenge: ${error.message}`);
  }
}
async function verifyPayment(paymentPayload, requirements, config) {
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
      invalidReason: verifyResult.invalidReason || null
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      isValid: false,
      invalidReason: error.message || "Payment verification failed"
    };
  }
}
async function settlePayment(paymentPayload, requirements, config) {
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
      network,
      payer: settleResult.payer || paymentPayload?.signer || null,
      requirements
    };
  } catch (error) {
    console.error("Error settling payment:", error);
    throw new Error(`Payment settlement failed: ${error.message}`);
  }
}
export {
  createPaymentChallenge,
  settlePayment,
  verifyPayment
};
