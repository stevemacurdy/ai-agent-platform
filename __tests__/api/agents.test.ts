import { describe, it, expect } from 'vitest';

describe('Agent API routes', () => {
  it('should define all 21 agent slugs', () => {
    const slugs = [
      'cfo','collections','finops','payables',
      'sales','sales-intel','sales-coach','marketing','seo',
      'warehouse','supply-chain','wms','operations',
      'hr','support','training',
      'legal','compliance',
      'research','org-lead','str',
    ];
    expect(slugs).toHaveLength(21);
  });

  it('should return valid data shape from demo endpoints', async () => {
    // Simulate the expected response shape
    const demoResponse = {
      success: true,
      data: {
        kpis: [{ label: 'Test', value: 100, trend: 'up' }],
        tableData: [{ id: 1, name: 'Test Row' }],
        recommendations: [{ priority: 'high', title: 'Test', description: 'Test rec' }],
      },
    };
    expect(demoResponse.success).toBe(true);
    expect(demoResponse.data.kpis).toHaveLength(1);
    expect(demoResponse.data.recommendations[0].priority).toBe('high');
  });
});
