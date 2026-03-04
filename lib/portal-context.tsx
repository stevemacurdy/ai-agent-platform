'use client';

import { createContext, useContext } from 'react';

interface PortalContextValue {
  basePath: string;
  isLive: boolean;
  apiBase: string;
}

const PortalContext = createContext<PortalContextValue>({
  basePath: '/portal/MWS-001',
  isLive: false,
  apiBase: '/api/agents/3pl-portal',
});

export function PortalProvider({ children, customerCode, isLive = false }: {
  children: React.ReactNode;
  customerCode: string;
  isLive?: boolean;
}) {
  const basePath = isLive ? `/p/${customerCode}` : `/portal/${customerCode}`;
  const apiBase = isLive ? `/api/p/${customerCode}` : '/api/agents/3pl-portal';
  return (
    <PortalContext.Provider value={{ basePath, isLive, apiBase }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  return useContext(PortalContext);
}
