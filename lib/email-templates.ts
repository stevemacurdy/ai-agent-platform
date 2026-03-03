// ═══════════════════════════════════════════════════════
// WoulfAI Email Templates
// ═══════════════════════════════════════════════════════

const BRAND = {
  primary: '#2563EB',
  dark: '#1B2A4A',
  light: '#F4F5F7',
  accent: '#7C3AED',
  url: 'https://www.woulfai.com',
};

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BRAND.light};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.light};padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:${BRAND.dark};padding:28px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">Woulf<span style="color:${BRAND.primary};">AI</span></span>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:${BRAND.light};padding:24px 40px;text-align:center;font-size:13px;color:#6B7280;">
            <p style="margin:0 0 8px;">WoulfAI — AI Employees That Actually Work</p>
            <p style="margin:0;"><a href="${BRAND.url}" style="color:${BRAND.primary};text-decoration:none;">woulfai.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr><td style="background:${BRAND.primary};border-radius:8px;padding:14px 32px;">
      <a href="${url}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">${text}</a>
    </td></tr>
  </table>`;
}

// ═══════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════

export function welcomeEmail(name: string) {
  return layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.dark};">Welcome aboard, ${name}!</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 16px;">
      Your AI workforce is ready to go. WoulfAI gives you intelligent AI employees that handle your warehouse operations, sales, finance, marketing, and more — 24/7.
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 8px;">Here's how to get started:</p>
    <ol style="font-size:15px;color:#374151;line-height:1.8;padding-left:20px;margin:0 0 16px;">
      <li>Connect your business tools (accounting, CRM, etc.)</li>
      <li>Pick your AI Employees based on your plan</li>
      <li>Watch the insights start flowing in your dashboard</li>
    </ol>
    ${button('Go to Your Dashboard', `${BRAND.url}/dashboard`)}
    <p style="font-size:14px;color:#6B7280;margin:0;">Questions? Just reply to this email — we're here to help.</p>
  `);
}

export function trialStartedEmail(name: string, plan: string) {
  return layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.dark};">Your 14-Day Free Trial is Active</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 16px;">
      Hey ${name}, your <strong>${plan}</strong> plan trial has started. You have full access for the next 14 days — no credit card charges until then.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.light};border-radius:8px;padding:20px;margin:0 0 20px;">
      <tr><td>
        <p style="font-size:14px;color:#374151;margin:0 0 8px;"><strong>Plan:</strong> ${plan}</p>
        <p style="font-size:14px;color:#374151;margin:0 0 8px;"><strong>Trial ends:</strong> 14 days from now</p>
        <p style="font-size:14px;color:#374151;margin:0;"><strong>What's included:</strong> Full access to all ${plan} features</p>
      </td></tr>
    </table>
    ${button('Start Using Your AI Employees', `${BRAND.url}/dashboard`)}
    <p style="font-size:14px;color:#6B7280;margin:0;">Need help getting set up? Reply to this email anytime.</p>
  `);
}

export function trialEndingEmail(name: string, daysLeft: number) {
  return layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.dark};">Your Trial Ends in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 16px;">
      Hey ${name}, just a heads up — your WoulfAI trial wraps up in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. After that, your AI employees will stop processing new data.
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 16px;">
      To keep your AI workforce running, make sure your billing info is up to date. No action needed if you've already added a payment method.
    </p>
    ${button('Manage Your Subscription', `${BRAND.url}/settings/billing`)}
    <p style="font-size:14px;color:#6B7280;margin:0;">Have questions about pricing? Reply here or check our <a href="${BRAND.url}/pricing" style="color:${BRAND.primary};">pricing page</a>.</p>
  `);
}

export function usageAlertEmail(name: string, percentUsed: number, plan: string) {
  const urgency = percentUsed >= 90 ? 'Critical' : percentUsed >= 75 ? 'Warning' : 'Notice';
  const color = percentUsed >= 90 ? '#DC2626' : percentUsed >= 75 ? '#F59E0B' : BRAND.primary;

  return layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:${color};">${urgency}: ${percentUsed}% Usage</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 16px;">
      Hey ${name}, your <strong>${plan}</strong> plan has used <strong>${percentUsed}%</strong> of its monthly AI actions. ${percentUsed >= 90
        ? 'You are about to hit your limit — actions will be paused once you reach 100%.'
        : 'Consider upgrading if you expect to need more capacity.'}
    </p>
    ${button(percentUsed >= 90 ? 'Upgrade Now' : 'View Usage Details', `${BRAND.url}/settings/billing`)}
    <p style="font-size:14px;color:#6B7280;margin:0;">Usage resets at the start of each billing cycle.</p>
  `);
}

export function paymentFailedEmail(name: string) {
  return layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:#DC2626;">Payment Failed</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 16px;">
      Hey ${name}, we weren't able to process your latest payment for WoulfAI. Your AI employees will continue working for now, but your account may be paused if the payment isn't resolved.
    </p>
    <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 16px;">
      Please update your payment method to avoid any interruption.
    </p>
    ${button('Update Payment Method', `${BRAND.url}/settings/billing`)}
    <p style="font-size:14px;color:#6B7280;margin:0;">If you believe this is an error, reply to this email and we'll look into it.</p>
  `);
}

export function teamInviteEmail(inviterName: string, companyName: string, inviteUrl: string) {
  return layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.dark};">You've Been Invited!</h1>
    <p style="font-size:16px;color:#374151;line-height:1.6;margin:0 0 16px;">
      <strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on WoulfAI. Click below to accept the invitation and start working with your team's AI employees.
    </p>
    ${button('Accept Invitation', inviteUrl)}
    <p style="font-size:14px;color:#6B7280;margin:0;">This invitation will expire in 7 days. If you didn't expect this, you can safely ignore it.</p>
  `);
}

export function leadNotificationEmail(lead: {
  name: string;
  email: string;
  company?: string;
  message?: string;
  plan?: string;
}) {
  return layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.dark};">New Lead Received</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.light};border-radius:8px;padding:20px;margin:0 0 20px;">
      <tr><td>
        <p style="font-size:14px;color:#374151;margin:0 0 8px;"><strong>Name:</strong> ${lead.name}</p>
        <p style="font-size:14px;color:#374151;margin:0 0 8px;"><strong>Email:</strong> ${lead.email}</p>
        ${lead.company ? `<p style="font-size:14px;color:#374151;margin:0 0 8px;"><strong>Company:</strong> ${lead.company}</p>` : ''}
        ${lead.plan ? `<p style="font-size:14px;color:#374151;margin:0 0 8px;"><strong>Interested in:</strong> ${lead.plan}</p>` : ''}
        ${lead.message ? `<p style="font-size:14px;color:#374151;margin:0;"><strong>Message:</strong> ${lead.message}</p>` : ''}
      </td></tr>
    </table>
    ${button('Reply to Lead', `mailto:${lead.email}`)}
  `);
}
