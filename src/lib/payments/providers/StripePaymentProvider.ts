import {
  IPaymentService,
  CreatePaymentIntentInput,
  PaymentIntentResult,
  VerifyPaymentInput,
  PaymentVerificationResult,
  RefundPaymentInput,
  RefundResult,
  WebhookResult,
} from '../types';

/**
 * Production Stripe Payment Gateway Adapter.
 * Implements IPaymentService.
 * When real Stripe API keys (STRIPE_SECRET_KEY) are configured, this adapter interacts
 * with Stripe's PaymentIntents and Webhooks API without any leakage of Stripe SDK details into the app.
 */
export class StripePaymentProvider implements IPaymentService {
  public readonly providerName = 'STRIPE';

  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.STRIPE_SECRET_KEY || '';
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    if (!this.apiKey) {
      // If Stripe key not present in environment, gracefully report provider requirement
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        provider: this.providerName,
        amount: input.amount,
        currency: input.currency,
        error: 'STRIPE_SECRET_KEY is not configured in environment variables.',
      };
    }

    try {
      // Direct REST call to Stripe API or SDK without hardcoding into application core
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: Math.round(input.amount * 100).toString(),
          currency: input.currency.toLowerCase(),
          'metadata[orderId]': input.orderId,
          'metadata[orderNumber]': input.orderNumber,
          receipt_email: input.customerEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          transactionId: '',
          status: 'FAILED',
          provider: this.providerName,
          amount: input.amount,
          currency: input.currency,
          error: data.error?.message || 'Stripe payment intent creation failed',
        };
      }

      return {
        success: true,
        transactionId: data.id,
        clientSecret: data.client_secret,
        status: data.status === 'succeeded' ? 'CAPTURED' : 'AUTHORIZED',
        provider: this.providerName,
        amount: input.amount,
        currency: input.currency,
        gatewayResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        provider: this.providerName,
        amount: input.amount,
        currency: input.currency,
        error: err.message,
      };
    }
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    if (!this.apiKey) {
      return {
        isVerified: false,
        status: 'FAILED',
        transactionId: input.transactionId,
        amount: 0,
        currency: 'USD',
        provider: this.providerName,
        error: 'STRIPE_SECRET_KEY is not configured.',
      };
    }

    try {
      // Server directly queries Stripe's servers to verify funds
      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${input.transactionId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        return {
          isVerified: false,
          status: 'FAILED',
          transactionId: input.transactionId,
          amount: 0,
          currency: 'USD',
          provider: this.providerName,
          error: data.error?.message || 'Failed to verify transaction with Stripe.',
        };
      }

      const isSucceeded = data.status === 'succeeded';

      return {
        isVerified: isSucceeded,
        status: isSucceeded ? 'CAPTURED' : 'PENDING',
        transactionId: data.id,
        amount: data.amount / 100,
        currency: data.currency.toUpperCase(),
        provider: this.providerName,
        paidAt: isSucceeded ? new Date(data.created * 1000) : undefined,
        gatewayResponse: data,
      };
    } catch (err: any) {
      return {
        isVerified: false,
        status: 'FAILED',
        transactionId: input.transactionId,
        amount: 0,
        currency: 'USD',
        provider: this.providerName,
        error: err.message,
      };
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundResult> {
    if (!this.apiKey) {
      return {
        success: false,
        refundId: '',
        transactionId: input.transactionId,
        status: 'FAILED',
        amountRefunded: 0,
        error: 'STRIPE_SECRET_KEY is missing.',
      };
    }

    try {
      const bodyParams: Record<string, string> = {
        payment_intent: input.transactionId,
      };
      if (input.amount) {
        bodyParams.amount = Math.round(input.amount * 100).toString();
      }
      if (input.reason) {
        bodyParams.reason = input.reason;
      }

      const res = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(bodyParams),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          refundId: '',
          transactionId: input.transactionId,
          status: 'FAILED',
          amountRefunded: 0,
          error: data.error?.message,
        };
      }

      return {
        success: true,
        refundId: data.id,
        transactionId: input.transactionId,
        status: 'REFUNDED',
        amountRefunded: (data.amount || 0) / 100,
      };
    } catch (err: any) {
      return {
        success: false,
        refundId: '',
        transactionId: input.transactionId,
        status: 'FAILED',
        amountRefunded: 0,
        error: err.message,
      };
    }
  }

  async handleWebhook(payload: any, headers?: Record<string, string>): Promise<WebhookResult> {
    // Verifies Stripe webhook event structure
    if (!payload || !payload.type) {
      return { handled: false, error: 'Invalid Stripe event format' };
    }

    const event = payload.type;
    const object = payload.data?.object;

    if (event === 'payment_intent.succeeded' && object) {
      return {
        handled: true,
        event,
        orderId: object.metadata?.orderId,
        transactionId: object.id,
        status: 'CAPTURED',
        data: object,
      };
    }

    return {
      handled: true,
      event,
      transactionId: object?.id,
      status: 'PENDING',
    };
  }
}
