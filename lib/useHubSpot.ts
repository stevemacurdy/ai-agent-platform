// lib/useHubSpot.ts
// React hooks for HubSpot CRM integration
'use client';

import { useState, useEffect, useCallback } from 'react';

interface HubSpotDashboard {
  contacts: { total: number; recent: any[] };
  companies: { total: number; recent: any[] };
  deals: { total: number; recent: any[]; totalValue: number };
  lifecycleStages: Record<string, number>;
}

// Dashboard data hook
export function useHubSpotDashboard() {
  const [data, setData] = useState<HubSpotDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hubspot?action=dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

// Contacts hook
export function useHubSpotContacts(options?: { limit?: number; search?: string }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ action: 'contacts' });
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.search) params.append('search', options.search);
      
      const response = await fetch(`/api/hubspot?${params}`);
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const result = await response.json();
      setContacts(result.results || []);
      setTotal(result.total || result.results?.length || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options?.limit, options?.search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contacts, total, loading, error, refresh };
}

// Companies hook
export function useHubSpotCompanies(limit = 100) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch(`/api/hubspot?action=companies&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch companies');
        const result = await response.json();
        setCompanies(result.results || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, [limit]);

  return { companies, loading, error };
}

// Deals hook
export function useHubSpotDeals(limit = 100) {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await fetch(`/api/hubspot?action=deals&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch deals');
        const result = await response.json();
        setDeals(result.results || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, [limit]);

  return { deals, loading, error };
}

// Connection test hook
export function useHubSpotConnection() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch('/api/hubspot?action=test');
        const result = await response.json();
        setConnected(result.connected);
        if (!result.connected) setError(result.error);
      } catch (err: any) {
        setConnected(false);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    testConnection();
  }, []);

  return { connected, loading, error };
}

// Action functions (not hooks)
export async function createContact(properties: Record<string, string>) {
  const response = await fetch('/api/hubspot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'createContact', properties }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create contact');
  }
  return response.json();
}

export async function updateContact(id: string, properties: Record<string, string>) {
  const response = await fetch('/api/hubspot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'updateContact', id, properties }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update contact');
  }
  return response.json();
}

export async function createCompany(properties: Record<string, string>) {
  const response = await fetch('/api/hubspot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'createCompany', properties }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create company');
  }
  return response.json();
}

export async function createDeal(properties: Record<string, string>) {
  const response = await fetch('/api/hubspot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'createDeal', properties }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create deal');
  }
  return response.json();
}

export async function addNoteToContact(contactId: string, body: string) {
  const response = await fetch('/api/hubspot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'addNote', contactId, body }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add note');
  }
  return response.json();
}

export async function deleteContact(id: string) {
  const response = await fetch(`/api/hubspot?type=contact&id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete contact');
  }
  return response.json();
}
