import { NextResponse } from 'next/server';
import { strapiFetch } from '@/utils/strapi';

const mapRole = (strapiRole: any): string => {
  const name = strapiRole?.name?.toLowerCase() || 'customer';
  if (name === 'authenticated') return 'customer';
  return name;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const strapiPayload = {
      username: body.email.split('@')[0] + Math.floor(Math.random() * 1000),
      email: body.email,
      password: body.password,
      full_name: body.full_name,
      phone: body.phone,
    };

    const authData = await strapiFetch('/api/auth/local/register', {
      method: 'POST',
      body: JSON.stringify(strapiPayload),
    });

    const userData = await strapiFetch('/api/users/me?populate=role', {
      headers: {
        'Authorization': `Bearer ${authData.jwt}`
      }
    });

    const normalizedUser = {
      ...userData,
      id: userData.id.toString(),
      role: mapRole(userData.role)
    };

    return NextResponse.json({
      jwt: authData.jwt,
      user: normalizedUser
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
