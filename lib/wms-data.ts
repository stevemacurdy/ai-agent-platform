// ─── WMS Agent Data Layer ─────────────────────────────────
// Warehouse management metrics: throughput, pick rates,
// storage utilization, order accuracy, and labor efficiency.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getWMSConnection(companyId: string): Promise<string | null> {
  try {
    const sb = supabaseAdmin();
    const { data } = await (sb as any)
      .from('integration_connections')
      .select('connection_id')
      .eq('company_id', companyId)
      .eq('category', 'wms')
      .eq('status', 'active')
      .single();
    return data?.connection_id || null;
  } catch { return null; }
}

// ─── Types ──────────────────────────────────────────────

export interface ZoneMetric {
  id: string;
  name: string;
  type: 'pick' | 'bulk' | 'cold' | 'staging' | 'receiving' | 'shipping';
  totalSlots: number;
  usedSlots: number;
  utilization: number;
  temperature?: number;
  activeWorkers: number;
  ordersInProgress: number;
  throughputPerHour: number;
  status: 'optimal' | 'busy' | 'congested' | 'idle';
}

export interface OrderMetric {
  period: string;
  ordersReceived: number;
  ordersShipped: number;
  ordersPending: number;
  avgFulfillmentHours: number;
  onTimeRate: number;
  accuracyRate: number;
  returnRate: number;
}

export interface LaborMetric {
  id: string;
  name: string;
  role: string;
  zone: string;
  picksPerHour: number;
  accuracy: number;
  hoursWorked: number;
  efficiency: number;
  status: 'active' | 'break' | 'off-shift';
}

export interface AlertItem {
  id: string;
  type: 'capacity' | 'delay' | 'error' | 'maintenance' | 'safety';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  zone: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface WMSData {
  source: 'live' | 'demo';
  provider?: string;
  zones: ZoneMetric[];
  orders: OrderMetric[];
  labor: LaborMetric[];
  alerts: AlertItem[];
  summary: {
    totalOrders: number;
    ordersShippedToday: number;
    ordersPending: number;
    overallUtilization: number;
    avgPickRate: number;
    orderAccuracy: number;
    onTimeShipRate: number;
    activeWorkers: number;
    throughputPerHour: number;
    alertCount: number;
  };
  recommendations: string[];
}

// ─── Main data fetcher ──────────────────────────────────

export async function getWMSData(companyId: string): Promise<WMSData> {
  const connId = await getWMSConnection(companyId);
  if (connId) { /* Future: live WMS data */ }
  return getDemoWMS();
}

function getDemoWMS(): WMSData {
  const zones: ZoneMetric[] = [
    { id: 'z-1', name: 'Pick Zone A', type: 'pick', totalSlots: 2400, usedSlots: 2040, utilization: 85, activeWorkers: 6, ordersInProgress: 34, throughputPerHour: 145, status: 'busy' },
    { id: 'z-2', name: 'Pick Zone B', type: 'pick', totalSlots: 1800, usedSlots: 1260, utilization: 70, activeWorkers: 4, ordersInProgress: 22, throughputPerHour: 98, status: 'optimal' },
    { id: 'z-3', name: 'Bulk Storage', type: 'bulk', totalSlots: 800, usedSlots: 720, utilization: 90, activeWorkers: 2, ordersInProgress: 5, throughputPerHour: 28, status: 'congested' },
    { id: 'z-4', name: 'Cold Storage', type: 'cold', totalSlots: 400, usedSlots: 340, utilization: 85, temperature: 36, activeWorkers: 2, ordersInProgress: 8, throughputPerHour: 35, status: 'busy' },
    { id: 'z-5', name: 'Receiving Dock', type: 'receiving', totalSlots: 12, usedSlots: 4, utilization: 33, activeWorkers: 3, ordersInProgress: 4, throughputPerHour: 22, status: 'optimal' },
    { id: 'z-6', name: 'Shipping Dock', type: 'shipping', totalSlots: 16, usedSlots: 10, utilization: 63, activeWorkers: 5, ordersInProgress: 18, throughputPerHour: 52, status: 'busy' },
    { id: 'z-7', name: 'Staging Area', type: 'staging', totalSlots: 200, usedSlots: 165, utilization: 83, activeWorkers: 2, ordersInProgress: 12, throughputPerHour: 40, status: 'busy' },
  ];

  const orders: OrderMetric[] = [
    { period: 'Today', ordersReceived: 142, ordersShipped: 98, ordersPending: 44, avgFulfillmentHours: 4.2, onTimeRate: 94, accuracyRate: 99.2, returnRate: 1.1 },
    { period: 'Yesterday', ordersReceived: 156, ordersShipped: 152, ordersPending: 4, avgFulfillmentHours: 3.8, onTimeRate: 96, accuracyRate: 99.5, returnRate: 0.8 },
    { period: 'This Week', ordersReceived: 580, ordersShipped: 512, ordersPending: 68, avgFulfillmentHours: 4.0, onTimeRate: 95, accuracyRate: 99.3, returnRate: 1.0 },
    { period: 'Last Week', ordersReceived: 620, ordersShipped: 618, ordersPending: 2, avgFulfillmentHours: 3.6, onTimeRate: 97, accuracyRate: 99.6, returnRate: 0.7 },
    { period: 'This Month', ordersReceived: 1840, ordersShipped: 1720, ordersPending: 120, avgFulfillmentHours: 3.9, onTimeRate: 95.5, accuracyRate: 99.4, returnRate: 0.9 },
  ];

  const labor: LaborMetric[] = [
    { id: 'w-1', name: 'Mike Torres', role: 'Picker', zone: 'Pick Zone A', picksPerHour: 42, accuracy: 99.5, hoursWorked: 6.5, efficiency: 105, status: 'active' },
    { id: 'w-2', name: 'Sarah Chen', role: 'Picker', zone: 'Pick Zone A', picksPerHour: 38, accuracy: 99.8, hoursWorked: 6.5, efficiency: 95, status: 'active' },
    { id: 'w-3', name: 'Jake Williams', role: 'Picker', zone: 'Pick Zone B', picksPerHour: 35, accuracy: 98.9, hoursWorked: 6.5, efficiency: 88, status: 'active' },
    { id: 'w-4', name: 'Ana Rodriguez', role: 'Packer', zone: 'Shipping Dock', picksPerHour: 0, accuracy: 99.7, hoursWorked: 6.5, efficiency: 102, status: 'active' },
    { id: 'w-5', name: 'Tom Bradley', role: 'Receiver', zone: 'Receiving Dock', picksPerHour: 0, accuracy: 99.1, hoursWorked: 4.0, efficiency: 92, status: 'break' },
    { id: 'w-6', name: 'Lisa Park', role: 'Forklift', zone: 'Bulk Storage', picksPerHour: 0, accuracy: 100, hoursWorked: 6.5, efficiency: 98, status: 'active' },
    { id: 'w-7', name: 'Carlos Mendez', role: 'Picker', zone: 'Cold Storage', picksPerHour: 30, accuracy: 99.2, hoursWorked: 5.0, efficiency: 90, status: 'active' },
  ];

  const alerts: AlertItem[] = [
    { id: 'a-1', type: 'capacity', severity: 'warning', message: 'Bulk Storage at 90% capacity — redirect inbound to overflow area', zone: 'Bulk Storage', timestamp: '2026-03-02T14:30:00Z', acknowledged: false },
    { id: 'a-2', type: 'delay', severity: 'critical', message: '44 orders pending fulfillment — 12 at risk of missing SLA', zone: 'Pick Zone A', timestamp: '2026-03-02T15:00:00Z', acknowledged: false },
    { id: 'a-3', type: 'maintenance', severity: 'info', message: 'Conveyor C-3 scheduled maintenance tomorrow 6am-8am', zone: 'Shipping Dock', timestamp: '2026-03-02T10:00:00Z', acknowledged: true },
    { id: 'a-4', type: 'error', severity: 'warning', message: 'Barcode scanner B-7 intermittent failures — 3 misscans today', zone: 'Pick Zone B', timestamp: '2026-03-02T13:15:00Z', acknowledged: false },
    { id: 'a-5', type: 'safety', severity: 'info', message: 'Cold storage temp stable at 36°F — within spec', zone: 'Cold Storage', timestamp: '2026-03-02T12:00:00Z', acknowledged: true },
  ];

  const activeWorkers = labor.filter(l => l.status === 'active').length;
  const avgPickRate = Math.round(labor.filter(l => l.picksPerHour > 0).reduce((s, l) => s + l.picksPerHour, 0) / labor.filter(l => l.picksPerHour > 0).length);

  return {
    source: 'demo',
    zones,
    orders,
    labor,
    alerts,
    summary: {
      totalOrders: 142,
      ordersShippedToday: 98,
      ordersPending: 44,
      overallUtilization: Math.round(zones.reduce((s, z) => s + z.utilization, 0) / zones.length),
      avgPickRate,
      orderAccuracy: 99.2,
      onTimeShipRate: 94,
      activeWorkers,
      throughputPerHour: zones.reduce((s, z) => s + z.throughputPerHour, 0),
      alertCount: alerts.filter(a => !a.acknowledged).length,
    },
    recommendations: [
      '12 orders at risk of missing SLA — reassign 2 pickers from Zone B to Zone A immediately',
      'Bulk storage at 90% — schedule putaway optimization and move slow-movers to overflow',
      'Jake Williams picking below target (88% efficiency) — review pick path and provide coaching',
      'Barcode scanner B-7 needs replacement — intermittent failures causing rework',
      'Consider staggering shift starts to smooth throughput across the day',
    ],
  };
}
