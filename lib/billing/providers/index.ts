import "server-only";

import { BillingError } from "@/lib/billing/errors";
import { IpaymuProvider, type IpaymuProviderConfig } from "./ipaymu";
import type { PaymentProvider } from "./provider";

export type {
  CreateProviderPaymentInput,
  PaymentProvider,
  ProviderPaymentResult,
  VerifiedProviderEvent,
} from "./provider";

const REQUIRED_CONFIG = {
  baseUrl: "IPAYMU_BASE_URL",
  va: "IPAYMU_VA",
  apiKey: "IPAYMU_API_KEY",
  callbackUrl: "IPAYMU_CALLBACK_URL",
  returnUrl: "IPAYMU_RETURN_URL",
} as const;

function notReady(): BillingError {
  return new BillingError(
    "PAYMENT_PROVIDER_NOT_READY",
    "Payment provider is not ready",
  );
}

function readConfig(): IpaymuProviderConfig {
  const config = Object.fromEntries(
    Object.entries(REQUIRED_CONFIG).map(([key, envName]) => [key, process.env[envName]?.trim()]),
  ) as Record<keyof IpaymuProviderConfig, string | undefined>;

  if (Object.values(config).some((value) => !value)) throw notReady();

  try {
    for (const key of ["baseUrl", "callbackUrl", "returnUrl"] as const) {
      const url = new URL(config[key] as string);
      if (url.protocol !== "https:") throw notReady();
    }
  } catch {
    throw notReady();
  }

  return {
    baseUrl: (config.baseUrl as string).replace(/\/$/, ""),
    va: config.va as string,
    apiKey: config.apiKey as string,
    callbackUrl: config.callbackUrl as string,
    returnUrl: config.returnUrl as string,
  };
}

export function createPaymentProvider(): PaymentProvider {
  if (process.env.BILLING_PAYMENT_PROVIDER_ENABLED === "true") {
    return new IpaymuProvider(readConfig());
  }
  throw notReady();
}
