import { NextResponse } from 'next/server';
import { strapiFetch } from '@/utils/strapi';

const mapRole = (strapiRole: any): string => {
  const name = strapiRole?.name?.toLowerCase() || 'customer';
  if (name === 'authenticated') return 'customer';
  return name;
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const authData = await strapiFetch('/api/auth/local', {
      method: 'POST',
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    });

    const userData = await strapiFetch('/api/users/me?populate=role&populate=company', {
      headers: {
        'Authorization': `Bearer ${authData.jwt}`
      }
    });

    const normalizedUser = {
      ...userData,
      id: userData.id.toString(),
      role: mapRole(userData.role),
      company: userData.company ? {
        id: userData.company.id.toString(),
        name: userData.company.name
      } : undefined
    };

    return NextResponse.json({
      jwt: authData.jwt,
      user: normalizedUser
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
