import { NextResponse } from 'next/server';
import { strapiFetch } from '@/utils/strapi';

const mapRole = (strapiRole: any): string => {
  const name = strapiRole?.name?.toLowerCase() || 'customer';
  if (name === 'authenticated') return 'customer';
  return name;
};

export async function GET(request: Request) {
  try {
    const data = await strapiFetch('/api/users?populate=role&populate=company', {}, request);
    const normalized = data.map((u: any) => ({
      ...u,
      id: u.id.toString(),
      role: mapRole(u.role)
    }));
    return NextResponse.json(normalized);
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
    }, request);
    return NextResponse.json({
      ...data,
      id: data.id.toString()
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
