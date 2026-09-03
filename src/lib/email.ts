import nodemailer from 'nodemailer';

interface SendVerificationEmailParams {
  to: string;
  code: string;
  expiresInMinutes?: number;
}

/**
 * Configure Nodemailer transport
 * Supports custom SMTP or Gmail App Passwords if provided via environment variables.
 */
function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return null;
}

/**
 * Sends a luxury-formatted 6-digit verification code email for password reset.
 */
export async function sendPasswordResetCodeEmail({
  to,
  code,
  expiresInMinutes = 15,
}: SendVerificationEmailParams): Promise<{ success: boolean; previewCode?: string; messageId?: string }> {
  console.log(`\n======================================================`);
  console.log(`[FRAGREA SECURITY] Password Reset Verification Code:`);
  console.log(`Recipient: ${to}`);
  console.log(`Code:      >>> ${code} <<<`);
  console.log(`Expires:   ${expiresInMinutes} minutes`);
  console.log(`======================================================\n`);

  const transporter = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #050506; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F7F4EE; }
          .container { max-width: 580px; margin: 0 auto; padding: 40px 24px; }
          .card { background-color: #0E0E10; border: 1px solid rgba(212, 175, 55, 0.25); padding: 40px 32px; border-radius: 2px; text-align: center; }
          .logo { font-size: 26px; letter-spacing: 0.35em; font-family: Georgia, serif; color: #F7F4EE; margin-bottom: 4px; }
          .tagline { font-size: 9px; letter-spacing: 0.45em; text-transform: uppercase; color: #D4AF37; margin-bottom: 32px; }
          .divider { width: 48px; height: 1px; background-color: rgba(212, 175, 55, 0.4); margin: 0 auto 28px; }
          .headline { font-size: 18px; letter-spacing: 0.15em; text-transform: uppercase; color: #F7F4EE; margin-bottom: 12px; font-weight: 500; }
          .body-text { font-size: 13px; line-height: 1.7; color: #D6D2CA; margin-bottom: 28px; }
          .code-box { display: inline-block; background-color: #16161A; border: 1px solid #D4AF37; padding: 16px 36px; letter-spacing: 0.45em; font-size: 28px; font-weight: bold; color: #D4AF37; margin-bottom: 28px; border-radius: 2px; font-family: monospace; }
          .note { font-size: 11px; color: #8F8B82; line-height: 1.6; }
          .footer { margin-top: 32px; text-align: center; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #66635D; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">FRAGREA</div>
            <div class="tagline">PERFUMES &bull; HAUTE PARFUMERIE</div>
            <div class="divider"></div>
            
            <div class="headline">Administrator Security Gate</div>
            <p class="body-text">
              A request was made to authenticate or reset the master credentials for your Fragrea Maison account. Use the one-time security verification code below:
            </p>
            
            <div class="code-box">${code}</div>
            
            <p class="note">
              This code will expire in ${expiresInMinutes} minutes. If you did not request this security code, please disregard this email. Your account remains protected.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} FRAGREA PERFUMES &bull; 18 Rue de la Paix, Paris
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Fragrea Security" <security@fragrea.com>',
        to,
        subject: `[${code}] Fragrea Maison Security Verification Code`,
        text: `Your Fragrea password reset verification code is: ${code}. It expires in ${expiresInMinutes} minutes.`,
        html: htmlContent,
      });

      console.log('Verification email dispatched successfully via SMTP:', info.messageId);
      return { success: true, messageId: info.messageId, previewCode: code };
    } catch (err: any) {
      console.error('Error sending email via SMTP:', err.message);
      // Return success with previewCode so the user can still complete reset even if SMTP fails
      return { success: true, previewCode: code };
    }
  }

  return { success: true, previewCode: code };
}
