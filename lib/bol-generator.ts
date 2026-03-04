// ============================================================================
// BOL Generator — DOT Compliant Bill of Lading
// ============================================================================

import type { OrderLineItem, ProductType } from './3pl-portal-data';

export interface BillOfLading {
  bolNumber: string;
  date: string;
  shipperName: string;
  shipperAddress: string;
  shipperCity: string;
  shipperState: string;
  shipperZip: string;
  shipperPhone: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeState: string;
  consigneeZip: string;
  thirdPartyName?: string;
  thirdPartyAddress?: string;
  carrierName: string;
  trailerNumber?: string;
  sealNumber?: string;
  scacCode?: string;
  proNumber?: string;
  items: BOLLineItem[];
  totalHandlingUnits: number;
  totalPackages: number;
  totalWeight: number;
  shipperSignature?: string;
  carrierSignature?: string;
  codAmount?: number;
  declaredValue?: number;
  specialInstructions?: string;
}

export interface BOLLineItem {
  handlingUnitQty: number;
  handlingUnitType: string;
  packageQty: number;
  packageType: string;
  weight: number;
  hazmat: boolean;
  description: string;
  nmfcNumber?: string;
  freightClass: string;
  said: string;
}

const FREIGHT_CLASS_MAP: Record<ProductType, { min: number; max: number; baseClass: string }> = {
  powder:     { min: 60, max: 85, baseClass: '70' },
  cube:       { min: 70, max: 100, baseClass: '85' },
  whole:      { min: 85, max: 125, baseClass: '92.5' },
  liquid:     { min: 55, max: 77.5, baseClass: '65' },
  hazmat:     { min: 55, max: 500, baseClass: '77.5' },
  perishable: { min: 85, max: 150, baseClass: '100' },
};

const VALID_CLASSES = ['50', '55', '60', '65', '70', '77.5', '85', '92.5', '100', '110', '125', '150', '175', '200', '250', '300', '400', '500'];

export function calculateFreightClass(productType: ProductType, weightPerUnit: number): string {
  const range = FREIGHT_CLASS_MAP[productType];
  // Density-based adjustment: heavier per-unit = lower class (denser = cheaper)
  const density = weightPerUnit;
  let classNum: number;

  if (density > 10) {
    classNum = range.min;
  } else if (density > 5) {
    classNum = (range.min + Number(range.baseClass)) / 2;
  } else if (density > 1) {
    classNum = Number(range.baseClass);
  } else {
    classNum = range.max;
  }

  // Find nearest valid class
  let best = VALID_CLASSES[0];
  let bestDist = Math.abs(classNum - Number(best));
  for (const c of VALID_CLASSES) {
    const dist = Math.abs(classNum - Number(c));
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}

function getHandlingUnitType(unitType: string): string {
  switch (unitType) {
    case 'pallet': return 'PLT';
    case 'case': case 'box': return 'CTN';
    case 'bag': return 'BAG';
    case 'gallon': return 'DRM';
    default: return 'CTN';
  }
}

function getPackageType(unitType: string): string {
  switch (unitType) {
    case 'pallet': return 'Pallets';
    case 'case': return 'Cases';
    case 'box': return 'Boxes';
    case 'bag': return 'Bags';
    case 'gallon': return 'Drums';
    default: return 'Packages';
  }
}

export function generateBOL(params: {
  bolNumber: string;
  date: string;
  consigneeName: string;
  consigneeAddress: { street?: string; city?: string; state?: string; zip?: string };
  carrierName: string;
  lineItems: OrderLineItem[];
  customerName?: string;
  customerAddress?: { street?: string; city?: string; state?: string; zip?: string };
  specialInstructions?: string;
}): BillOfLading {
  const bolItems: BOLLineItem[] = params.lineItems.map(li => {
    const freightClass = calculateFreightClass(li.product_type, li.weight_per_unit);
    const handlingUnits = Math.max(1, Math.ceil(li.quantity / (li.unit_type === 'pallet' ? 1 : 24)));

    return {
      handlingUnitQty: handlingUnits,
      handlingUnitType: getHandlingUnitType(li.unit_type),
      packageQty: li.quantity,
      packageType: getPackageType(li.unit_type),
      weight: Math.round(li.total_weight),
      hazmat: li.product_type === 'hazmat',
      description: li.description,
      freightClass,
      said: `Said to contain: ${li.quantity} ${li.unit_type}(s) of ${li.description}`,
    };
  });

  return {
    bolNumber: params.bolNumber,
    date: params.date,
    shipperName: 'Woulf Group / Clutch 3PL',
    shipperAddress: '587 S SR-138',
    shipperCity: 'Grantsville',
    shipperState: 'UT',
    shipperZip: '84029',
    shipperPhone: '(435) 555-0100',
    consigneeName: params.consigneeName,
    consigneeAddress: params.consigneeAddress.street || '',
    consigneeCity: params.consigneeAddress.city || '',
    consigneeState: params.consigneeAddress.state || '',
    consigneeZip: params.consigneeAddress.zip || '',
    thirdPartyName: params.customerName,
    thirdPartyAddress: params.customerAddress
      ? `${params.customerAddress.street}, ${params.customerAddress.city}, ${params.customerAddress.state} ${params.customerAddress.zip}`
      : undefined,
    carrierName: params.carrierName,
    items: bolItems,
    totalHandlingUnits: bolItems.reduce((s, i) => s + i.handlingUnitQty, 0),
    totalPackages: bolItems.reduce((s, i) => s + i.packageQty, 0),
    totalWeight: bolItems.reduce((s, i) => s + i.weight, 0),
    specialInstructions: params.specialInstructions,
  };
}
