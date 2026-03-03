import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'WoulfAI <noreply@woulfai.com>';
const SUPPORT_EMAIL = 'support@woulfai.com';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyTo || SUPPORT_EMAIL,
    });

    if (error) {
      console.error('[email] Send failed:', error);
      return { success: false, error };
    }

    console.log('[email] Sent:', subject, 'to:', to, 'id:', data?.id);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[email] Error:', err.message);
    return { success: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════

export async function sendWelcomeEmail(email: string, name?: string) {
  const { welcomeEmail } = await import('./email-templates');
  return sendEmail({
    to: email,
    subject: 'Welcome to WoulfAI — Your AI Workforce is Ready',
    html: welcomeEmail(name || 'there'),
  });
}

export async function sendTrialStartedEmail(email: string, name?: string, plan?: string) {
  const { trialStartedEmail } = await import('./email-templates');
  return sendEmail({
    to: email,
    subject: 'Your 14-Day Free Trial Has Started',
    html: trialStartedEmail(name || 'there', plan || 'Starter'),
  });
}

export async function sendTrialEndingEmail(email: string, name?: string, daysLeft?: number) {
  const { trialEndingEmail } = await import('./email-templates');
  return sendEmail({
    to: email,
    subject: `Your WoulfAI Trial Ends in ${daysLeft || 3} Days`,
    html: trialEndingEmail(name || 'there', daysLeft || 3),
  });
}

export async function sendUsageAlertEmail(
  email: string,
  name: string,
  percentUsed: number,
  plan: string
) {
  const { usageAlertEmail } = await import('./email-templates');
  return sendEmail({
    to: email,
    subject: `Usage Alert: ${percentUsed}% of Your ${plan} Plan Used`,
    html: usageAlertEmail(name, percentUsed, plan),
  });
}

export async function sendPaymentFailedEmail(email: string, name?: string) {
  const { paymentFailedEmail } = await import('./email-templates');
  return sendEmail({
    to: email,
    subject: 'Action Required: Payment Failed for WoulfAI',
    html: paymentFailedEmail(name || 'there'),
  });
}

export async function sendTeamInviteEmail(
  email: string,
  inviterName: string,
  companyName: string,
  inviteUrl: string
) {
  const { teamInviteEmail } = await import('./email-templates');
  return sendEmail({
    to: email,
    subject: `${inviterName} invited you to join ${companyName} on WoulfAI`,
    html: teamInviteEmail(inviterName, companyName, inviteUrl),
  });
}

export async function sendNewLeadNotification(leadData: {
  name: string;
  email: string;
  company?: string;
  message?: string;
  plan?: string;
}) {
  const { leadNotificationEmail } = await import('./email-templates');
  return sendEmail({
    to: SUPPORT_EMAIL,
    subject: `New Lead: ${leadData.name} from ${leadData.company || 'Unknown'}`,
    html: leadNotificationEmail(leadData),
    replyTo: leadData.email,
  });
}
