import { NextResponse } from 'next/server';
import { strapiFetch, flattenStrapi } from '@/utils/strapi';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await strapiFetch(`/api/menu-items/${id}?populate=*`, {}, request);
    return NextResponse.json(flattenStrapi(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await strapiFetch(`/api/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: body }),
    }, request);
    return NextResponse.json(flattenStrapi(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await strapiFetch(`/api/menu-items/${id}`, {
      method: 'DELETE',
    }, request);
    return NextResponse.json({ message: 'Menu item deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
