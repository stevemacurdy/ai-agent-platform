// ============================================================================
// CRM ADAPTER TYPES - Extensible Interface for All CRM Providers
// ============================================================================

export type CRMProvider = 'netsuite' | 'hubspot' | 'salesforce' | 'pipedrive' | 'zoho' | 'custom';

export type CRMAuthType = 'oauth2' | 'api_key' | 'jwt' | 'netsuite_tba';

export type CRMConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface CRMTokenPayload {
  authType: CRMAuthType;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number; // epoch seconds
  token_type?: string;
  scope?: string;
  
  // For API key auth
  api_key?: string;
  
  // For NetSuite TBA (Token Based Auth)
  account_id?: string;
  consumer_key?: string;
  consumer_secret?: string;
  token_id?: string;
  token_secret?: string;
  
  // For HubSpot
  hub_id?: string;
  
  // Generic extras
  [key: string]: any;
}

export interface CRMLead {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  customFields?: Record<string, any>;
}

export interface CRMContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
}

export interface CRMDeal {
  id: string;
  name: string;
  amount?: number;
  stage?: string;
  closeDate?: string;
  contactId?: string;
  companyId?: string;
}

export interface CRMTestResult {
  ok: boolean;
  accountLabel?: string;
  meta?: any;
  error?: string;
}

export interface CRMCreateResult {
  ok: boolean;
  id?: string;
  raw?: any;
  error?: string;
}

export interface CRMAdapter {
  provider: CRMProvider;
  authType: CRMAuthType;
  displayName: string;
  
  // OAuth flow
  getAuthUrl(params: { redirectUri: string; state: string }): Promise<string>;
  exchangeCode(params: { code: string; redirectUri: string }): Promise<CRMTokenPayload>;
  refreshToken?(params: { token: CRMTokenPayload }): Promise<CRMTokenPayload>;
  
  // Manual auth (API key / TBA)
  supportsManualAuth: boolean;
  validateManualAuth?(params: { credentials: Record<string, string> }): Promise<CRMTokenPayload>;
  
  // API operations
  testConnection(params: { token: CRMTokenPayload }): Promise<CRMTestResult>;
  createLead(params: { token: CRMTokenPayload; lead: CRMLead }): Promise<CRMCreateResult>;
  
  // Optional extended operations
  getLeads?(params: { token: CRMTokenPayload; limit?: number }): Promise<CRMLead[]>;
  getContacts?(params: { token: CRMTokenPayload; limit?: number }): Promise<CRMContact[]>;
  getDeals?(params: { token: CRMTokenPayload; limit?: number }): Promise<CRMDeal[]>;
}

// Provider configuration (for UI)
export interface CRMProviderConfig {
  provider: CRMProvider;
  displayName: string;
  description: string;
  icon: string;
  authType: CRMAuthType;
  supportsOAuth: boolean;
  supportsManualAuth: boolean;
  manualAuthFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'password';
    required: boolean;
    placeholder?: string;
  }>;
  requiredEnvVars?: string[];
}

export const CRM_PROVIDERS: CRMProviderConfig[] = [
  {
    provider: 'netsuite',
    displayName: 'NetSuite',
    description: 'Oracle NetSuite ERP & CRM',
    icon: 'N',
    authType: 'netsuite_tba',
    supportsOAuth: true,
    supportsManualAuth: true,
    manualAuthFields: [
      { name: 'account_id', label: 'Account ID', type: 'text', required: true, placeholder: '1234567' },
      { name: 'consumer_key', label: 'Consumer Key', type: 'text', required: true },
      { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true },
      { name: 'token_id', label: 'Token ID', type: 'text', required: true },
      { name: 'token_secret', label: 'Token Secret', type: 'password', required: true },
    ],
  },
  {
    provider: 'hubspot',
    displayName: 'HubSpot',
    description: 'HubSpot CRM & Marketing',
    icon: 'H',
    authType: 'oauth2',
    supportsOAuth: true,
    supportsManualAuth: true,
    manualAuthFields: [
      { name: 'access_token', label: 'Private App Token', type: 'password', required: true, placeholder: 'pat-na1-...' },
    ],
  },
  {
    provider: 'salesforce',
    displayName: 'Salesforce',
    description: 'Salesforce CRM',
    icon: 'S',
    authType: 'oauth2',
    supportsOAuth: true,
    supportsManualAuth: false,
  },
  {
    provider: 'pipedrive',
    displayName: 'Pipedrive',
    description: 'Pipedrive Sales CRM',
    icon: 'P',
    authType: 'api_key',
    supportsOAuth: true,
    supportsManualAuth: true,
    manualAuthFields: [
      { name: 'api_key', label: 'API Token', type: 'password', required: true },
    ],
  },
  {
    provider: 'zoho',
    displayName: 'Zoho CRM',
    description: 'Zoho CRM Suite',
    icon: 'Z',
    authType: 'oauth2',
    supportsOAuth: true,
    supportsManualAuth: false,
  },
];
