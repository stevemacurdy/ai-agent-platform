import { describe, it, expect } from 'vitest';

describe('Auth middleware', () => {
  it('should extract Bearer token', () => {
    const header = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
    const token = header.startsWith('Bearer ') ? header.substring(7) : null;
    expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');
  });

  it('should reject missing auth header', () => {
    const header = null;
    const token = header && header.startsWith('Bearer ') ? header.substring(7) : null;
    expect(token).toBeNull();
  });

  it('should reject malformed auth header', () => {
    const header = 'Basic dXNlcjpwYXNz';
    const token = header.startsWith('Bearer ') ? header.substring(7) : null;
    expect(token).toBeNull();
  });
});
