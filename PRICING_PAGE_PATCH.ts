// ═══════════════════════════════════════════════════════════
// PRICING PAGE PATCH — app/pricing/page.tsx
// ═══════════════════════════════════════════════════════════
//
// Replace the existing handleSubscribe function (around line 100)
// with this version. The key changes:
//   1. Sends `bundle` (slug) instead of `plan` (tier name)
//   2. Sends `billingPeriod` ('monthly' | 'annual')
//   3. Removes the old `plan` field
//
// Also: make sure your billing toggle state variable name
// matches what you pass as billingPeriod below.
// ═══════════════════════════════════════════════════════════

// FIND THIS (old):
//   body: JSON.stringify({ plan: tier, bundle: bundleSlug, userId: session.user.id, email: session.user.email }),

// REPLACE WITH:
//   body: JSON.stringify({
//     bundle: bundleSlug || tier,
//     billingPeriod: isAnnual ? 'annual' : 'monthly',
//     userId: session.user.id,
//     email: session.user.email,
//   }),

// ─────────────────────────────────────────────────────────
// Full updated function for reference:
// ─────────────────────────────────────────────────────────

/*
  const handleSubscribe = async (tier: string, bundleSlug?: string) => {
    if (tier === 'enterprise' || bundleSlug === 'full-platform') {
      // Full Platform → contact sales (or direct checkout if you want)
      window.location.href = '/contact?interest=enterprise';
      return;
    }

    setLoading(tier);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();

      if (!session) {
        window.location.href = '/login?redirect=/pricing';
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({
          bundle: bundleSlug || tier,
          billingPeriod: isAnnual ? 'annual' : 'monthly',
          userId: session.user.id,
          email: session.user.email,
        }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Something went wrong');
    } catch {
      alert('Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };
*/
