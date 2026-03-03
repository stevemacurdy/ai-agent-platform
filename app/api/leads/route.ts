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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, phone, interest, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Save to leads table
    const { error: dbErr } = await sb.from('leads').insert({
      name,
      email,
      company: company || null,
      phone: phone || null,
      interest: interest || 'general',
      message: message || null,
      source: 'contact_form',
      status: 'new',
    });

    if (dbErr) {
      console.error('[leads] DB error:', dbErr);
    }

    // Send notification email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'WoulfAI <noreply@woulfai.com>',
            to: ['steve@woulfgroup.com'],
            subject: `[WoulfAI Lead] ${interest === 'enterprise' ? '🏢 Enterprise' : '📩'} ${name} - ${company || 'No company'}`,
            html: `
              <h2>New Lead from WoulfAI</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Company:</strong> ${company || 'N/A'}</p>
              <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
              <p><strong>Interest:</strong> ${interest}</p>
              <p><strong>Message:</strong> ${message || 'N/A'}</p>
              <hr />
              <p style="color: #999;">From WoulfAI contact form</p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('[leads] Email error:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[leads] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
