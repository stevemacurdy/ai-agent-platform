export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const sb = supabaseAdmin();

  try {
    switch (event.type) {
      // ═══════════════════════════════════════════════════════
      // CHECKOUT COMPLETED — Full auto-provisioning
      // ═══════════════════════════════════════════════════════
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const bundleId = session.metadata?.bundle_id;
        const bundleSlug = session.metadata?.bundle_slug;
        const billingPeriod = session.metadata?.billing_period || 'monthly';
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!userId) {
          console.error('[webhook] No userId in checkout metadata');
          break;
        }

        // 1. Get user email for company name fallback
        const { data: profile } = await sb
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .single();

        // 2. Create company for the new customer
        const companyName = profile?.full_name
          ? `${profile.full_name}'s Company`
          : `Company-${userId.slice(0, 8)}`;

        const { data: company, error: companyErr } = await sb
          .from('companies')
          .insert({
            name: companyName,
            owner_id: userId,
            slug: `co-${userId.slice(0, 8)}-${Date.now()}`,
            status: 'active',
          })
          .select('id')
          .single();

        if (companyErr) {
          console.error('[webhook] Company creation failed:', companyErr);
          // Don't break — still save subscription
        }

        const companyId = company?.id;

        // 3. Add user as company member (owner role)
        if (companyId) {
          await sb.from('company_members').upsert({
            company_id: companyId,
            user_id: userId,
            role: 'owner',
          }, { onConflict: 'company_id,user_id' });
        }

        // 4. Upsert subscription record
        const subData: Record<string, any> = {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: bundleSlug || 'starter-pack',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + (billingPeriod === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (companyId) subData.company_id = companyId;

        await sb.from('subscriptions').upsert(subData, { onConflict: 'user_id' });

        // 5. Grant bundle agent access
        if (bundleId && companyId) {
          // Look up which agents are in this bundle
          const { data: bundleLinks } = await sb
            .from('bundle_agents')
            .select('agent_id')
            .eq('bundle_id', bundleId);

          if (bundleLinks && bundleLinks.length > 0) {
            const accessRows = bundleLinks.map((link) => ({
              company_id: companyId,
              agent_id: link.agent_id,
              bundle_id: bundleId,
              granted_by: 'stripe-checkout',
              status: 'active',
            }));

            await sb
              .from('company_bundle_access')
              .upsert(accessRows, { onConflict: 'company_id,agent_id' });

            console.log(`[webhook] Granted access to ${bundleLinks.length} agents for company ${companyId}`);
          }
        }

        console.log(`[webhook] Provisioned: user=${userId}, company=${companyId}, bundle=${bundleSlug}`);
        break;
      }

      // ═══════════════════════════════════════════════════════
      // SUBSCRIPTION UPDATED — Sync status + period
      // ═══════════════════════════════════════════════════════
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;

        if (userId) {
          await sb.from('subscriptions').update({
            status: sub.status,
            plan: sub.metadata?.bundle_slug || sub.metadata?.plan || 'starter-pack',
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('user_id', userId);
        }
        break;
      }

      // ═══════════════════════════════════════════════════════
      // SUBSCRIPTION DELETED — Revoke access
      // ═══════════════════════════════════════════════════════
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;

        if (userId) {
          // Mark subscription canceled
          await sb.from('subscriptions').update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          }).eq('user_id', userId);

          // Revoke agent access for this user's company
          const { data: userSub } = await sb
            .from('subscriptions')
            .select('company_id')
            .eq('user_id', userId)
            .single();

          if (userSub?.company_id) {
            await sb
              .from('company_bundle_access')
              .update({ status: 'revoked' })
              .eq('company_id', userSub.company_id);

            console.log(`[webhook] Revoked agent access for company ${userSub.company_id}`);
          }
        }
        break;
      }

      // ═══════════════════════════════════════════════════════
      // PAYMENT FAILED — Flag as past_due
      // ═══════════════════════════════════════════════════════
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId = invoice.subscription;

        if (subId) {
          await sb.from('subscriptions').update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[webhook] Processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
