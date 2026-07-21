import "server-only";

import type { PaymentProvider } from "./provider";

export type {
  CreateProviderPaymentInput,
  PaymentProvider,
  ProviderPaymentResult,
  VerifiedProviderEvent,
} from "./provider";

export function createPaymentProvider(): PaymentProvider {
  if (process.env.DUITKU_MERCHANT_CODE) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createPaymentProvider: createDuitkuProvider } = require("./duitku") as {
      createPaymentProvider: () => PaymentProvider;
    };
    return createDuitkuProvider();
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createPaymentProvider: createIpaymuProvider } = require("./ipaymu") as {
    createPaymentProvider: () => PaymentProvider;
  };
  return createIpaymuProvider();
}
