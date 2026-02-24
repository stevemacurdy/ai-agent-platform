export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET - returns cart items for a session
export async function GET(request: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const sessionId = request.headers.get('x-cart-session');
    if (!sessionId) return NextResponse.json({ items: [] });

    const { data: items, error } = await sb
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: items || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - add item to cart
export async function POST(request: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const { session_id, item_type, item_id, name, price } = await request.json();

    if (!session_id || !item_type || !item_id) {
      return NextResponse.json({ error: 'session_id, item_type, item_id required' }, { status: 400 });
    }

    // Check if already in cart
    const { data: existing } = await sb
      .from('cart_items')
      .select('id')
      .eq('session_id', session_id)
      .eq('item_id', item_id)
      .eq('item_type', item_type);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Already in cart', duplicate: true });
    }

    // Get user_id if logged in
    let userId = null;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const { data: { user } } = await sb.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { error } = await sb.from('cart_items').insert({
      session_id,
      user_id: userId,
      item_type,
      item_id,
      name: name || item_id,
      price: price || 0,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const { session_id, item_id, item_type } = await request.json();

    if (!session_id || !item_id) {
      return NextResponse.json({ error: 'session_id and item_id required' }, { status: 400 });
    }

    let query = sb.from('cart_items').delete().eq('session_id', session_id).eq('item_id', item_id);
    if (item_type) query = query.eq('item_type', item_type);

    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
