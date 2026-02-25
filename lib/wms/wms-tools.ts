// @ts-nocheck
// ============================================================================
// WMS TOOLS — Live warehouse data queries for the WMS AI agent
// ============================================================================
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Inventory ────────────────────────────────────────────────────────────────

export async function checkInventory(companyId: string, query: string) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('warehouse_inventory')
    .select('sku, product_name, qty_on_hand, qty_allocated, qty_available, unit_of_measure, location_code, lot_number, temperature_zone, weight_per_unit, warehouse_customers(customer_name)')
    .eq('company_id', companyId)
    .or(`sku.ilike.%${query}%,product_name.ilike.%${query}%,location_code.ilike.%${query}%`)
    .limit(20);

  if (error) return { error: error.message };
  return { items: data || [], count: data?.length || 0 };
}

export async function getInventorySummary(companyId: string) {
  const sb = getSupabase();
  const { data, count } = await sb
    .from('warehouse_inventory')
    .select('sku, qty_on_hand, qty_allocated, qty_available, temperature_zone', { count: 'exact' })
    .eq('company_id', companyId);

  const items = data || [];
  const totalOnHand = items.reduce((s, i) => s + (i.qty_on_hand || 0), 0);
  const totalAllocated = items.reduce((s, i) => s + (i.qty_allocated || 0), 0);
  const totalAvailable = items.reduce((s, i) => s + (i.qty_available || 0), 0);

  const byZone: Record<string, number> = {};
  items.forEach(i => {
    byZone[i.temperature_zone] = (byZone[i.temperature_zone] || 0) + (i.qty_on_hand || 0);
  });

  return {
    total_skus: count || 0,
    total_on_hand: totalOnHand,
    total_allocated: totalAllocated,
    total_available: totalAvailable,
    by_temperature_zone: byZone,
  };
}

export async function getLowStock(companyId: string, threshold: number = 10) {
  const sb = getSupabase();
  const { data } = await sb
    .from('warehouse_inventory')
    .select('sku, product_name, qty_available, qty_on_hand, unit_of_measure, warehouse_customers(customer_name)')
    .eq('company_id', companyId)
    .lte('qty_available', threshold)
    .order('qty_available', { ascending: true })
    .limit(20);

  return { low_stock_items: data || [], count: data?.length || 0, threshold };
}

export async function getZeroStock(companyId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from('warehouse_inventory')
    .select('sku, product_name, unit_of_measure, location_code, warehouse_customers(customer_name)')
    .eq('company_id', companyId)
    .eq('qty_available', 0)
    .limit(50);

  return { out_of_stock_items: data || [], count: data?.length || 0 };
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function lookupOrder(companyId: string, query: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from('warehouse_orders')
    .select('order_number, order_type, status, ship_to_name, ship_to_city, ship_to_state, carrier, requested_ship_date, actual_ship_date, tracking_number, po_number, total_items, total_weight, special_instructions, created_at, warehouse_customers(customer_name)')
    .eq('company_id', companyId)
    .or(`order_number.ilike.%${query}%,ship_to_name.ilike.%${query}%,po_number.ilike.%${query}%,tracking_number.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(10);

  return { orders: data || [], count: data?.length || 0 };
}

export async function getOrderSummary(companyId: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from('warehouse_orders')
    .select('status, order_type')
    .eq('company_id', companyId);

  const orders = data || [];
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  orders.forEach(o => {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    byType[o.order_type] = (byType[o.order_type] || 0) + 1;
  });

  return { total_orders: orders.length, by_status: byStatus, by_type: byType };
}

export async function getRecentOrders(companyId: string, limit: number = 10) {
  const sb = getSupabase();
  const { data } = await sb
    .from('warehouse_orders')
    .select('order_number, status, ship_to_name, carrier, requested_ship_date, total_items, total_weight, po_number, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { orders: data || [] };
}

export async function getOrdersByStatus(companyId: string, status: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from('warehouse_orders')
    .select('order_number, ship_to_name, carrier, requested_ship_date, total_items, created_at, warehouse_customers(customer_name)')
    .eq('company_id', companyId)
    .eq('status', status)
    .order('requested_ship_date', { ascending: true })
    .limit(25);

  return { orders: data || [], status, count: data?.length || 0 };
}

// ── Bills of Lading ──────────────────────────────────────────────────────────

export async function lookupBol(companyId: string, query: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from('bills_of_lading')
    .select('bol_number, status, consignee_name, consignee_address, carrier_name, carrier_scac, pro_number, ship_date, total_pieces, total_weight, total_pallets, freight_charge_terms, seal_number, trailer_number')
    .eq('company_id', companyId)
    .or(`bol_number.ilike.%${query}%,consignee_name.ilike.%${query}%,pro_number.ilike.%${query}%,carrier_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(10);

  return { bols: data || [], count: data?.length || 0 };
}

// ── Customers ────────────────────────────────────────────────────────────────

export async function lookupCustomer(companyId: string, query: string) {
  const sb = getSupabase();
  const { data } = await sb
    .from('warehouse_customers')
    .select('customer_name, customer_code, contact_name, contact_email, contact_phone, city, state, is_active, order_email')
    .eq('company_id', companyId)
    .or(`customer_name.ilike.%${query}%,customer_code.ilike.%${query}%,contact_name.ilike.%${query}%`)
    .limit(10);

  return { customers: data || [], count: data?.length || 0 };
}

export async function getCustomerInventory(companyId: string, customerCode: string) {
  const sb = getSupabase();

  // Get customer ID
  const { data: cust } = await sb
    .from('warehouse_customers')
    .select('id, customer_name')
    .eq('company_id', companyId)
    .eq('customer_code', customerCode)
    .single();

  if (!cust) return { error: `Customer ${customerCode} not found` };

  const { data: inventory } = await sb
    .from('warehouse_inventory')
    .select('sku, product_name, qty_on_hand, qty_allocated, qty_available, unit_of_measure, location_code, temperature_zone')
    .eq('company_id', companyId)
    .eq('customer_id', cust.id)
    .order('sku');

  return { customer: cust.customer_name, items: inventory || [], count: inventory?.length || 0 };
}

// ── Tool Definitions for OpenAI function calling ─────────────────────────────

export const WMS_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'check_inventory',
      description: 'Search inventory by SKU, product name, or location code',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'SKU, product name, or location to search for' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_inventory_summary',
      description: 'Get overall inventory statistics: total SKUs, quantities on hand/allocated/available, breakdown by temperature zone',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_low_stock',
      description: 'Find items with low available quantity. Use when asked about reorder needs, stock alerts, or items running low.',
      parameters: {
        type: 'object',
        properties: { threshold: { type: 'number', description: 'Maximum available quantity to consider low (default: 10)' } },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_zero_stock',
      description: 'Find items that are completely out of stock (zero available)',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'lookup_order',
      description: 'Search orders by order number, ship-to name, PO number, or tracking number',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Order number, ship-to name, PO #, or tracking # to search' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_order_summary',
      description: 'Get order statistics: total count, breakdown by status and type',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_recent_orders',
      description: 'Get the most recent orders',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'How many orders to return (default: 10)' } },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_orders_by_status',
      description: 'Get orders filtered by a specific status (draft, submitted, confirmed, picking, packed, shipped, delivered, cancelled)',
      parameters: {
        type: 'object',
        properties: { status: { type: 'string', description: 'Order status to filter by' } },
        required: ['status'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'lookup_bol',
      description: 'Search bills of lading by BOL number, consignee name, PRO number, or carrier',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'BOL number, consignee, PRO #, or carrier to search' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'lookup_customer',
      description: 'Search customers by name, code, or contact name',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Customer name, code, or contact to search' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_customer_inventory',
      description: 'Get all inventory for a specific customer by their customer code',
      parameters: {
        type: 'object',
        properties: { customer_code: { type: 'string', description: 'Customer code (e.g. CUST001)' } },
        required: ['customer_code'],
      },
    },
  },
];

// ── Tool Executor ────────────────────────────────────────────────────────────

export async function executeTool(name: string, args: Record<string, any>, companyId: string): Promise<any> {
  switch (name) {
    case 'check_inventory':
      return checkInventory(companyId, args.query);
    case 'get_inventory_summary':
      return getInventorySummary(companyId);
    case 'get_low_stock':
      return getLowStock(companyId, args.threshold || 10);
    case 'get_zero_stock':
      return getZeroStock(companyId);
    case 'lookup_order':
      return lookupOrder(companyId, args.query);
    case 'get_order_summary':
      return getOrderSummary(companyId);
    case 'get_recent_orders':
      return getRecentOrders(companyId, args.limit || 10);
    case 'get_orders_by_status':
      return getOrdersByStatus(companyId, args.status);
    case 'lookup_bol':
      return lookupBol(companyId, args.query);
    case 'lookup_customer':
      return lookupCustomer(companyId, args.query);
    case 'get_customer_inventory':
      return getCustomerInventory(companyId, args.customer_code);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
