import "server-only";

import { BillingError } from "@/lib/billing/errors";
import {
  createDuitkuInquirySignature,
  createDuitkuStatusSignature,
  verifyDuitkuCallback,
} from "./duitku-signature";
import type {
  CreateProviderPaymentInput,
  PaymentProvider,
  ProviderPaymentResult,
  VerifiedProviderEvent,
} from "./provider";

interface DuitkuProviderConfig {
  merchantCode: string;
  apiKey: string;
  baseUrl: string;
  callbackUrl: string;
  returnUrl: string;
}

const REQUIRED_CONFIG = {
  merchantCode: "DUITKU_MERCHANT_CODE",
  apiKey: "DUITKU_API_KEY",
  baseUrl: "DUITKU_BASE_URL",
  callbackUrl: "DUITKU_CALLBACK_URL",
  returnUrl: "DUITKU_RETURN_URL",
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

function readEnabledConfig(): DuitkuProviderConfig {
  if (!(process.env.BILLING_PAYMENT_PROVIDER_ENABLED === "true")) {
    throw providerNotReady();
  }

  const config = Object.fromEntries(
    Object.entries(REQUIRED_CONFIG).map(([key, envName]) => [key, process.env[envName]?.trim()]),
  ) as Record<keyof DuitkuProviderConfig, string | undefined>;
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
    merchantCode: config.merchantCode as string,
    apiKey: config.apiKey as string,
    baseUrl: (config.baseUrl as string).replace(/\/$/, ""),
    callbackUrl: config.callbackUrl as string,
    returnUrl: config.returnUrl as string,
  };
}

function assertNetworkReady(expected: DuitkuProviderConfig): void {
  const current = readEnabledConfig();
  for (const key of Object.keys(expected) as (keyof DuitkuProviderConfig)[]) {
    if (current[key] !== expected[key]) throw providerNotReady();
  }
}

const METHOD_MAP: Record<string, string> = {
  qris: "SP",
  va: "BC",
};

class DuitkuProvider implements PaymentProvider {
  constructor(private readonly config: DuitkuProviderConfig) {}

  async createPayment(input: CreateProviderPaymentInput): Promise<ProviderPaymentResult> {
    assertNetworkReady(this.config);
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
      throw providerResponseInvalid();
    }
    if (input.callbackUrl !== this.config.callbackUrl || input.returnUrl !== this.config.returnUrl) {
      throw providerNotReady();
    }

    const merchantOrderId = `TL-${input.purchaseId}`;
    const paymentMethod = METHOD_MAP[input.method];
    if (!paymentMethod) throw providerResponseInvalid();

    const signature = createDuitkuInquirySignature(
      this.config.merchantCode,
      merchantOrderId,
      input.amount,
      this.config.apiKey,
    );

    const requestPayload: Record<string, unknown> = {
      merchantCode: this.config.merchantCode,
      merchantOrderId,
      paymentAmount: input.amount,
      paymentMethod,
      customerVaName: input.customer.name,
      email: input.customer.email,
      callbackUrl: this.config.callbackUrl,
      returnUrl: this.config.returnUrl,
      signature,
    };
    if (input.customer.phone) {
      requestPayload.customerPhone = input.customer.phone;
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/webapi/api/merchant/v2/inquiry`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(requestPayload),
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!response.ok) throw providerUnavailable();
      const payload: unknown = await response.json();
      if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
        throw providerResponseInvalid();
      }

      const data = payload as Record<string, unknown>;
      const statusCode = typeof data.statusCode === "string" ? data.statusCode : "";
      const reference = typeof data.reference === "string" ? data.reference : "";
      const paymentUrl = typeof data.paymentUrl === "string" ? data.paymentUrl : "";

      if (!reference) throw providerResponseInvalid();

      const state = statusCode === "00" ? "pending" as const : "failed" as const;

      let channelFee = 0;
      if (input.method === "qris") {
        channelFee = Math.round(input.amount * 0.007);
      }

      return {
        providerReference: reference,
        state,
        redirectUrl: paymentUrl,
        channelFee,
        totalAmount: input.amount + channelFee,
        expiresAt: null,
      };
    } catch (error) {
      if (error instanceof BillingError) throw error;
      throw providerUnavailable();
    }
  }

  async getPaymentStatus(reference: string): Promise<VerifiedProviderEvent> {
    assertNetworkReady(this.config);

    const signature = createDuitkuStatusSignature(
      this.config.merchantCode,
      reference,
      this.config.apiKey,
    );

    try {
      const response = await fetch(
        `${this.config.baseUrl}/webapi/api/merchant/transactionStatus`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            merchantCode: this.config.merchantCode,
            merchantOrderId: reference,
            signature,
          }),
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!response.ok) throw providerUnavailable();
      const payload: unknown = await response.json();
      if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
        throw providerResponseInvalid();
      }

      const data = payload as Record<string, unknown>;
      const statusCode = typeof data.statusCode === "string" ? data.statusCode : "";
      const providerRef = typeof data.reference === "string" ? data.reference : reference;
      const amount = typeof data.amount === "string" ? Number(data.amount) : 0;
      const fee = typeof data.fee === "string" ? Number(data.fee) : 0;

      let state: VerifiedProviderEvent["state"];
      if (statusCode === "00") state = "paid";
      else if (statusCode === "01") state = "pending";
      else if (statusCode === "02") state = "canceled";
      else state = "failed";

      return {
        eventReference: reference,
        providerReference: providerRef,
        state,
        amount,
        channelFee: fee,
        occurredAt: new Date().toISOString(),
        raw: data,
      };
    } catch (error) {
      if (error instanceof BillingError) throw error;
      throw providerUnavailable();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async cancelPayment(_reference: string): Promise<{ accepted: boolean }> {
    return { accepted: true };
  }

  verifyCallback(input: { rawBody: string; headers: Headers }): VerifiedProviderEvent {
    return verifyDuitkuCallback({
      rawBody: input.rawBody,
      merchantCode: this.config.merchantCode,
      apiKey: this.config.apiKey,
    });
  }
}

export function createPaymentProvider(): PaymentProvider {
  return new DuitkuProvider(readEnabledConfig());
}
