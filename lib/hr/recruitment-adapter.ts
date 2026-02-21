// ============================================================================
// RECRUITMENT — Job boards + E-signature
// ============================================================================

// --- INDEED ---
export class IndeedClient {
  private employerId: string; private apiKey: string

  constructor(employerId: string, apiKey: string) {
    this.employerId = employerId; this.apiKey = apiKey
  }

  async postJob(job: { title: string; description: string; location: string; salary?: string; type: string }): Promise<{ success: boolean; jobKey?: string }> {
    const res = await fetch('https://apis.indeed.com/v2/jobs', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'Indeed-Employer-ID': this.employerId },
      body: JSON.stringify({ title: job.title, description: job.description, location: { city: job.location }, compensation: job.salary ? { range: { min: job.salary } } : undefined, employmentType: job.type }),
    })
    const data = await res.json()
    return { success: res.ok, jobKey: data.jobKey }
  }
}

// --- LINKEDIN JOBS ---
export class LinkedInJobsClient {
  private accessToken: string; private orgId: string

  constructor(accessToken: string, orgId: string) {
    this.accessToken = accessToken; this.orgId = orgId
  }

  async postJob(job: { title: string; description: string; location: string }): Promise<{ success: boolean; postId?: string }> {
    const res = await fetch('https://api.linkedin.com/v2/simpleJobPostings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify({
        integrationContext: `urn:li:organization:${this.orgId}`,
        jobPostingOperationType: 'CREATE',
        title: job.title, description: { text: job.description },
        location: job.location, listedAt: Date.now(),
      }),
    })
    return { success: res.ok, postId: res.ok ? 'posted' : undefined }
  }
}

// --- DOCUSIGN E-SIGNATURE ---
export class DocuSignClient {
  private accessToken: string; private accountId: string

  constructor(accessToken: string, accountId: string) {
    this.accessToken = accessToken; this.accountId = accountId
  }

  async sendEnvelope(params: { signerEmail: string; signerName: string; documentBase64: string; documentName: string; subject: string }): Promise<{ envelopeId?: string; success: boolean }> {
    const res = await fetch(`https://demo.docusign.net/restapi/v2.1/accounts/${this.accountId}/envelopes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailSubject: params.subject,
        documents: [{ documentBase64: params.documentBase64, name: params.documentName, fileExtension: 'pdf', documentId: '1' }],
        recipients: { signers: [{ email: params.signerEmail, name: params.signerName, recipientId: '1', routingOrder: '1', tabs: { signHereTabs: [{ xPosition: '200', yPosition: '700', documentId: '1', pageNumber: '1' }] } }] },
        status: 'sent',
      }),
    })
    const data = await res.json()
    return { success: res.ok, envelopeId: data.envelopeId }
  }
}

export function createIndeedClient(): IndeedClient | null {
  const id = process.env.INDEED_EMPLOYER_ID, key = process.env.INDEED_API_KEY
  if (!id || !key) return null; return new IndeedClient(id, key)
}
export function createDocuSignClient(): DocuSignClient | null {
  const token = process.env.DOCUSIGN_ACCESS_TOKEN, acct = process.env.DOCUSIGN_ACCOUNT_ID
  if (!token || !acct) return null; return new DocuSignClient(token, acct)
}
