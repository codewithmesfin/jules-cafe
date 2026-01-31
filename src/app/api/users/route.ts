import { NextResponse } from 'next/server';
import { strapiFetch, flattenStrapi } from '@/utils/strapi';

export async function GET() {
  try {
    // Strapi users endpoint is usually /api/users
    const data = await strapiFetch('/api/users');
    return NextResponse.json(data); // Strapi users often returns a flat array already
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await strapiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
