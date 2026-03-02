import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface WarehouseConnection { id: string; provider: string; category: string }
interface InventoryItem { id: string; sku: string; name: string; category: string; qty: number; reorderPoint: number; location: string; unitCost: number; lastReceived: string }
interface Order { id: string; orderNumber: string; customer: string; status: 'pending'|'picking'|'packing'|'shipped'|'delivered'|'cancelled'; items: number; totalValue: number; createdAt: string; shippedAt: string|null; carrier: string|null; priority: 'standard'|'express'|'rush' }
interface Zone { id: string; name: string; type: string; capacity: number; utilization: number; temperature: string; items: number }

async function getWMSConnection(companyId: string): Promise<WarehouseConnection|null> {
  try {
    const sb = createClient(supabaseUrl, supabaseKey)
    const { data } = await sb.from('integration_connections').select('id, provider, category').eq('company_id', companyId).eq('category', 'storage').eq('is_active', true).limit(1).single()
    return data as WarehouseConnection|null
  } catch { return null }
}

function getDemoInventory(): InventoryItem[] {
  return [
    { id:'inv-1',sku:'WH-RACK-48',name:'48" Pallet Rack Beam',category:'Racking',qty:342,reorderPoint:100,location:'A-01-01',unitCost:45,lastReceived:'2026-02-20' },
    { id:'inv-2',sku:'WH-CONV-10',name:'10ft Conveyor Section',category:'Conveyors',qty:28,reorderPoint:10,location:'B-03-02',unitCost:1250,lastReceived:'2026-02-15' },
    { id:'inv-3',sku:'WH-PICK-MOD',name:'Pick Module Assembly',category:'Pick Systems',qty:12,reorderPoint:5,location:'C-01-01',unitCost:8500,lastReceived:'2026-01-28' },
    { id:'inv-4',sku:'WH-SORT-DV',name:'Divert Sorter Unit',category:'Sortation',qty:8,reorderPoint:3,location:'D-02-01',unitCost:15000,lastReceived:'2026-02-10' },
    { id:'inv-5',sku:'WH-BOLT-M12',name:'M12 Anchor Bolt Pack (50)',category:'Hardware',qty:1850,reorderPoint:500,location:'E-01-03',unitCost:28.5,lastReceived:'2026-02-25' },
    { id:'inv-6',sku:'WH-WIRE-DK',name:'Wire Deck 42x46',category:'Racking',qty:520,reorderPoint:200,location:'A-02-01',unitCost:32,lastReceived:'2026-02-22' },
    { id:'inv-7',sku:'WH-MZZN-PNL',name:'Mezzanine Floor Panel',category:'Mezzanines',qty:64,reorderPoint:20,location:'F-01-01',unitCost:425,lastReceived:'2026-02-08' },
    { id:'inv-8',sku:'WH-LABEL-RF',name:'RF Label Printer Ribbon',category:'Supplies',qty:45,reorderPoint:50,location:'E-02-01',unitCost:18,lastReceived:'2026-02-18' },
    { id:'inv-9',sku:'WH-UPRIGHT-12',name:'12ft Pallet Rack Upright',category:'Racking',qty:186,reorderPoint:75,location:'A-01-03',unitCost:89,lastReceived:'2026-02-19' },
    { id:'inv-10',sku:'WH-GUARD-48',name:'48" Column Guard',category:'Safety',qty:92,reorderPoint:30,location:'E-03-01',unitCost:55,lastReceived:'2026-02-24' },
    { id:'inv-11',sku:'WH-VNA-TRK',name:'VNA Truck Guide Rail (10ft)',category:'VNA Systems',qty:18,reorderPoint:8,location:'G-01-01',unitCost:320,lastReceived:'2026-01-30' },
    { id:'inv-12',sku:'WH-DOCK-LVL',name:'Hydraulic Dock Leveler',category:'Dock Equipment',qty:4,reorderPoint:2,location:'H-01-01',unitCost:6800,lastReceived:'2026-02-05' },
  ]
}

function getDemoOrders(): Order[] {
  return [
    { id:'ord-1',orderNumber:'WO-2026-0847',customer:'Cabelas Distribution',status:'picking',items:48,totalValue:24500,createdAt:'2026-02-28',shippedAt:null,carrier:null,priority:'express' },
    { id:'ord-2',orderNumber:'WO-2026-0848',customer:'Sportsmans WH - Midvale',status:'pending',items:120,totalValue:68000,createdAt:'2026-03-01',shippedAt:null,carrier:null,priority:'standard' },
    { id:'ord-3',orderNumber:'WO-2026-0843',customer:'Frito-Lay Frankfort',status:'shipped',items:32,totalValue:41200,createdAt:'2026-02-24',shippedAt:'2026-02-27',carrier:'FedEx Freight',priority:'standard' },
    { id:'ord-4',orderNumber:'WO-2026-0844',customer:'Amazon SLC3',status:'shipped',items:85,totalValue:112000,createdAt:'2026-02-25',shippedAt:'2026-02-28',carrier:'XPO Logistics',priority:'rush' },
    { id:'ord-5',orderNumber:'WO-2026-0845',customer:'US Military - Hill AFB',status:'packing',items:200,totalValue:185000,createdAt:'2026-02-26',shippedAt:null,carrier:null,priority:'rush' },
    { id:'ord-6',orderNumber:'WO-2026-0846',customer:'Target DC West',status:'picking',items:64,totalValue:35600,createdAt:'2026-02-27',shippedAt:null,carrier:null,priority:'express' },
    { id:'ord-7',orderNumber:'WO-2026-0841',customer:'Home Depot Region 5',status:'delivered',items:40,totalValue:52800,createdAt:'2026-02-20',shippedAt:'2026-02-23',carrier:'Estes Express',priority:'standard' },
    { id:'ord-8',orderNumber:'WO-2026-0842',customer:'Sysco Foods Denver',status:'delivered',items:55,totalValue:73500,createdAt:'2026-02-22',shippedAt:'2026-02-25',carrier:'Old Dominion',priority:'standard' },
    { id:'ord-9',orderNumber:'WO-2026-0849',customer:'Walmart DC #6045',status:'pending',items:150,totalValue:95000,createdAt:'2026-03-01',shippedAt:null,carrier:null,priority:'express' },
    { id:'ord-10',orderNumber:'WO-2026-0840',customer:'Costco Depot SLC',status:'delivered',items:72,totalValue:89400,createdAt:'2026-02-18',shippedAt:'2026-02-21',carrier:'SAIA',priority:'standard' },
  ]
}

function getDemoZones(): Zone[] {
  return [
    { id:'z-1',name:'Receiving Dock',type:'Inbound',capacity:20,utilization:75,temperature:'Ambient',items:340 },
    { id:'z-2',name:'Bulk Storage A',type:'Storage',capacity:500,utilization:82,temperature:'Ambient',items:2450 },
    { id:'z-3',name:'Bulk Storage B',type:'Storage',capacity:500,utilization:68,temperature:'Ambient',items:1890 },
    { id:'z-4',name:'Pick Module',type:'Picking',capacity:200,utilization:91,temperature:'Ambient',items:1200 },
    { id:'z-5',name:'Cold Storage',type:'Storage',capacity:100,utilization:45,temperature:'34-38F',items:320 },
    { id:'z-6',name:'Shipping Dock',type:'Outbound',capacity:15,utilization:60,temperature:'Ambient',items:180 },
    { id:'z-7',name:'Mezzanine Level',type:'Storage',capacity:300,utilization:55,temperature:'Ambient',items:980 },
    { id:'z-8',name:'Returns Processing',type:'Processing',capacity:50,utilization:38,temperature:'Ambient',items:145 },
  ]
}

function analyzeInventory(items: InventoryItem[]) {
  const totalItems = items.reduce((s,i) => s+i.qty, 0)
  const totalValue = items.reduce((s,i) => s+i.qty*i.unitCost, 0)
  const lowStock = items.filter(i => i.qty <= i.reorderPoint)
  const categories = [...new Set(items.map(i => i.category))]
  const byCategory = categories.map(cat => {
    const ci = items.filter(i => i.category === cat)
    return { category: cat, count: ci.length, totalQty: ci.reduce((s,i) => s+i.qty, 0), totalValue: ci.reduce((s,i) => s+i.qty*i.unitCost, 0) }
  }).sort((a,b) => b.totalValue - a.totalValue)
  return { totalItems, totalValue, totalSKUs: items.length, lowStock, lowStockCount: lowStock.length, byCategory }
}

function analyzeOrders(orders: Order[]) {
  const open = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const shipped = orders.filter(o => o.status==='shipped'||o.status==='delivered')
  const totalOpenValue = open.reduce((s,o) => s+o.totalValue, 0)
  const totalShippedValue = shipped.reduce((s,o) => s+o.totalValue, 0)
  const rushOrders = open.filter(o => o.priority==='rush')
  const expressOrders = open.filter(o => o.priority==='express')
  const byStatus: Record<string,{count:number;value:number}> = {}
  const avgOrderValue = orders.length>0 ? Math.round(orders.reduce((s,o)=>s+o.totalValue,0)/orders.length) : 0
  return { openOrders:open.length, openValue:totalOpenValue, shippedValue:totalShippedValue, rushOrders:rushOrders.length, expressOrders:expressOrders.length, byStatus, avgOrderValue, totalOrders:orders.length }
}

function analyzeZones(zones: Zone[]) {
  const avgUtilization = Math.round(zones.reduce((s,z)=>s+z.utilization,0)/zones.length)
  const highUtil = zones.filter(z=>z.utilization>=85)
  const lowUtil = zones.filter(z=>z.utilization<40)
  return { avgUtilization, highUtilZones:highUtil, lowUtilZones:lowUtil, totalCapacity:zones.reduce((s,z)=>s+z.capacity,0), totalItems:zones.reduce((s,z)=>s+z.items,0), zoneCount:zones.length }
}

function generateRecommendations(inv: ReturnType<typeof analyzeInventory>, ord: ReturnType<typeof analyzeOrders>, zones: ReturnType<typeof analyzeZones>): string[] {
  const recs: string[] = []
  if(inv.lowStockCount>0) recs.push(inv.lowStockCount+' SKU(s) at or below reorder point. Review and trigger POs to avoid stockouts.')
  if(ord.rushOrders>0) recs.push(ord.rushOrders+' rush order(s) in queue. Prioritize picking to meet expedited SLAs.')
  if(zones.highUtilZones.length>0) recs.push(zones.highUtilZones.map(z=>z.name).join(', ')+' running above 85% capacity. Consider redistributing to underutilized zones.')
  if(zones.lowUtilZones.length>0) recs.push(zones.lowUtilZones.map(z=>z.name).join(', ')+' below 40% utilization. Opportunity to consolidate or repurpose space.')
  if(ord.openOrders>5) recs.push(ord.openOrders+' open orders totaling $'+ord.openValue.toLocaleString()+'. Monitor pick/pack throughput for on-time shipping.')
  if(inv.totalValue>500000) recs.push('Inventory carrying cost significant at $'+Math.round(inv.totalValue).toLocaleString()+'. Review slow-moving SKUs for markdown.')
  if(recs.length===0) recs.push('Operations running smoothly. All metrics within normal range.')
  return recs
}

export async function getWarehouseData(companyId: string) {
  const conn = await getWMSConnection(companyId)
  const inventory = getDemoInventory()
  const orders = getDemoOrders()
  const zones = getDemoZones()
  const invAnalysis = analyzeInventory(inventory)
  const ordAnalysis = analyzeOrders(orders)
  const zoneAnalysis = analyzeZones(zones)
  const recommendations = generateRecommendations(invAnalysis, ordAnalysis, zoneAnalysis)
  return {
    source: conn ? 'live' : 'demo', provider: conn?.provider || 'demo',
    inventory, orders, zones, invAnalysis, ordAnalysis, zoneAnalysis, recommendations,
    summary: { totalSKUs:invAnalysis.totalSKUs, totalItems:invAnalysis.totalItems, inventoryValue:Math.round(invAnalysis.totalValue), lowStockAlerts:invAnalysis.lowStockCount, openOrders:ordAnalysis.openOrders, openOrderValue:ordAnalysis.openValue, avgUtilization:zoneAnalysis.avgUtilization, rushOrders:ordAnalysis.rushOrders }
  }
}
