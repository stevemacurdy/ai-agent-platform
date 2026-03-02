import { NextRequest, NextResponse } from 'next/server'
import { getWarehouseData } from '@/lib/warehouse-data'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.headers.get('x-company-id') || 'demo'
    const view = req.nextUrl.searchParams.get('view') || 'dashboard'
    const data = await getWarehouseData(companyId)

    switch (view) {
      case 'dashboard':
        return NextResponse.json({
          source: data.source, provider: data.provider,
          summary: data.summary,
          recommendations: data.recommendations,
          topOrders: data.orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').sort((a,b) => b.totalValue - a.totalValue).slice(0, 5),
          lowStock: data.invAnalysis.lowStock.slice(0, 5),
        })
      case 'inventory': {
        const cat = req.nextUrl.searchParams.get('category')
        let items = data.inventory
        if (cat) items = items.filter(i => i.category.toLowerCase() === cat.toLowerCase())
        return NextResponse.json({ source: data.source, items, analysis: data.invAnalysis })
      }
      case 'orders': {
        const status = req.nextUrl.searchParams.get('status')
        let ords = data.orders
        if (status) ords = ords.filter(o => o.status === status)
        return NextResponse.json({ source: data.source, orders: ords, analysis: data.ordAnalysis })
      }
      case 'zones':
        return NextResponse.json({ source: data.source, zones: data.zones, analysis: data.zoneAnalysis })
      case 'fulfillment': {
        const open = data.orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
        const byPriority = { rush: open.filter(o => o.priority === 'rush'), express: open.filter(o => o.priority === 'express'), standard: open.filter(o => o.priority === 'standard') }
        return NextResponse.json({ source: data.source, queue: open, byPriority, analysis: data.ordAnalysis })
      }
      default:
        return NextResponse.json({ error: 'Unknown view. Use: dashboard, inventory, orders, zones, fulfillment' }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
