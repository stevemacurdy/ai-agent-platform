'use client';
import { useTenant as useRealTenant } from '@/lib/providers/tenant-provider';
import { TenantProvider as RealProvider } from '@/lib/providers/tenant-provider';
import React, { type ReactNode } from 'react';

export function TenantProvider({ children, user }: { children: ReactNode; user?: any }) {
  return React.createElement(RealProvider, null, children);
}

export function useTenant() {
  const ctx = useRealTenant();
  return {
    ...ctx,
    companyId: ctx.companyId || '',
    companyName: ctx.currentCompany?.name || '',
    userName: '',
    isGlobalAdmin: true,
  };
}
