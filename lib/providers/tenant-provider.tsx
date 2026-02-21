'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export interface Company {
  id: string;
  name: string;
  slug?: string;
  logo_url?: string;
  odoo_url?: string;
  odoo_db?: string;
  hubspot_api_key?: string;
}

export interface TenantContextType {
  companyId: string | null;
  currentCompany: Company | null;
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  switchCompany: (id: string) => void;
}

const TenantContext = createContext<TenantContextType>({
  companyId: null,
  currentCompany: null,
  companies: [],
  isLoading: true,
  error: null,
  switchCompany: () => {},
});

export function useTenant() {
  return useContext(TenantContext);
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=' + encodeURIComponent(value) + ';path=/;max-age=' + (days * 86400) + ';SameSite=Lax';
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/tenant/companies');
        if (!res.ok) {
          console.warn('TenantProvider: companies API returned ' + res.status);
          if (mounted) { setError('Could not load companies'); setIsLoading(false); }
          return;
        }
        const data = await res.json();
        const list: Company[] = data.companies || data || [];
        if (!mounted) return;
        setCompanies(list);

        const savedId = getCookie('woulfai-company');
        const saved = list.find(c => c.id === savedId);
        if (saved) {
          setCompanyId(savedId);
        } else if (list.length > 0) {
          setCompanyId(list[0].id);
          setCookie('woulfai-company', list[0].id);
        }
        setIsLoading(false);
      } catch (err) {
        console.warn('TenantProvider: network error', err);
        if (mounted) { setError('Network error'); setIsLoading(false); }
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const switchCompany = useCallback((id: string) => {
    setCompanyId(id);
    setCookie('woulfai-company', id);
    fetch('/api/tenant/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: id }),
    }).catch(() => {});
  }, []);

  const currentCompany = companies.find(c => c.id === companyId) || null;

  return (
    <TenantContext.Provider value={{ companyId, currentCompany, companies, isLoading, error, switchCompany }}>
      {children}
    </TenantContext.Provider>
  );
}

export default TenantProvider;
export type Props = { children: ReactNode };
