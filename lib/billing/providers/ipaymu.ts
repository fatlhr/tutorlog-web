import "server-only";

import { BillingError } from "@/lib/billing/errors";
import {
  createIpaymuRequestHeaders,
  formatIpaymuTimestamp,
  verifyIpaymuCallback,
} from "./ipaymu-signature";
import type {
  CreateProviderPaymentInput,
  PaymentProvider,
  ProviderPaymentResult,
  VerifiedProviderEvent,
} from "./provider";

interface IpaymuProviderConfig {
  baseUrl: string;
  va: string;
  apiKey: string;
  callbackUrl: string;
  returnUrl: string;
}

const REQUIRED_CONFIG = {
  baseUrl: "IPAYMU_BASE_URL",
  va: "IPAYMU_VA",
  apiKey: "IPAYMU_API_KEY",
  callbackUrl: "IPAYMU_CALLBACK_URL",
  returnUrl: "IPAYMU_RETURN_URL",
} as const;

function providerNotReady(): BillingError {
  return new BillingError(
    "PAYMENT_PROVIDER_NOT_READY",
    "Payment provider is not ready",
  );
}

function providerUnavailable(): BillingError {
  return new BillingError("PROVIDER_UNAVAILABLE", "Payment provider is unavailable");
}

function providerResponseInvalid(): BillingError {
  return new BillingError("PROVIDER_RESPONSE_INVALID", "Payment provider response is invalid");
}

function readEnabledConfig(): IpaymuProviderConfig {
  if (!(process.env.BILLING_PAYMENT_PROVIDER_ENABLED === "true")) {
    throw providerNotReady();
  }

  const config = Object.fromEntries(
    Object.entries(REQUIRED_CONFIG).map(([key, envName]) => [key, process.env[envName]?.trim()]),
  ) as Record<keyof IpaymuProviderConfig, string | undefined>;
  if (Object.values(config).some((value) => !value)) throw providerNotReady();

  try {
    for (const key of ["baseUrl", "callbackUrl", "returnUrl"] as const) {
      const url = new URL(config[key] as string);
      if (url.protocol !== "https:") throw providerNotReady();
    }
  } catch {
    throw providerNotReady();
  }

  return {
    baseUrl: (config.baseUrl as string).replace(/\/$/, ""),
    va: config.va as string,
    apiKey: config.apiKey as string,
    callbackUrl: config.callbackUrl as string,
    returnUrl: config.returnUrl as string,
  };
}

function assertNetworkReady(expected: IpaymuProviderConfig): void {
  const current = readEnabledConfig();
  for (const key of Object.keys(expected) as (keyof IpaymuProviderConfig)[]) {
    if (current[key] !== expected[key]) throw providerNotReady();
  }
}

class IpaymuProvider implements PaymentProvider {
  constructor(private readonly config: IpaymuProviderConfig) {}

  async createPayment(input: CreateProviderPaymentInput): Promise<ProviderPaymentResult> {
    assertNetworkReady(this.config);
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
      throw providerResponseInvalid();
    }
    if (input.callbackUrl !== this.config.callbackUrl || input.returnUrl !== this.config.returnUrl) {
      throw providerNotReady();
    }

    const requestPayload: Record<string, unknown> = {
      product: ["TutorLog Plus"],
      qty: [1],
      price: [input.amount],
      returnUrl: this.config.returnUrl,
      notifyUrl: this.config.callbackUrl,
      referenceId: input.purchaseId,
      buyerName: input.customer.name,
      buyerEmail: input.customer.email,
    };
    // cancelUrl is intentionally omitted; Task I9 must provide the absent contract and merchant evidence.
    if (input.customer.phone) requestPayload.buyerPhone = input.customer.phone;

    const rawBody = JSON.stringify(requestPayload);
    const signedHeaders = createIpaymuRequestHeaders({
      method: "POST",
      va: this.config.va,
      apiKey: this.config.apiKey,
      timestamp: formatIpaymuTimestamp(new Date()),
      rawBody,
    });

    try {
      const response = await fetch(`${this.config.baseUrl}/api/v2/payment`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...signedHeaders,
        },
        body: rawBody,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) throw providerUnavailable();
      const payload: unknown = await response.json();
      if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
        throw providerResponseInvalid();
      }

      // Redirect response fields remain merchant-dependent until Task I9 fixtures exist.
      throw providerNotReady();
    } catch (error) {
      if (error instanceof BillingError) throw error;
      throw providerUnavailable();
    }
  }

  async getPaymentStatus(_reference: string): Promise<VerifiedProviderEvent> {
    throw providerNotReady();
  }

  async cancelPayment(_reference: string): Promise<{ accepted: boolean }> {
    throw providerNotReady();
  }

  verifyCallback(input: { rawBody: string; headers: Headers }): VerifiedProviderEvent {
    return verifyIpaymuCallback({ ...input, va: this.config.va });
  }
}

export function createPaymentProvider(): PaymentProvider {
  return new IpaymuProvider(readEnabledConfig());
}
