// ============================================================================
// 3PL CUSTOMER PORTAL SYNC — Shares shipment status with Organization Leads
// ============================================================================

export interface ShipmentStatus {
  id: string; orderId: string; customerName: string; companyId: string
  status: 'processing' | 'picking' | 'packed' | 'shipped' | 'delivered'
  carrier?: string; trackingNumber?: string; estimatedDelivery?: string
  items: { sku: string; name: string; qty: number; picked: number }[]
  createdAt: string; updatedAt: string
}

/**
 * Push shipment status to 3PL portal for Org Lead visibility
 */
export async function syncShipmentTo3PL(shipment: ShipmentStatus): Promise<boolean> {
  try {
    // In production: POST to 3PL portal API
    const portalUrl = process.env.TPL_PORTAL_URL || '/api/3pl/shipments'
    const res = await fetch(portalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.TPL_API_KEY || '' },
      body: JSON.stringify(shipment),
    })
    return res.ok
  } catch { return false }
}

/**
 * Get all shipments visible to an Org Lead
 */
export async function getOrgLeadShipments(companyId: string): Promise<ShipmentStatus[]> {
  try {
    const portalUrl = process.env.TPL_PORTAL_URL || '/api/3pl/shipments'
    const res = await fetch(`${portalUrl}?companyId=${companyId}`)
    const data = await res.json()
    return data.shipments || []
  } catch { return [] }
}

/**
 * Generate shipment notification for Org Lead
 */
export function formatShipmentNotification(s: ShipmentStatus): string {
  const itemList = s.items.map(i => `  - ${i.name} (x${i.qty})`).join('\n')
  return `Order ${s.orderId} — ${s.status.toUpperCase()}
Carrier: ${s.carrier || 'Pending'}
Tracking: ${s.trackingNumber || 'Generating...'}
ETA: ${s.estimatedDelivery || 'TBD'}
Items:
${itemList}`
}
