import { NextResponse } from 'next/server';
import { strapiFetch } from '@/utils/strapi';

const mapRole = (strapiRole: any): string => {
  const name = strapiRole?.name?.toLowerCase() || 'customer';
  if (name === 'authenticated') return 'customer';
  return name;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await strapiFetch(`/api/users/${id}?populate=role&populate=company`, {}, request);
    return NextResponse.json({
      ...data,
      id: data.id.toString(),
      role: mapRole(data.role)
    });
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
    const data = await strapiFetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }, request);
    return NextResponse.json({
      ...data,
      id: data.id.toString()
    });
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
    await strapiFetch(`/api/users/${id}`, {
      method: 'DELETE',
    }, request);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
