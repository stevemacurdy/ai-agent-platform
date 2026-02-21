// ============================================================================
// SHIPPING & BARCODE ADAPTERS — UPS/FedEx + Zebra/Scandit
// ============================================================================

// --- SHIPPING RATE SHOPPING ---
interface ShipmentRequest {
  fromZip: string; toZip: string
  weight: number; dimensions: { l: number; w: number; h: number }
  service?: string
}

interface ShipRate {
  carrier: string; service: string; rate: number
  transitDays: number; guaranteed: boolean
}

export class UPSClient {
  private clientId: string; private clientSecret: string

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId; this.clientSecret = clientSecret
  }

  async getRates(req: ShipmentRequest): Promise<ShipRate[]> {
    // UPS OAuth2 token
    const authRes = await fetch('https://onlinetools.ups.com/security/v1/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret) },
      body: 'grant_type=client_credentials',
    })
    const { access_token } = await authRes.json()

    const res = await fetch('https://onlinetools.ups.com/api/rating/v2205/Rate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json', 'transId': Date.now().toString(), 'transactionSrc': 'woulfai' },
      body: JSON.stringify({
        RateRequest: {
          Shipment: {
            Shipper: { Address: { PostalCode: req.fromZip, CountryCode: 'US' } },
            ShipTo: { Address: { PostalCode: req.toZip, CountryCode: 'US' } },
            Package: {
              PackagingType: { Code: '02' },
              PackageWeight: { UnitOfMeasurement: { Code: 'LBS' }, Weight: String(req.weight) },
              Dimensions: { UnitOfMeasurement: { Code: 'IN' }, Length: String(req.dimensions.l), Width: String(req.dimensions.w), Height: String(req.dimensions.h) },
            }
          }
        }
      })
    })
    const data = await res.json()
    return (data.RateResponse?.RatedShipment || []).map((r: any) => ({
      carrier: 'UPS', service: r.Service?.Code || '', rate: parseFloat(r.TotalCharges?.MonetaryValue || 0),
      transitDays: parseInt(r.GuaranteedDelivery?.BusinessDaysInTransit || '5'), guaranteed: !!r.GuaranteedDelivery,
    }))
  }
}

export class FedExClient {
  private apiKey: string; private secretKey: string

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey; this.secretKey = secretKey
  }

  async getRates(req: ShipmentRequest): Promise<ShipRate[]> {
    const authRes = await fetch('https://apis.fedex.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`,
    })
    const { access_token } = await authRes.json()

    const res = await fetch('https://apis.fedex.com/rate/v1/rates/quotes', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountNumber: { value: process.env.FEDEX_ACCOUNT },
        requestedShipment: {
          shipper: { address: { postalCode: req.fromZip, countryCode: 'US' } },
          recipient: { address: { postalCode: req.toZip, countryCode: 'US' } },
          requestedPackageLineItems: [{
            weight: { value: req.weight, units: 'LB' },
            dimensions: { length: req.dimensions.l, width: req.dimensions.w, height: req.dimensions.h, units: 'IN' },
          }]
        }
      })
    })
    const data = await res.json()
    return (data.output?.rateReplyDetails || []).map((r: any) => ({
      carrier: 'FedEx', service: r.serviceType || '', rate: r.ratedShipmentDetails?.[0]?.totalNetCharge || 0,
      transitDays: r.commit?.dateDetail?.dayCount || 5, guaranteed: r.commit?.guaranteedDelivery || false,
    }))
  }
}

/**
 * Rate shop across all carriers
 */
export async function shopRates(req: ShipmentRequest): Promise<ShipRate[]> {
  const rates: ShipRate[] = []
  const ups = process.env.UPS_CLIENT_ID ? new UPSClient(process.env.UPS_CLIENT_ID, process.env.UPS_CLIENT_SECRET || '') : null
  const fedex = process.env.FEDEX_API_KEY ? new FedExClient(process.env.FEDEX_API_KEY, process.env.FEDEX_SECRET_KEY || '') : null

  const promises: Promise<ShipRate[]>[] = []
  if (ups) promises.push(ups.getRates(req).catch(() => []))
  if (fedex) promises.push(fedex.getRates(req).catch(() => []))

  const results = await Promise.all(promises)
  results.forEach(r => rates.push(...r))
  return rates.sort((a, b) => a.rate - b.rate)
}

// --- BARCODE SCANNING INTERFACE ---
// Compatible with Zebra DataWedge and Scandit SDK
export interface ScanEvent {
  barcode: string; format: 'CODE128' | 'QR' | 'EAN13' | 'UPC_A' | 'DATAMATRIX'
  timestamp: string; deviceId?: string; source: 'zebra' | 'scandit' | 'camera'
}

export function parseScanEvent(raw: any): ScanEvent {
  // Zebra DataWedge format
  if (raw.com?.symbol?.zebra) {
    return { barcode: raw.com.symbol.zebra.data, format: raw.com.symbol.zebra.labelType || 'CODE128', timestamp: new Date().toISOString(), deviceId: raw.deviceId, source: 'zebra' }
  }
  // Scandit format
  if (raw.symbology) {
    return { barcode: raw.data, format: raw.symbology, timestamp: new Date().toISOString(), source: 'scandit' }
  }
  // Generic camera scan
  return { barcode: String(raw.barcode || raw.data || raw), format: 'CODE128', timestamp: new Date().toISOString(), source: 'camera' }
}
