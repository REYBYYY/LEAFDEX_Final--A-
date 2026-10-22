import { Resend } from 'resend';

let resendClient = null;

export function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendOtpEmail({ to, otp, fullName, purpose = 'verification' }) {
  const resend = getResend();
  const subject = purpose === 'login' ? `LeafDex Login Code: ${otp}` : `LeafDex Verification Code: ${otp}`;
  const heading = purpose === 'login' ? 'LeafDex Login Verification' : 'LeafDex Email Verification';
  const copyText = purpose === 'login'
    ? 'Your one-time login code is:'
    : 'Your one-time verification code (OTP) for creating your LeafDex account is:';

  if (!resend) {
    console.log(`[${purpose.toUpperCase()} OTP Simulated Delivery] Code for ${to}: ${otp}`);
    return { sent: false, message: 'No API key configured—simulated delivery only.' };
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM || 'LeafDex Security <onboarding@resend.dev>',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #021f17; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #34d399; margin-top: 0;">${heading}</h2>
          <p>Hello ${fullName || ''},</p>
          <p>${copyText}</p>
          <div style="background-color: #064e3b; padding: 16px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; color: #a7f3d0; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 13px; color: #94a3b8;">This code is valid for 5 minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
      text: `Your LeafDex ${purpose === 'login' ? 'login' : 'verification'} code is: ${otp}. It expires in 5 minutes.`,
    });

    return { sent: true, message: 'Email sent successfully via Resend.' };
  } catch (error) {
    console.error('Resend send error:', error);
    return { sent: false, message: error.message || 'Failed to send email.' };
  }
}
