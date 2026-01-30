import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { UserModel } from '@/models';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Ensure role is always customer for public signup
    const userData = {
      ...body,
      role: 'customer',
      status: 'active',
      customer_type: 'regular',
      discount_rate: 0
    };

    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const user = await UserModel.create(userData);
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
