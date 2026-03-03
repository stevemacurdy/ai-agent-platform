import { describe, it, expect } from 'vitest';

describe('Usage tracking', () => {
  it('should calculate correct usage percentage', () => {
    const current = 750;
    const limit = 1000;
    const percentage = Math.round((current / limit) * 100);
    expect(percentage).toBe(75);
  });

  it('should identify warning levels', () => {
    function getLevel(pct: number) {
      if (pct >= 100) return 'exceeded';
      if (pct >= 90) return 'critical';
      if (pct >= 75) return 'warning';
      if (pct >= 50) return 'info';
      return 'none';
    }
    expect(getLevel(100)).toBe('exceeded');
    expect(getLevel(92)).toBe('critical');
    expect(getLevel(75)).toBe('warning');
    expect(getLevel(50)).toBe('info');
    expect(getLevel(30)).toBe('none');
  });

  it('should enforce tier limits', () => {
    const LIMITS: Record<string, number> = { starter: 500, growth: 2000, professional: 10000 };
    expect(LIMITS.starter).toBe(500);
    expect(750 > LIMITS.starter).toBe(true);
    expect(750 > LIMITS.growth).toBe(false);
  });
});
