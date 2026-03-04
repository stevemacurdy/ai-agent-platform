'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  Portal3PLCustomer, InventoryItem, Order, Invoice, Payment,
  ReceivingRecord, ActivityEvent,
} from '@/lib/3pl-portal-data';
import {
  DEMO_CUSTOMER, DEMO_INVENTORY, DEMO_ORDERS, DEMO_INVOICES,
  DEMO_PAYMENTS, DEMO_RECEIVING, DEMO_ACTIVITY, getDemoKPIs,
  getPaymentChartData, getInventoryChartData,
} from '@/lib/3pl-portal-data';

export interface PortalKPIs {
  currentBalance: number;
  dueIn: number;
  totalUnits: number;
  totalSKUs: number;
  openOrderCount: number;
  paymentHealth: string;
  paymentStatus: string;
  balanceStatus: string;
}

export interface PortalDataState {
  mode: 'demo' | 'live';
  customer: Portal3PLCustomer;
  inventory: InventoryItem[];
  orders: Order[];
  invoices: Invoice[];
  payments: Payment[];
  receiving: ReceivingRecord[];
  activity: ActivityEvent[];
  kpis: PortalKPIs;
  paymentChartData: any[];
  inventoryChartData: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DEMO_STATE: PortalDataState = {
  mode: 'demo',
  customer: DEMO_CUSTOMER,
  inventory: DEMO_INVENTORY,
  orders: DEMO_ORDERS,
  invoices: DEMO_INVOICES,
  payments: DEMO_PAYMENTS,
  receiving: DEMO_RECEIVING,
  activity: DEMO_ACTIVITY,
  kpis: getDemoKPIs(),
  paymentChartData: getPaymentChartData(),
  inventoryChartData: getInventoryChartData(),
  loading: false,
  error: null,
  refetch: () => {},
};

const PortalDataContext = createContext<PortalDataState>(DEMO_STATE);

export function usePortalData() {
  return useContext(PortalDataContext);
}

interface ProviderProps {
  mode: 'demo' | 'live';
  customerCode: string;
  children: ReactNode;
}

export function PortalDataProvider({ mode, customerCode, children }: ProviderProps) {
  const [state, setState] = useState<PortalDataState>(() =>
    mode === 'demo' ? DEMO_STATE : { ...DEMO_STATE, mode: 'live', loading: true }
  );

  const fetchLiveData = async () => {
    if (mode === 'demo') return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`/api/agents/3pl-portal/all?code=${encodeURIComponent(customerCode)}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      setState({
        mode: 'live',
        customer: data.customer || DEMO_CUSTOMER,
        inventory: data.inventory || DEMO_INVENTORY,
        orders: data.orders || DEMO_ORDERS,
        invoices: data.invoices || DEMO_INVOICES,
        payments: data.payments || DEMO_PAYMENTS,
        receiving: data.receiving || DEMO_RECEIVING,
        activity: data.activity || DEMO_ACTIVITY,
        kpis: data.kpis || getDemoKPIs(),
        paymentChartData: data.paymentChartData || getPaymentChartData(),
        inventoryChartData: data.inventoryChartData || getInventoryChartData(),
        loading: false,
        error: null,
        refetch: fetchLiveData,
      });
    } catch (err: any) {
      console.error('Portal data fetch error:', err);
      // Fall back to demo data on error
      setState({
        ...DEMO_STATE,
        mode: 'live',
        loading: false,
        error: err.message || 'Failed to load portal data',
        refetch: fetchLiveData,
      });
    }
  };

  useEffect(() => {
    if (mode === 'live') fetchLiveData();
  }, [mode, customerCode]);

  const value = mode === 'demo'
    ? DEMO_STATE
    : { ...state, refetch: fetchLiveData };

  return (
    <PortalDataContext.Provider value={value}>
      {children}
    </PortalDataContext.Provider>
  );
}
