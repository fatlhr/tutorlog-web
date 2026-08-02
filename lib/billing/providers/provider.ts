import "server-only";

export interface CreateProviderPaymentInput {
  purchaseId: string;
  amount: number;
  method: "qris" | "va";
  customer: { name: string; email: string; phone?: string };
  callbackUrl: string;
  returnUrl: string;
}

export interface ProviderPaymentResult {
  providerReference: string;
  state: "pending" | "failed";
  redirectUrl: string;
  channelFee: number;
  totalAmount: number;
  expiresAt: string | null;
}

export interface VerifiedProviderEvent {
  eventReference: string;
  providerReference: string;
  state: "pending" | "paid" | "expired" | "failed" | "canceled";
  amount: number;
  channelFee: number;
  occurredAt: string;
  raw: Record<string, unknown>;
}

export interface PaymentProvider {
  createPayment(input: CreateProviderPaymentInput): Promise<ProviderPaymentResult>;
  getPaymentStatus(reference: string): Promise<VerifiedProviderEvent>;
  cancelPayment(reference: string): Promise<{ accepted: boolean }>;
  verifyCallback(input: { rawBody: string; headers: Headers }): VerifiedProviderEvent;
}
