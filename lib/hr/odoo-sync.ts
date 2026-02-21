// ============================================================================
// ODOO HR CONNECTOR — Sync employees, leave, and attendance
// ============================================================================
// Requires: ODOO_URL, ODOO_DB, ODOO_API_KEY env vars

export class OdooHRClient {
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
    if (data.error) throw new Error(data.error.message || 'Odoo RPC error')
    return data.result
  }

  private async auth(): Promise<number> {
    if (this.uid) return this.uid
    const r = await this.rpc('/web/session/authenticate', { db: this.db, login: 'api', password: this.apiKey })
    this.uid = r.uid; return this.uid!
  }

  async getEmployees(limit = 200) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.employee', method: 'search_read', args: [[]],
      kwargs: { fields: ['name', 'work_email', 'job_title', 'department_id', 'parent_id', 'work_phone', 'birthday', 'identification_id', 'company_id'], limit },
    })
  }

  async getLeaveRequests(state?: string) {
    await this.auth()
    const domain = state ? [['state', '=', state]] : []
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.leave', method: 'search_read', args: [domain],
      kwargs: { fields: ['employee_id', 'holiday_status_id', 'date_from', 'date_to', 'number_of_days', 'state', 'name'], limit: 100 },
    })
  }

  async getAttendance(employeeId?: number, days = 30) {
    await this.auth()
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
    const domain: any[] = [['check_in', '>=', since]]
    if (employeeId) domain.push(['employee_id', '=', employeeId])
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.attendance', method: 'search_read', args: [domain],
      kwargs: { fields: ['employee_id', 'check_in', 'check_out', 'worked_hours'], limit: 500 },
    })
  }

  async getDepartments() {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.department', method: 'search_read', args: [[]],
      kwargs: { fields: ['name', 'manager_id', 'member_ids', 'company_id'], limit: 50 },
    })
  }

  async approveLeave(leaveId: number) {
    await this.auth()
    return this.rpc('/web/dataset/call_kw', {
      model: 'hr.leave', method: 'action_approve', args: [[leaveId]], kwargs: {},
    })
  }
}

export function createOdooHRClient(): OdooHRClient | null {
  const url = process.env.ODOO_URL, db = process.env.ODOO_DB, key = process.env.ODOO_API_KEY
  if (!url || !db || !key) return null
  return new OdooHRClient(url, db, key)
}
