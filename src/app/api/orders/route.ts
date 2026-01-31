import { NextResponse } from 'next/server';
import { strapiFetch, flattenStrapi } from '@/utils/strapi';

export async function GET() {
  try {
    const data = await strapiFetch('/api/orders?populate=*');
    return NextResponse.json(flattenStrapi(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Assuming Strapi has an 'items' component or relation in Order
    const data = await strapiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ data: body }),
    });
    return NextResponse.json(flattenStrapi(data), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
