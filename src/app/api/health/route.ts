import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    // Simple health check to validate DB connectivity from Vercel
    await query('SELECT 1');
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: String(err) },
      { status: 500 }
    );
  }
}
