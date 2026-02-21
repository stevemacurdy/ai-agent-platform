// ============================================================================
// ODOO INVENTORY CONNECTOR — Real-time stock sync from Odoo ERP
// ============================================================================
// Requires: ODOO_URL, ODOO_DB, ODOO_API_KEY env vars

interface OdooProduct {
  id: number
  default_code: string   // SKU
  name: string
  qty_available: number
  virtual_available: number
  uom_id: [number, string]
  categ_id: [number, string]
  standard_price: number
  weight: number
}

interface OdooPurchaseOrder {
  id: number
  name: string           // PO number
  partner_id: [number, string]
  date_planned: string
  state: string          // draft | purchase | done | cancel
  order_line: {
    product_id: [number, string]
    product_qty: number
    qty_received: number
    price_unit: number
  }[]
}

interface OdooSaleOrder {
  id: number
  name: string           // SO number
  partner_id: [number, string]
  commitment_date: string
  state: string          // draft | sale | done | cancel
  order_line: {
    product_id: [number, string]
    product_uom_qty: number
    qty_delivered: number
    price_unit: number
  }[]
}

export class OdooInventoryClient {
  private url: string
  private db: string
  private apiKey: string
  private uid: number | null = null

  constructor(url: string, db: string, apiKey: string) {
    this.url = url.replace(/\/$/, '')
    this.db = db
    this.apiKey = apiKey
  }

  private async rpc(endpoint: string, params: any): Promise<any> {
    const res = await fetch(this.url + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message || 'Odoo RPC error')
    return data.result
  }

  private async authenticate(): Promise<number> {
    if (this.uid) return this.uid
    const result = await this.rpc('/web/session/authenticate', {
      db: this.db, login: 'api', password: this.apiKey,
    })
    this.uid = result.uid
    return this.uid!
  }

  /**
   * Get all products with stock levels
   */
  async getProducts(limit: number = 500): Promise<OdooProduct[]> {
    await this.authenticate()
    return this.rpc('/web/dataset/call_kw', {
      model: 'product.product',
      method: 'search_read',
      args: [[['type', '=', 'product']]],
      kwargs: {
        fields: ['default_code', 'name', 'qty_available', 'virtual_available', 'uom_id', 'categ_id', 'standard_price', 'weight'],
        limit,
      },
    })
  }

  /**
   * Get pending Purchase Orders (Inbound)
   */
  async getPendingPurchaseOrders(): Promise<OdooPurchaseOrder[]> {
    await this.authenticate()
    return this.rpc('/web/dataset/call_kw', {
      model: 'purchase.order',
      method: 'search_read',
      args: [[['state', 'in', ['purchase', 'draft']]]],
      kwargs: {
        fields: ['name', 'partner_id', 'date_planned', 'state', 'order_line'],
        limit: 50,
      },
    })
  }

  /**
   * Get pending Sales Orders (Outbound)
   */
  async getPendingSalesOrders(): Promise<OdooSaleOrder[]> {
    await this.authenticate()
    return this.rpc('/web/dataset/call_kw', {
      model: 'sale.order',
      method: 'search_read',
      args: [[['state', 'in', ['sale', 'draft']]]],
      kwargs: {
        fields: ['name', 'partner_id', 'commitment_date', 'state', 'order_line'],
        limit: 50,
      },
    })
  }

  /**
   * Get stock movements (picking operations)
   */
  async getStockMovements(days: number = 30): Promise<any[]> {
    await this.authenticate()
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
    return this.rpc('/web/dataset/call_kw', {
      model: 'stock.move',
      method: 'search_read',
      args: [[['date', '>=', since]]],
      kwargs: {
        fields: ['product_id', 'product_uom_qty', 'state', 'location_id', 'location_dest_id', 'date', 'picking_id'],
        limit: 200,
      },
    })
  }

  /**
   * Update stock quantity (inventory adjustment)
   */
  async adjustStock(productId: number, locationId: number, newQty: number): Promise<boolean> {
    await this.authenticate()
    try {
      await this.rpc('/web/dataset/call_kw', {
        model: 'stock.quant',
        method: 'create',
        args: [{ product_id: productId, location_id: locationId, inventory_quantity: newQty }],
        kwargs: {},
      })
      return true
    } catch { return false }
  }
}

export function createOdooInventoryClient(): OdooInventoryClient | null {
  const url = process.env.ODOO_URL
  const db = process.env.ODOO_DB
  const key = process.env.ODOO_API_KEY
  if (!url || !db || !key) return null
  return new OdooInventoryClient(url, db, key)
}
