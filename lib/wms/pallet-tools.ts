// @ts-nocheck
// ============================================================================
// WMS PALLET TOOLS — Pallet tracking, packing lists, COA queries
// ============================================================================
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function searchPallets(companyId, query) {
  const sb = getSupabase();
  const { data } = await sb.from('warehouse_pallets')
    .select('pallet_number, product_name, product_form, lot_number, manufacturer, expiration_date, received_date, case_qty, case_weight, pallet_weight, pallet_weight_confirmed, status, direction, sku')
    .eq('company_id', companyId)
    .or(`pallet_number.ilike.%${query}%,product_name.ilike.%${query}%,lot_number.ilike.%${query}%,manufacturer.ilike.%${query}%,sku.ilike.%${query}%`)
    .order('created_at', { ascending: false }).limit(20);
  return { pallets: data || [], count: data?.length || 0 };
}

export async function getPalletSummary(companyId) {
  const sb = getSupabase();
  const { data } = await sb.from('warehouse_pallets').select('status, direction, pallet_weight_confirmed, product_name').eq('company_id', companyId);
  const pallets = data || [];
  const byStatus = {}, byProduct = {}, byDirection = { inbound: 0, outbound: 0 };
  let needsWeighing = 0;
  pallets.forEach(p => {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    byProduct[p.product_name] = (byProduct[p.product_name] || 0) + 1;
    byDirection[p.direction] = (byDirection[p.direction] || 0) + 1;
    if (!p.pallet_weight_confirmed) needsWeighing++;
  });
  return { total_pallets: pallets.length, by_status: byStatus, by_product: byProduct, by_direction: byDirection, needs_weighing: needsWeighing };
}

export async function getPalletsNeedingWeight(companyId) {
  const sb = getSupabase();
  const { data } = await sb.from('warehouse_pallets')
    .select('pallet_number, product_name, product_form, lot_number, case_qty, received_date')
    .eq('company_id', companyId).eq('pallet_weight_confirmed', false)
    .order('received_date', { ascending: true }).limit(50);
  return { pallets: data || [], count: data?.length || 0 };
}

export async function getExpiringPallets(companyId, daysAhead = 30) {
  const sb = getSupabase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);
  const { data } = await sb.from('warehouse_pallets')
    .select('pallet_number, product_name, product_form, lot_number, manufacturer, expiration_date, status')
    .eq('company_id', companyId).lte('expiration_date', cutoff.toISOString().split('T')[0]).not('expiration_date', 'is', null)
    .order('expiration_date', { ascending: true }).limit(30);
  return { pallets: data || [], count: data?.length || 0, days_ahead: daysAhead };
}

export async function lookupCOA(companyId, query) {
  const sb = getSupabase();
  const { data } = await sb.from('certificates_of_analysis')
    .select('coa_number, lot_number, manufacturer, expiration_date, sku, file_name, created_at')
    .eq('company_id', companyId)
    .or(`coa_number.ilike.%${query}%,lot_number.ilike.%${query}%,manufacturer.ilike.%${query}%,sku.ilike.%${query}%`)
    .order('created_at', { ascending: false }).limit(10);
  return { coas: data || [], count: data?.length || 0 };
}

export async function lookupPackingList(companyId, query) {
  const sb = getSupabase();
  const { data } = await sb.from('packing_lists')
    .select('packing_list_number, direction, file_name, created_at, packing_list_items(product_name, product_form, lot_number, case_qty, case_weight)')
    .eq('company_id', companyId)
    .or(`packing_list_number.ilike.%${query}%`)
    .order('created_at', { ascending: false }).limit(10);
  return { packing_lists: data || [], count: data?.length || 0 };
}

// ── Tool Definitions ─────────────────────────────────────────────────────

export const PALLET_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_pallets',
      description: 'Search pallets by pallet number, product name, lot number, manufacturer, or SKU',
      parameters: { type: 'object', properties: { query: { type: 'string', description: 'Search term' } }, required: ['query'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pallet_summary',
      description: 'Get pallet statistics: total count, breakdown by status/product/direction, pallets needing weighing',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pallets_needing_weight',
      description: 'Find pallets that have been received but not yet weighed',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_expiring_pallets',
      description: 'Find pallets expiring within a specified number of days',
      parameters: { type: 'object', properties: { days_ahead: { type: 'number', description: 'Days from now to check (default: 30)' } } },
    },
  },
  {
    type: 'function',
    function: {
      name: 'lookup_coa',
      description: 'Search certificates of analysis by COA number, lot number, manufacturer, or SKU',
      parameters: { type: 'object', properties: { query: { type: 'string', description: 'Search term' } }, required: ['query'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'lookup_packing_list',
      description: 'Search packing lists by packing list number',
      parameters: { type: 'object', properties: { query: { type: 'string', description: 'Packing list number' } }, required: ['query'] },
    },
  },
];

export async function executePalletTool(name, args, companyId) {
  switch (name) {
    case 'search_pallets': return searchPallets(companyId, args.query);
    case 'get_pallet_summary': return getPalletSummary(companyId);
    case 'get_pallets_needing_weight': return getPalletsNeedingWeight(companyId);
    case 'get_expiring_pallets': return getExpiringPallets(companyId, args.days_ahead || 30);
    case 'lookup_coa': return lookupCOA(companyId, args.query);
    case 'lookup_packing_list': return lookupPackingList(companyId, args.query);
    default: return { error: `Unknown pallet tool: ${name}` };
  }
}
