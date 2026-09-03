import crypto from 'crypto';
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

const SANDBOX_SECRET = process.env.PAYMENT_SANDBOX_SECRET || 'fragrea_luxury_vault_secret_key_2025';

// In-memory ledger simulating provider server state for tests and sandbox runs
interface LedgerRecord {
  transactionId: string;
  orderId: string;
  orderNumber?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  verificationToken: string;
  createdAt: Date;
}

const sandboxLedger = new Map<string, LedgerRecord>();

export class SandboxPaymentProvider implements IPaymentService {
  public readonly providerName = 'SANDBOX_MAISON';

  private generateToken(transactionId: string, amount: number, orderId: string): string {
    return crypto
      .createHmac('sha256', SANDBOX_SECRET)
      .update(`${transactionId}:${amount}:${orderId}`)
      .digest('hex');
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    const transactionId = `tx_sbx_${timestamp}_${random}`;

    const verificationToken = this.generateToken(transactionId, input.amount, input.orderId);
    const clientSecret = `cs_sbx_${Buffer.from(`${transactionId}:${verificationToken}`).toString('base64')}`;

    // Record in simulated provider database
    sandboxLedger.set(transactionId, {
      transactionId,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      amount: input.amount,
      currency: input.currency,
      status: 'AUTHORIZED',
      verificationToken,
      createdAt: new Date(),
    });

    return {
      success: true,
      transactionId,
      clientSecret,
      status: 'AUTHORIZED',
      provider: this.providerName,
      amount: input.amount,
      currency: input.currency,
      gatewayResponse: {
        authorizationCode: `AUTH-FRG-${random}`,
        network: 'Private Luxury Clearing',
        cvvCheck: 'PASS',
        riskScore: 'LOW',
      },
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const record = sandboxLedger.get(input.transactionId);

    // If transaction doesn't exist in provider records -> strictly unverified!
    if (!record) {
      return {
        isVerified: false,
        status: 'FAILED',
        transactionId: input.transactionId,
        amount: 0,
        currency: 'USD',
        provider: this.providerName,
        error: 'Transaction reference was not found in the payment provider registry.',
      };
    }

    // Cryptographic token verification to prevent client forgery
    if (input.verificationToken) {
      const expectedToken = this.generateToken(record.transactionId, record.amount, record.orderId);
      if (input.verificationToken !== expectedToken) {
        return {
          isVerified: false,
          status: 'FAILED',
          transactionId: input.transactionId,
          amount: record.amount,
          currency: record.currency,
          provider: this.providerName,
          error: 'Cryptographic signature mismatch. Potential tampering detected.',
        };
      }
    }

    // Verify order identifier if supplied
    if (
      input.orderId &&
      record.orderId !== input.orderId &&
      record.orderNumber !== input.orderId
    ) {
      return {
        isVerified: false,
        status: 'FAILED',
        transactionId: input.transactionId,
        amount: record.amount,
        currency: record.currency,
        provider: this.providerName,
        error: 'Transaction does not correspond to the requested order identifier.',
      };
    }

    // Provider captures the payment on server verification
    record.status = 'CAPTURED';
    sandboxLedger.set(input.transactionId, record);

    return {
      isVerified: true,
      status: 'CAPTURED',
      transactionId: record.transactionId,
      amount: record.amount,
      currency: record.currency,
      provider: this.providerName,
      paidAt: new Date(),
      gatewayResponse: {
        settlementStatus: 'SETTLED',
        scheme: 'VISA_INFINITE_LUXURY',
        vaultBatch: 'BTCH-FRG-2026',
      },
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundResult> {
    const record = sandboxLedger.get(input.transactionId);

    if (!record) {
      return {
        success: false,
        refundId: '',
        transactionId: input.transactionId,
        status: 'FAILED',
        amountRefunded: 0,
        error: 'Original transaction not found for refund.',
      };
    }

    record.status = 'REFUNDED';
    sandboxLedger.set(input.transactionId, record);

    const refundId = `ref_sbx_${Date.now()}`;

    return {
      success: true,
      refundId,
      transactionId: input.transactionId,
      status: 'REFUNDED',
      amountRefunded: input.amount || record.amount,
    };
  }

  async handleWebhook(payload: any, headers?: Record<string, string>): Promise<WebhookResult> {
    if (!payload || !payload.transactionId) {
      return { handled: false, error: 'Malformed webhook event payload.' };
    }

    const verification = await this.verifyPayment({
      transactionId: payload.transactionId,
      verificationToken: payload.verificationToken,
    });

    return {
      handled: true,
      event: payload.event || 'payment.captured',
      orderId: payload.orderId,
      transactionId: payload.transactionId,
      status: verification.status,
      data: verification,
    };
  }
}
