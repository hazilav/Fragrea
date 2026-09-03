import prisma from '@/lib/prisma';

export type NotificationType =
  | 'ORDER_CONFIRMED'
  | 'ORDER_PROCESSING'
  | 'PAYMENT_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'ORDER_REFUNDED';

interface SendNotificationInput {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  type: NotificationType;
  metadata?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    cancellationReason?: string;
    refundAmount?: number;
  };
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  type: NotificationType;
  recipient: string;
  subject: string;
  message: string;
  error?: string;
}

/**
 * FRAGREA Customer Notification Dispatcher
 * Formats communication and persists customer updates to the database.
 * Never exposes internal admin notes or internal memos to customers.
 */
export async function sendCustomerNotification(
  input: SendNotificationInput
): Promise<NotificationResult> {
  const { orderId, orderNumber, customerEmail, customerName, type, metadata } = input;

  let subject = '';
  let message = '';

  switch (type) {
    case 'ORDER_CONFIRMED':
      subject = `Your Fragrea order #${orderNumber} has been confirmed`;
      message = `Dear ${customerName},\n\nYour Fragrea order #${orderNumber} has been confirmed. Our team has reserved your selected fragrances and is preparing your flacons with utmost precision and care.\n\nWarm regards,\nMaison FRAGREA`;
      break;

    case 'ORDER_PROCESSING':
      subject = `Your Fragrea order #${orderNumber} is now processing`;
      message = `Dear ${customerName},\n\nYour Fragrea order #${orderNumber} is now processing. Your flacons are being hand-packaged in signature obsidian coffrets for dispatch.\n\nWarm regards,\nMaison FRAGREA`;
      break;

    case 'PAYMENT_CONFIRMED':
      subject = `Payment received for Fragrea order #${orderNumber}`;
      message = `Dear ${customerName},\n\nYour payment for Fragrea order #${orderNumber} has been verified and settled.\n\nThank you for choosing Fragrea.`;
      break;

    case 'ORDER_SHIPPED':
      const carrier = metadata?.carrier || 'White-Glove Private Courier';
      const tracking = metadata?.trackingNumber || 'En Route via Private Escort';
      subject = `Your Fragrea order #${orderNumber} has been shipped`;
      message = `Dear ${customerName},\n\nYour Fragrea order #${orderNumber} has been shipped.\n\nCarrier: ${carrier}\nTracking Number: ${tracking}\n\nYour package is packed in climate-controlled packaging and on its way to your destination.\n\nWarm regards,\nMaison FRAGREA`;
      break;

    case 'ORDER_DELIVERED':
      subject = `Your Fragrea order #${orderNumber} has been delivered`;
      message = `Dear ${customerName},\n\nYour Fragrea order #${orderNumber} has been delivered. May your fragrance bring you timeless luxury and character.\n\nWarm regards,\nMaison FRAGREA`;
      break;

    case 'ORDER_CANCELLED':
      const reason = metadata?.cancellationReason ? ` (Reason: ${metadata.cancellationReason})` : '';
      subject = `Your Fragrea order #${orderNumber} has been cancelled`;
      message = `Dear ${customerName},\n\nYour Fragrea order #${orderNumber} has been cancelled${reason}. Any reserved stock has been repatriated to our vault. If you have any questions, please contact our concierge.\n\nWarm regards,\nMaison FRAGREA`;
      break;

    case 'ORDER_REFUNDED':
      const amountStr = metadata?.refundAmount ? ` of $${metadata.refundAmount.toFixed(2)}` : '';
      subject = `Your Fragrea order #${orderNumber} has been refunded`;
      message = `Dear ${customerName},\n\nA refund${amountStr} has been processed for Fragrea order #${orderNumber}. The funds will return to your originating payment method according to standard bank clearing times.\n\nWarm regards,\nMaison FRAGREA`;
      break;
  }

  try {
    const notification = await prisma.customerNotification.create({
      data: {
        orderId,
        recipient: customerEmail,
        type,
        subject,
        message,
        status: 'SENT',
      },
    });

    return {
      success: true,
      notificationId: notification.id,
      type,
      recipient: customerEmail,
      subject,
      message,
    };
  } catch (error: any) {
    console.error('Notification dispatch error:', error);
    return {
      success: false,
      type,
      recipient: customerEmail,
      subject,
      message,
      error: error.message,
    };
  }
}
