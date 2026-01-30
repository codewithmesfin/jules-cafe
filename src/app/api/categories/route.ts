import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { CategoryModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await CategoryModel.find({});
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const category = await CategoryModel.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
