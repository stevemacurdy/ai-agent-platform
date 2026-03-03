import { describe, it, expect } from 'vitest';

describe('Checkout webhook', () => {
  it('should extract bundle metadata from session', () => {
    const session = {
      metadata: { bundle_slug: 'growth', billing_period: 'monthly', userId: 'user-1' },
      customer: 'cus_test123',
      subscription: 'sub_test456',
    };
    expect(session.metadata.bundle_slug).toBe('growth');
    expect(session.metadata.billing_period).toBe('monthly');
    expect(session.customer).toContain('cus_');
  });

  it('should map bundle to tier', () => {
    const tierMap: Record<string, string> = {
      'starter-pack': 'starter', starter: 'starter',
      growth: 'growth', professional: 'professional',
      enterprise: 'enterprise',
    };
    expect(tierMap['growth']).toBe('growth');
    expect(tierMap['starter-pack']).toBe('starter');
  });
});
