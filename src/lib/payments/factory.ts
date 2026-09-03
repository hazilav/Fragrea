import { IPaymentService } from './types';
import { SandboxPaymentProvider } from './providers/SandboxPaymentProvider';
import { StripePaymentProvider } from './providers/StripePaymentProvider';

// Singleton instances
const sandboxInstance = new SandboxPaymentProvider();
let stripeInstance: StripePaymentProvider | null = null;

/**
 * Payment Service Factory.
 * Central registry that abstracts away all gateway-specific logic.
 * The rest of the application ONLY interacts with IPaymentService.
 */
export function getPaymentService(providerName?: string): IPaymentService {
  const selectedProvider = (
    providerName ||
    process.env.PAYMENT_PROVIDER ||
    'SANDBOX'
  ).toUpperCase();

  switch (selectedProvider) {
    case 'STRIPE':
      if (!stripeInstance) {
        stripeInstance = new StripePaymentProvider();
      }
      return stripeInstance;

    case 'SANDBOX':
    case 'SANDBOX_MAISON':
    default:
      return sandboxInstance;
  }
}
