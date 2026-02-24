'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CompanyContext {
  id: string;
  name: string;
  slug: string;
  agents: string[];
}

interface CompanyContextValue {
  company: CompanyContext | null;
  setCompany: (c: CompanyContext | null) => void;
  clearCompany: () => void;
}

const Ctx = createContext<CompanyContextValue>({
  company: null,
  setCompany: () => {},
  clearCompany: () => {},
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompanyState] = useState<CompanyContext | null>(null);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('woulfai_company');
      if (saved) setCompanyState(JSON.parse(saved));
    } catch {}
  }, []);

  const setCompany = (c: CompanyContext | null) => {
    setCompanyState(c);
    try {
      if (c) sessionStorage.setItem('woulfai_company', JSON.stringify(c));
      else sessionStorage.removeItem('woulfai_company');
    } catch {}
  };

  const clearCompany = () => setCompany(null);

  return (
    <Ctx.Provider value={{ company, setCompany, clearCompany }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCompany() {
  return useContext(Ctx);
}
