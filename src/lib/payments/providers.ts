import type { PaymentProvider, PaymentIntent, PaymentResult } from "./types";

const codProvider: PaymentProvider = {
  id: "cod",
  name: "Cash on Delivery",
  nameAr: "الدفع عند الاستلام",
  enabled: true,
  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `COD-${intent.orderId}`,
      status: "pending",
    };
  },
};

/** Paymob — plug in real keys via env */
const paymobProvider: PaymentProvider = {
  id: "paymob",
  name: "Paymob",
  nameAr: "باي موب",
  enabled: process.env.PAYMOB_API_KEY ? true : false,
  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    // Architecture: call Paymob Intention API here
    // const res = await fetch("https://accept.paymob.com/v1/intention/", ...)
    if (!process.env.PAYMOB_API_KEY) {
      return {
        success: false,
        status: "failed",
        error: "Paymob غير مُعد. أضف PAYMOB_API_KEY في .env",
      };
    }
    return {
      success: true,
      transactionId: `PAYMOB-PENDING-${intent.orderId}`,
      redirectUrl: undefined, // set when integrated
      status: "pending",
    };
  },
};

/** Stripe — plug in real keys via env */
const stripeProvider: PaymentProvider = {
  id: "stripe",
  name: "Stripe",
  nameAr: "سترايب",
  enabled: process.env.STRIPE_SECRET_KEY ? true : false,
  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        success: false,
        status: "failed",
        error: "Stripe غير مُعد. أضف STRIPE_SECRET_KEY في .env",
      };
    }
    // Architecture: stripe.checkout.sessions.create(...)
    return {
      success: true,
      transactionId: `STRIPE-PENDING-${intent.orderId}`,
      status: "pending",
    };
  },
};

const walletProvider: PaymentProvider = {
  id: "wallet",
  name: "E-Wallet",
  nameAr: "محفظة إلكترونية",
  enabled: false, // enable when integrated
  async createPayment(): Promise<PaymentResult> {
    return {
      success: false,
      status: "failed",
      error: "المحافظ الإلكترونية قيد التفعيل قريبًا",
    };
  },
};

export const paymentProviders: PaymentProvider[] = [
  codProvider,
  paymobProvider,
  stripeProvider,
  walletProvider,
];

export function getProvider(id: string): PaymentProvider | undefined {
  return paymentProviders.find((p) => p.id === id && p.enabled);
}

export function getEnabledProviders(): PaymentProvider[] {
  return paymentProviders.filter((p) => p.enabled);
}
