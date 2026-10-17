export type PaymentProviderId = "cod" | "paymob" | "stripe" | "fawry" | "wallet";

export interface PaymentIntent {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string; // for hosted payment pages
  status: "pending" | "paid" | "failed";
  raw?: unknown;
  error?: string;
}

export interface PaymentProvider {
  id: PaymentProviderId;
  name: string;
  nameAr: string;
  enabled: boolean;
  /**
   * Initiate a payment. COD returns success immediately as pending.
   * Card gateways may return a redirectUrl.
   */
  createPayment(intent: PaymentIntent): Promise<PaymentResult>;
  /**
   * Verify/confirm a payment after callback or webhook.
   */
  verifyPayment?(transactionId: string, payload?: unknown): Promise<PaymentResult>;
}
