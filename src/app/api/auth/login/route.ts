import { NextResponse } from 'next/server';
import { strapiFetch } from '@/utils/strapi';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Strapi uses 'identifier' for either email or username
    const data = await strapiFetch('/api/auth/local', {
      method: 'POST',
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    });

    // Strapi returns { jwt, user }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
