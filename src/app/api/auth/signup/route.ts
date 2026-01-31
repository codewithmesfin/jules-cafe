import { NextResponse } from 'next/server';
import { strapiFetch } from '@/utils/strapi';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Map frontend body to Strapi's register payload
    const strapiPayload = {
      username: body.email.split('@')[0] + Math.floor(Math.random() * 1000), // Generate a username if not provided
      email: body.email,
      password: body.password,
      // Additional fields can be passed if Strapi user-permissions is configured to accept them
      full_name: body.full_name,
      phone: body.phone,
      role_type: 'customer'
    };

    const data = await strapiFetch('/api/auth/local/register', {
      method: 'POST',
      body: JSON.stringify(strapiPayload),
    });

    // Strapi returns { jwt, user }
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
