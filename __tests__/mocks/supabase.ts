export const mockSupabase = {
  from: (table: string) => ({
    select: () => ({ eq: () => ({ single: () => ({ data: { id: 'test-id', tier: 'growth' }, error: null }), data: [{ id: 'test' }], error: null, count: 5 }), data: [], error: null }),
    insert: () => ({ data: { id: 'new-id' }, error: null }),
    upsert: () => ({ data: null, error: null }),
    update: () => ({ eq: () => ({ data: null, error: null }) }),
    delete: () => ({ eq: () => ({ data: null, error: null }) }),
  }),
  auth: {
    getUser: () => ({ data: { user: { id: 'user-1', email: 'test@test.com' } }, error: null }),
  },
};

export function createMockClient() { return mockSupabase; }
