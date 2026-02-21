// ============================================================================
// PAYROLL & BENEFITS — ADP/Gusto + Checkr background checks
// ============================================================================

// --- ADP PAYROLL ---
export class ADPClient {
  private clientId: string; private clientSecret: string

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId; this.clientSecret = clientSecret
  }

  async getWorkers(): Promise<any[]> {
    const token = await this.getToken()
    const res = await fetch('https://api.adp.com/hr/v2/workers', {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    return data.workers || []
  }

  async getPayStatements(workerId: string): Promise<any[]> {
    const token = await this.getToken()
    const res = await fetch(`https://api.adp.com/payroll/v1/workers/${workerId}/pay-statements`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const data = await res.json()
    return data.payStatements || []
  }

  private async getToken(): Promise<string> {
    const res = await fetch('https://accounts.adp.com/auth/oauth/v2/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`,
    })
    const data = await res.json()
    return data.access_token
  }
}

// --- GUSTO PAYROLL ---
export class GustoClient {
  private accessToken: string

  constructor(accessToken: string) { this.accessToken = accessToken }

  async getEmployees(companyId: string): Promise<any[]> {
    const res = await fetch(`https://api.gusto.com/v1/companies/${companyId}/employees`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    })
    return res.json()
  }

  async getPayrolls(companyId: string): Promise<any[]> {
    const res = await fetch(`https://api.gusto.com/v1/companies/${companyId}/payrolls`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    })
    return res.json()
  }
}

// --- CHECKR BACKGROUND CHECKS ---
export class CheckrClient {
  private apiKey: string

  constructor(apiKey: string) { this.apiKey = apiKey }

  async createCandidate(data: { firstName: string; lastName: string; email: string; dob?: string; ssn?: string }): Promise<{ id: string }> {
    const res = await fetch('https://api.checkr.com/v1/candidates', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${btoa(this.apiKey + ':')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: data.firstName, last_name: data.lastName, email: data.email, dob: data.dob, ssn: data.ssn }),
    })
    return res.json()
  }

  async createInvitation(candidateId: string, packageSlug: string = 'tasker_standard'): Promise<{ id: string; invitation_url: string }> {
    const res = await fetch('https://api.checkr.com/v1/invitations', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${btoa(this.apiKey + ':')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, package: packageSlug }),
    })
    return res.json()
  }

  async getReport(reportId: string): Promise<any> {
    const res = await fetch(`https://api.checkr.com/v1/reports/${reportId}`, {
      headers: { 'Authorization': `Basic ${btoa(this.apiKey + ':')}` },
    })
    return res.json()
  }
}

export function createADPClient(): ADPClient | null {
  const id = process.env.ADP_CLIENT_ID, secret = process.env.ADP_CLIENT_SECRET
  if (!id || !secret) return null
  return new ADPClient(id, secret)
}
export function createGustoClient(): GustoClient | null {
  const token = process.env.GUSTO_ACCESS_TOKEN
  if (!token) return null
  return new GustoClient(token)
}
export function createCheckrClient(): CheckrClient | null {
  const key = process.env.CHECKR_API_KEY
  if (!key) return null
  return new CheckrClient(key)
}
