export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
const MAX_SIZE = 3 * 1024 * 1024 * 1024; // 3GB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const companyId = formData.get('companyId') as string || 'default';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|avi)$/i)) {
      return NextResponse.json({ error: 'Unsupported file type. Accepted: MP4, MOV, WEBM, AVI' }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 500MB.' }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const remotePath = `${companyId}/${timestamp}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await sb.storage
      .from('video-uploads')
      .upload(remotePath, buffer, {
        contentType: file.type || 'video/mp4',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
    }

    const { data: urlData } = sb.storage.from('video-uploads').getPublicUrl(remotePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      filename: file.name,
      size: file.size,
      path: remotePath,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
