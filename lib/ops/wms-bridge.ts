// ============================================================================
// WMS-OPS BRIDGE — Material requisition from warehouse to job site
// ============================================================================

export interface MaterialRequisition {
  id: string
  projectId: string
  projectNumber: string
  workOrderId?: string
  requestedBy: string
  status: 'draft' | 'submitted' | 'approved' | 'picking' | 'shipped' | 'delivered'
  items: RequisitionLine[]
  deliveryAddress: string
  needByDate: string
  priority: 'urgent' | 'high' | 'normal'
  createdAt: string
}

export interface RequisitionLine {
  sku: string
  name: string
  qtyRequested: number
  qtyAvailable: number    // from WMS
  qtyAllocated: number
  binLocation?: string    // from WMS
  unitCost: number
  lineTotal: number
  status: 'pending' | 'available' | 'partial' | 'unavailable'
}

/**
 * Check WMS inventory for requested materials
 */
export async function checkAvailability(companyId: string, items: { sku: string; qty: number }[]): Promise<RequisitionLine[]> {
  try {
    const res = await fetch(`/api/agents/wms?companyId=${companyId}`)
    const data = await res.json()
    const inventory = data.data?.inventory || []

    return items.map(item => {
      const invItem = inventory.find((i: any) => i.sku === item.sku)
      const available = invItem?.available || 0
      return {
        sku: item.sku,
        name: invItem?.name || item.sku,
        qtyRequested: item.qty,
        qtyAvailable: available,
        qtyAllocated: Math.min(item.qty, available),
        binLocation: invItem ? `${invItem.zone}-${invItem.aisle}-${invItem.bin.split('-').pop()}` : undefined,
        unitCost: invItem?.unitCost || 0,
        lineTotal: Math.min(item.qty, available) * (invItem?.unitCost || 0),
        status: available >= item.qty ? 'available' : available > 0 ? 'partial' : 'unavailable',
      }
    })
  } catch {
    return items.map(i => ({ sku: i.sku, name: i.sku, qtyRequested: i.qty, qtyAvailable: 0, qtyAllocated: 0, unitCost: 0, lineTotal: 0, status: 'unavailable' as const }))
  }
}

/**
 * Submit requisition to WMS for picking
 */
export async function submitRequisition(companyId: string, req: MaterialRequisition): Promise<{ success: boolean; pickWaveId?: string }> {
  try {
    const res = await fetch('/api/agents/wms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_requisition',
        companyId,
        projectId: req.projectId,
        items: req.items.filter(i => i.qtyAllocated > 0).map(i => ({ sku: i.sku, qty: i.qtyAllocated })),
        deliveryAddress: req.deliveryAddress,
        priority: req.priority,
      }),
    })
    const data = await res.json()
    return { success: data.success, pickWaveId: data.pickWaveId }
  } catch {
    return { success: false }
  }
}

/**
 * Sync HR safety certifications for field crews
 */
export async function checkCrewCertifications(companyId: string, crewNames: string[]): Promise<{ name: string; certs: { name: string; status: string; expires: string }[] }[]> {
  try {
    const res = await fetch(`/api/agents/hr?companyId=${companyId}`)
    const data = await res.json()
    const employees = data.data?.employees || []
    return crewNames.map(name => {
      const emp = employees.find((e: any) => e.name === name)
      return { name, certs: emp?.certs || [] }
    })
  } catch {
    return crewNames.map(n => ({ name: n, certs: [] }))
  }
}
