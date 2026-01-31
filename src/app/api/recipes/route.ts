import { NextResponse } from 'next/server';
import { strapiFetch, flattenStrapi } from '@/utils/strapi';

export async function GET(request: Request) {
  try {
    const data = await strapiFetch('/api/recipes?populate=*', {}, request);
    return NextResponse.json(flattenStrapi(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await strapiFetch('/api/recipes', {
      method: 'POST',
      body: JSON.stringify({ data: body }),
    }, request);
    return NextResponse.json(flattenStrapi(data), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
