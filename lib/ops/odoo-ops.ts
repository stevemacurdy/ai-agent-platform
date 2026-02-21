// ============================================================================
// ODOO PROJECT / MANUFACTURING CONNECTOR
// ============================================================================
// Syncs project stages, work orders, BOMs from Odoo ERP
// Requires: ODOO_URL, ODOO_DB, ODOO_API_KEY env vars

export class OdooOpsClient {
  private url: string; private db: string; private apiKey: string; private uid: number | null = null

  constructor(url: string, db: string, apiKey: string) {
    this.url = url.replace(/\/$/, ''); this.db = db; this.apiKey = apiKey
  }

  private async rpc(endpoint: string, params: any): Promise<any> {
    const res = await fetch(this.url + endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return data.result
  }

  private async auth(): Promise<number> {
    if (this.uid) return this.uid
    const r = await this.rpc('/web/session/authenticate', { db: this.db, login: 'api', password: this.apiKey })
    this.uid = r.uid; return this.uid!
  }

  /** Get all active projects */
  async getProjects(status?: string) {
    await this.auth()
    const domain: any[] = status ? [['stage_id.name', '=', status]] : []
    return this.rpc('/web/dataset/call_kw', {
      model: 'project.project', method: 'search_read', args: [domain],
      kwargs: { fields: ['name', 'partner_id', 'user_id', 'stage_id', 'date_start', 'date', 'task_count', 'company_id'], limit: 100 },
    })
  }

  /** Get tasks/work orders for a project */
  async getProjectTasks(projectId: number) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'project.task', method: 'search_read',
      args: [[['project_id', '=', projectId]]],
      kwargs: { fields: ['name', 'stage_id', 'user_ids', 'date_deadline', 'planned_hours', 'effective_hours', 'priority', 'description'], limit: 200 },
    })
  }

  /** Get Manufacturing Orders (BOMs being produced) */
  async getManufacturingOrders(state?: string) {
    await this.auth()
    const domain: any[] = state ? [['state', '=', state]] : [['state', 'in', ['confirmed', 'progress', 'to_close']]]
    return this.rpc('/web/dataset/call_kw', {
      model: 'mrp.production', method: 'search_read', args: [domain],
      kwargs: { fields: ['name', 'product_id', 'product_qty', 'state', 'date_start', 'date_finished', 'bom_id', 'move_raw_ids'], limit: 100 },
    })
  }

  /** Get BOM components for a manufacturing order */
  async getBomComponents(bomId: number) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'mrp.bom.line', method: 'search_read',
      args: [[['bom_id', '=', bomId]]],
      kwargs: { fields: ['product_id', 'product_qty', 'product_uom_id'], limit: 100 },
    })
  }

  /** Update project stage */
  async updateProjectStage(projectId: number, stageId: number) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'project.project', method: 'write',
      args: [[projectId], { stage_id: stageId }], kwargs: {},
    })
  }
}

export function createOdooOpsClient(): OdooOpsClient | null {
  const url = process.env.ODOO_URL, db = process.env.ODOO_DB, key = process.env.ODOO_API_KEY
  if (!url || !db || !key) return null
  return new OdooOpsClient(url, db, key)
}
