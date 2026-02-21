// ============================================================================
// CRM CONNECTION STORE - Supabase storage with encryption
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { encryptJSON, decryptJSON } from '../crypto';
import type { CRMProvider, CRMTokenPayload, CRMConnectionStatus } from './types';

// Server-side Supabase client
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

export interface CRMConnection {
  id: string;
  userId: string;
  provider: CRMProvider;
  status: CRMConnectionStatus;
  accountLabel: string | null;
  token: CRMTokenPayload | null;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export async function upsertCRMConnection(
  userId: string,
  provider: CRMProvider,
  tokenPayload: CRMTokenPayload,
  accountLabel?: string,
  meta?: Record<string, any>
): Promise<CRMConnection> {
  const supabase = getSupabaseAdmin();
  
  const tokenEncrypted = encryptJSON(tokenPayload);
  
  const { data, error } = await supabase
    .from('crm_connections')
    .upsert({
      user_id: userId,
      provider,
      status: 'connected',
      account_label: accountLabel || null,
      token_encrypted: tokenEncrypted,
      meta: meta || {},
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,provider',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save CRM connection: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    provider: data.provider,
    status: data.status,
    accountLabel: data.account_label,
    token: tokenPayload, // Return decrypted for immediate use
    meta: data.meta,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getCRMConnection(
  userId: string,
  provider: CRMProvider
): Promise<CRMConnection | null> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('crm_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();

  if (error || !data) {
    return null;
  }

  let token: CRMTokenPayload | null = null;
  if (data.token_encrypted && data.status === 'connected') {
    try {
      token = decryptJSON(data.token_encrypted);
    } catch (e) {
      console.error('Failed to decrypt token:', e);
    }
  }

  return {
    id: data.id,
    userId: data.user_id,
    provider: data.provider,
    status: data.status,
    accountLabel: data.account_label,
    token,
    meta: data.meta,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getAllCRMConnections(userId: string): Promise<CRMConnection[]> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('crm_connections')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) {
    return [];
  }

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    provider: row.provider,
    status: row.status,
    accountLabel: row.account_label,
    token: null, // Don't decrypt for listing
    meta: row.meta,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function disconnectCRM(
  userId: string,
  provider: CRMProvider
): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from('crm_connections')
    .update({
      status: 'disconnected',
      token_encrypted: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) {
    throw new Error(`Failed to disconnect CRM: ${error.message}`);
  }
}

export async function deleteCRMConnection(
  userId: string,
  provider: CRMProvider
): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from('crm_connections')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) {
    throw new Error(`Failed to delete CRM connection: ${error.message}`);
  }
}

// Admin functions
export async function getAllConnectionsAdmin(): Promise<Array<CRMConnection & { userEmail?: string }>> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('crm_connections')
    .select(`
      *,
      sales_profiles!inner(email, display_name)
    `);

  if (error || !data) {
    return [];
  }

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    provider: row.provider,
    status: row.status,
    accountLabel: row.account_label,
    token: null,
    meta: row.meta,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userEmail: (row as any).sales_profiles?.email,
  }));
}
