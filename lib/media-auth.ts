import { NextRequest, NextResponse } from 'next/server';

// Stub — real implementation coming from Agent #22 Videdit build
export interface MediaAuthContext {
  userId: string;
  companyId: string;
}

export async function authenticateMediaRequest(req: NextRequest): Promise<MediaAuthContext | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  return { userId: 'stub', companyId: 'stub' };
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | MediaAuthContext> {
  const auth = await authenticateMediaRequest(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return auth;
}
