export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED';

export interface CreatePaymentIntentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  paymentMethod: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntentResult {
  success: boolean;
  transactionId: string;
  clientSecret?: string;
  status: PaymentStatus;
  provider: string;
  amount: number;
  currency: string;
  gatewayResponse?: any;
  error?: string;
}

export interface VerifyPaymentInput {
  transactionId: string;
  orderId?: string;
  verificationToken?: string;
  rawPayload?: any;
  signature?: string;
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  status: PaymentStatus;
  transactionId: string;
  amount: number;
  currency: string;
  provider: string;
  paidAt?: Date;
  gatewayResponse?: any;
  error?: string;
}

export interface RefundPaymentInput {
  transactionId: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  transactionId: string;
  status: PaymentStatus;
  amountRefunded: number;
  error?: string;
}

export interface WebhookResult {
  handled: boolean;
  event?: string;
  orderId?: string;
  transactionId?: string;
  status?: PaymentStatus;
  data?: any;
  error?: string;
}

/**
 * Standard Payment Service Interface.
 * Any payment gateway (Stripe, Adyen, PayPal, Mollie, etc.) must implement this contract.
 * The core application NEVER talks directly to a proprietary gateway SDK.
 */
export interface IPaymentService {
  readonly providerName: string;

  /**
   * Initialize a payment intent with the provider.
   */
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;

  /**
   * Verify transaction status directly against the payment provider on the server.
   * Never rely on frontend assertions.
   */
  verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult>;

  /**
   * Process a refund with the provider.
   */
  refundPayment(input: RefundPaymentInput): Promise<RefundResult>;

  /**
   * Handle asynchronous webhook events with provider signature verification.
   */
  handleWebhook(payload: any, headers?: Record<string, string>): Promise<WebhookResult>;
}
