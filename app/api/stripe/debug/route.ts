export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return NextResponse.json({
    keyExists: !!key,
    keyLength: key.length,
    keyPrefix: key.substring(0, 12),
    keySuffix: key.substring(key.length - 4),
    hasQuotes: key.includes('"') || key.includes("'"),
    hasSpaces: key !== key.trim(),
  });
}