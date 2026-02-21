// ============================================================================
// FIELD SERVICE — GPS check-in, document management, RFIs
// ============================================================================

export interface SiteCheckIn {
  employeeId: string
  employeeName: string
  projectId: string
  timestamp: string
  latitude: number
  longitude: number
  accuracy: number        // meters
  type: 'check_in' | 'check_out'
  photoUrl?: string
}

export interface ProjectDocument {
  id: string
  projectId: string
  type: 'drawing' | 'spec' | 'rfi' | 'change_order' | 'submittal' | 'photo' | 'permit' | 'safety_plan'
  title: string
  version: string
  uploadedBy: string
  uploadedAt: string
  fileUrl: string
  fileSize: number
  status: 'current' | 'superseded' | 'pending_review' | 'approved' | 'rejected'
  reviewedBy?: string
  notes?: string
}

export interface RFI {
  id: string
  projectId: string
  rfiNumber: string       // RFI-001
  subject: string
  question: string
  requestedBy: string
  assignedTo: string
  status: 'open' | 'answered' | 'closed'
  priority: 'urgent' | 'normal'
  dueDate: string
  answer?: string
  answeredBy?: string
  answeredDate?: string
  impact?: string          // schedule | cost | both | none
  createdAt: string
}

export interface ChangeOrder {
  id: string
  projectId: string
  coNumber: string        // CO-001
  title: string
  description: string
  requestedBy: string     // client or internal
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  costImpact: number      // + or -
  scheduleImpact: number  // days + or -
  createdAt: string
  approvedAt?: string
}

/**
 * Validate GPS check-in is within project site geofence
 */
export function validateGeofence(
  checkIn: { lat: number; lng: number },
  siteCenter: { lat: number; lng: number },
  radiusMeters: number = 500
): boolean {
  const R = 6371000 // earth radius meters
  const dLat = (siteCenter.lat - checkIn.lat) * Math.PI / 180
  const dLng = (siteCenter.lng - checkIn.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(checkIn.lat * Math.PI / 180) * Math.cos(siteCenter.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return d <= radiusMeters
}

/**
 * Generate daily field report template
 */
export function generateReportTemplate(projectNumber: string, date: string): any {
  return {
    projectNumber, reportDate: date, submittedBy: '', weather: 'clear', temperature: null,
    crewsOnSite: 0, hoursWorked: 0, workPerformed: '',
    materialsUsed: [], delaysEncountered: '', delayCause: null, delayHours: 0,
    safetyObservations: '', incidentReported: false, photos: [], completionPctUpdate: null, notes: '',
  }
}
