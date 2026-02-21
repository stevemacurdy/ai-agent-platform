// ============================================================================
// CRM ADAPTER FACTORY - Returns adapter for each provider
// ============================================================================

import type { CRMProvider, CRMAdapter } from './types';
import { NetSuiteAdapter } from './netsuite';
import { HubSpotAdapter } from './hubspot';

const adapters: Record<string, new () => CRMAdapter> = {
  netsuite: NetSuiteAdapter,
  hubspot: HubSpotAdapter,
};

export function getCRMAdapter(provider: CRMProvider): CRMAdapter {
  const AdapterClass = adapters[provider];
  if (!AdapterClass) {
    throw new Error(`Unsupported CRM provider: ${provider}. Available: ${Object.keys(adapters).join(', ')}`);
  }
  return new AdapterClass();
}

export function getSupportedProviders(): CRMProvider[] {
  return Object.keys(adapters) as CRMProvider[];
}

export * from './types';
export * from './store';
