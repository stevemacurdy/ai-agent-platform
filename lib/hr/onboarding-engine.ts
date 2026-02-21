// ============================================================================
// MOBILE ONBOARDING ENGINE — Link generator, OCR, e-sign, photo capture
// ============================================================================

export interface OnboardingStep {
  id: string; label: string; description: string; type: 'form' | 'upload' | 'sign' | 'review'
  required: boolean; status: 'pending' | 'in_progress' | 'completed'
  completedAt?: string
}

export interface OnboardingConfig {
  steps: OnboardingStep[]
  companyName: string
  companyLogo?: string
  welcomeMessage: string
}

export const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'welcome', label: 'Welcome & Verify Email', description: 'Confirm your identity and review your offer details', type: 'review', required: true, status: 'pending' },
  { id: 'personal', label: 'Personal Information', description: 'Name, address, date of birth, SSN (encrypted)', type: 'form', required: true, status: 'pending' },
  { id: 'id_scan', label: 'ID Verification', description: 'Scan your Driver License or Passport — AI auto-fills your details', type: 'upload', required: true, status: 'pending' },
  { id: 'photo', label: 'Profile Photo', description: 'Take or upload a headshot for your employee directory', type: 'upload', required: true, status: 'pending' },
  { id: 'emergency', label: 'Emergency Contacts', description: 'Add at least one emergency contact', type: 'form', required: true, status: 'pending' },
  { id: 'banking', label: 'Direct Deposit', description: 'Bank routing and account number for payroll', type: 'form', required: true, status: 'pending' },
  { id: 'w4', label: 'W-4 Tax Withholding', description: 'Federal tax withholding elections', type: 'form', required: true, status: 'pending' },
  { id: 'i9', label: 'I-9 Employment Eligibility', description: 'Section 1 — employer completes Section 2 on Day 1', type: 'form', required: true, status: 'pending' },
  { id: 'handbook', label: 'Employee Handbook', description: 'Review and sign the company handbook', type: 'sign', required: true, status: 'pending' },
  { id: 'policies', label: 'Policy Acknowledgments', description: 'Safety policy, IT usage, anti-harassment', type: 'sign', required: true, status: 'pending' },
  { id: 'benefits', label: 'Benefits Election', description: 'Health, dental, vision, 401K enrollment (if eligible)', type: 'form', required: false, status: 'pending' },
  { id: 'complete', label: 'Onboarding Complete', description: 'All set — welcome to the team!', type: 'review', required: true, status: 'pending' },
]

/**
 * Generate a unique onboarding link
 */
export function generateOnboardingToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < 32; i++) token += chars[Math.floor(Math.random() * chars.length)]
  return token
}

/**
 * OCR ID Scanning — extracts data from driver license / passport image
 * In production: calls Google Vision API or AWS Textract
 */
export async function scanIdDocument(imageBase64: string): Promise<{
  firstName?: string; lastName?: string; dateOfBirth?: string
  address?: string; documentNumber?: string; expirationDate?: string
  documentType?: 'drivers_license' | 'passport'; confidence: number
}> {
  // Production: Google Vision API
  const visionKey = process.env.GOOGLE_VISION_API_KEY
  if (visionKey) {
    try {
      const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: [{ image: { content: imageBase64 }, features: [{ type: 'TEXT_DETECTION' }, { type: 'DOCUMENT_TEXT_DETECTION' }] }] }),
      })
      const data = await res.json()
      const text = data.responses?.[0]?.fullTextAnnotation?.text || ''
      return parseIdText(text)
    } catch {}
  }

  // Fallback: Claude Vision
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': anthropicKey, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 500,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: 'Extract from this ID document: firstName, lastName, dateOfBirth (YYYY-MM-DD), address, documentNumber, expirationDate, documentType (drivers_license or passport). Return ONLY valid JSON, no markdown.' }
          ] }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || '{}'
      const parsed = JSON.parse(text.replace(/```json|\n|```/g, '').trim())
      return { ...parsed, confidence: 0.85 }
    } catch {}
  }

  return { confidence: 0 }
}

function parseIdText(text: string): any {
  // Basic regex parsing for common ID formats
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  return {
    firstName: lines.find(l => /^[A-Z]{2,20}$/.test(l))?.toLowerCase().replace(/^./, c => c.toUpperCase()),
    confidence: 0.6,
  }
}

/**
 * Calculate onboarding progress
 */
export function calculateProgress(steps: OnboardingStep[]): number {
  const required = steps.filter(s => s.required)
  const completed = required.filter(s => s.status === 'completed')
  return Math.round((completed.length / required.length) * 100)
}
