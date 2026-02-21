const ODOO_URL = process.env.ODOO_URL || '';
const ODOO_DB = process.env.ODOO_DB || '';
const ODOO_LOGIN = process.env.ODOO_LOGIN || '';
const ODOO_API_KEY = process.env.ODOO_API_KEY || '';

class OdooClient {
  private uid: number | null = null;

  private escapeXml(str: string): string {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private valueToXml(value: any): string {
    if (value === null || value === undefined) return '<value><boolean>0</boolean></value>';
    if (typeof value === 'boolean') return `<value><boolean>${value ? 1 : 0}</boolean></value>`;
    if (typeof value === 'number') {
      return Number.isInteger(value) ? `<value><int>${value}</int></value>` : `<value><double>${value}</double></value>`;
    }
    if (typeof value === 'string') return `<value><string>${this.escapeXml(value)}</string></value>`;
    if (Array.isArray(value)) {
      return `<value><array><data>${value.map(v => this.valueToXml(v)).join('')}</data></array></value>`;
    }
    if (typeof value === 'object') {
      const members = Object.entries(value).map(([k, v]) => `<member><name>${this.escapeXml(k)}</name>${this.valueToXml(v)}</member>`).join('');
      return `<value><struct>${members}</struct></value>`;
    }
    return `<value><string>${this.escapeXml(String(value))}</string></value>`;
  }

  private async xmlRpc(endpoint: string, method: string, params: any[]): Promise<any> {
    const paramsXml = params.map(p => `<param>${this.valueToXml(p)}</param>`).join('');
    const body = `<?xml version="1.0"?><methodCall><methodName>${method}</methodName><params>${paramsXml}</params></methodCall>`;
    const res = await fetch(`${ODOO_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'text/xml' }, body });
    const text = await res.text();
    if (text.includes('<fault>')) {
      const msg = text.match(/<string>([^<]*)<\/string>/)?.[1] || 'Odoo error';
      throw new Error(msg);
    }
    return this.parseResponse(text);
  }

  private parseResponse(xml: string): any {
    if (/<value>\s*<boolean>0<\/boolean>\s*<\/value>/.test(xml) && !xml.includes('<array>')) return false;
    const intMatch = xml.match(/<value>\s*<int>(\d+)<\/int>\s*<\/value>/);
    if (intMatch && !xml.includes('<array>')) return parseInt(intMatch[1], 10);
    if (xml.includes('<array>')) return this.parseArray(xml);
    return null;
  }

  private parseArray(xml: string): any[] {
    const results: any[] = [];
    const structRegex = /<struct>([\s\S]*?)<\/struct>/g;
    let match;
    while ((match = structRegex.exec(xml)) !== null) {
      const obj: any = {};
      const memberRegex = /<member>\s*<name>([^<]+)<\/name>\s*<value>([\s\S]*?)<\/value>\s*<\/member>/g;
      let m;
      while ((m = memberRegex.exec(match[1])) !== null) {
        obj[m[1]] = this.parseValue(m[2]);
      }
      if (Object.keys(obj).length > 0) results.push(obj);
    }
    return results;
  }

  private parseValue(xml: string): any {
    const intMatch = xml.match(/<int>(-?\d+)<\/int>/);
    if (intMatch) return parseInt(intMatch[1], 10);
    const boolMatch = xml.match(/<boolean>([01])<\/boolean>/);
    if (boolMatch) return boolMatch[1] === '1';
    const doubleMatch = xml.match(/<double>([\d.-]+)<\/double>/);
    if (doubleMatch) return parseFloat(doubleMatch[1]);
    const stringMatch = xml.match(/<string>([^<]*)<\/string>/);
    if (stringMatch) return stringMatch[1];
    if (xml.includes('<array>')) {
      const vals: any[] = [];
      const valRegex = /<value>\s*(?:<int>(\d+)<\/int>|<string>([^<]*)<\/string>)\s*<\/value>/g;
      let m;
      while ((m = valRegex.exec(xml)) !== null) vals.push(m[1] ? parseInt(m[1], 10) : m[2]);
      return vals.length > 0 ? vals : null;
    }
    return null;
  }

  async authenticate(): Promise<number> {
    if (this.uid) return this.uid;
    const uid = await this.xmlRpc('/xmlrpc/2/common', 'authenticate', [ODOO_DB, ODOO_LOGIN, ODOO_API_KEY, {}]);
    if (!uid) throw new Error('Odoo authentication failed');
    this.uid = uid;
    return uid;
  }

  async searchRead(model: string, domain: any[] = [], fields: string[] = [], limit = 100): Promise<any[]> {
    await this.authenticate();
    const result = await this.xmlRpc('/xmlrpc/2/object', 'execute_kw', [ODOO_DB, this.uid, ODOO_API_KEY, model, 'search_read', [domain], { fields, limit }]);
    return Array.isArray(result) ? result : [];
  }

  async getDashboard(): Promise<any> {
    const [ar, ap] = await Promise.all([
      this.searchRead('account.move', [['move_type', '=', 'out_invoice'], ['payment_state', '!=', 'paid'], ['state', '=', 'posted']], ['name', 'partner_id', 'amount_total', 'amount_residual', 'invoice_date_due']),
      this.searchRead('account.move', [['move_type', '=', 'in_invoice'], ['payment_state', '!=', 'paid'], ['state', '=', 'posted']], ['name', 'partner_id', 'amount_total', 'amount_residual', 'invoice_date_due']),
    ]);
    const today = new Date().toISOString().split('T')[0];
    const totalAR = ar.reduce((s, i) => s + (i.amount_residual || 0), 0);
    const totalAP = ap.reduce((s, i) => s + (i.amount_residual || 0), 0);
    const overdueAR = ar.filter(i => i.invoice_date_due && i.invoice_date_due < today).reduce((s, i) => s + (i.amount_residual || 0), 0);
    const overdueAP = ap.filter(i => i.invoice_date_due && i.invoice_date_due < today).reduce((s, i) => s + (i.amount_residual || 0), 0);
    return { accountsReceivable: { total: totalAR, count: ar.length, overdue: overdueAR }, accountsPayable: { total: totalAP, count: ap.length, overdue: overdueAP }, netPosition: totalAR - totalAP };
  }

  async getInvoices(status: 'all' | 'unpaid' | 'overdue' = 'unpaid'): Promise<any[]> {
    let domain: any[] = [['move_type', '=', 'out_invoice'], ['state', '=', 'posted']];
    if (status === 'unpaid') domain.push(['payment_state', '!=', 'paid']);
    else if (status === 'overdue') { domain.push(['payment_state', '!=', 'paid'], ['invoice_date_due', '<', new Date().toISOString().split('T')[0]]); }
    return this.searchRead('account.move', domain, ['name', 'partner_id', 'amount_total', 'amount_residual', 'invoice_date', 'invoice_date_due', 'payment_state']);
  }

  async getBills(status: 'all' | 'unpaid' | 'overdue' = 'unpaid'): Promise<any[]> {
    let domain: any[] = [['move_type', '=', 'in_invoice'], ['state', '=', 'posted']];
    if (status === 'unpaid') domain.push(['payment_state', '!=', 'paid']);
    else if (status === 'overdue') { domain.push(['payment_state', '!=', 'paid'], ['invoice_date_due', '<', new Date().toISOString().split('T')[0]]); }
    return this.searchRead('account.move', domain, ['name', 'partner_id', 'ref', 'amount_total', 'amount_residual', 'invoice_date', 'invoice_date_due', 'payment_state']);
  }

  async getAgingReport(): Promise<any> {
    const invoices = await this.getInvoices('unpaid');
    const today = new Date();
    const aging = { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0 };
    for (const inv of invoices) {
      if (!inv.invoice_date_due) continue;
      const days = Math.floor((today.getTime() - new Date(inv.invoice_date_due).getTime()) / 86400000);
      const amt = inv.amount_residual || 0;
      if (days <= 0) aging.current += amt;
      else if (days <= 30) aging.days1to30 += amt;
      else if (days <= 60) aging.days31to60 += amt;
      else if (days <= 90) aging.days61to90 += amt;
      else aging.over90 += amt;
    }
    return aging;
  }

  async getCustomers(): Promise<any[]> { return this.searchRead('res.partner', [['customer_rank', '>', 0]], ['name', 'email', 'phone']); }
  async getVendors(): Promise<any[]> { return this.searchRead('res.partner', [['supplier_rank', '>', 0]], ['name', 'email', 'phone']); }
  async getRecentPayments(): Promise<any[]> { return this.searchRead('account.payment', [['state', '=', 'posted']], ['name', 'partner_id', 'amount', 'date', 'payment_type'], 20); }

  // ============================================================================
  // WRITE-BACK METHODS
  // ============================================================================

  async write(model: string, ids: number[], values: Record<string, any>): Promise<boolean> {
    await this.authenticate();
    const result = await this.xmlRpc('/xmlrpc/2/object', 'execute_kw', [
      ODOO_DB, this.uid, ODOO_API_KEY, model, 'write', [ids, values]
    ]);
    return result !== false;
  }

  async create(model: string, values: Record<string, any>): Promise<number> {
    await this.authenticate();
    const result = await this.xmlRpc('/xmlrpc/2/object', 'execute_kw', [
      ODOO_DB, this.uid, ODOO_API_KEY, model, 'create', [values]
    ]);
    return result;
  }

  async updateInvoice(invoiceId: number, values: Record<string, any>): Promise<boolean> {
    // Only allow updating specific safe fields
    const allowed = ['ref', 'narration', 'invoice_date_due'];
    const safe: Record<string, any> = {};
    for (const [k, v] of Object.entries(values)) {
      if (allowed.includes(k)) safe[k] = v;
    }
    if (Object.keys(safe).length === 0) throw new Error('No valid fields to update');
    return this.write('account.move', [invoiceId], safe);
  }

  async updateContact(partnerId: number, values: Record<string, any>): Promise<boolean> {
    const allowed = ['name', 'email', 'phone', 'street', 'city', 'zip', 'website', 'comment'];
    const safe: Record<string, any> = {};
    for (const [k, v] of Object.entries(values)) {
      if (allowed.includes(k)) safe[k] = v;
    }
    if (Object.keys(safe).length === 0) throw new Error('No valid fields to update');
    return this.write('res.partner', [partnerId], safe);
  }

  async createInvoice(partnerId: number, lines: { name: string; quantity: number; price_unit: number }[]): Promise<number> {
    const invoiceLines = lines.map(l => [0, 0, { name: l.name, quantity: l.quantity, price_unit: l.price_unit }]);
    return this.create('account.move', {
      move_type: 'out_invoice',
      partner_id: partnerId,
      invoice_line_ids: invoiceLines,
    });
  }

  async getPartnerDetail(partnerId: number): Promise<any> {
    const results = await this.searchRead('res.partner', [['id', '=', partnerId]], [
      'name', 'email', 'phone', 'street', 'street2', 'city', 'state_id', 'zip',
      'country_id', 'website', 'comment', 'customer_rank', 'supplier_rank',
      'credit', 'debit', 'total_invoiced'
    ], 1);
    return results[0] || null;
  }

  async getInvoiceLines(invoiceId: number): Promise<any[]> {
    return this.searchRead('account.move.line', [
      ['move_id', '=', invoiceId], ['display_type', '=', 'product']
    ], ['name', 'quantity', 'price_unit', 'price_subtotal', 'product_id'], 50);
  }
}

let odooClient: OdooClient | null = null;
export function getOdooClient(): OdooClient { if (!odooClient) odooClient = new OdooClient(); return odooClient; }
export { OdooClient };
