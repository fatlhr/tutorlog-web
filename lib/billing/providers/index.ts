import "server-only";

import { createPaymentProvider as createDuitkuProvider } from "./duitku";
import type { PaymentProvider } from "./provider";

export type {
  CreateProviderPaymentInput,
  PaymentProvider,
  ProviderPaymentResult,
  VerifiedProviderEvent,
} from "./provider";

export function createPaymentProvider(): PaymentProvider {
  return createDuitkuProvider();
}
