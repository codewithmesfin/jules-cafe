import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { UserModel } from '@/models';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, password } = await request.json();

    // In a real app, we would verify password with bcrypt
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // For demo purposes, any password is fine if provided
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
