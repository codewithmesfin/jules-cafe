import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { MenuItemModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const menuItems = await MenuItemModel.find({}).populate('category_id');
    return NextResponse.json(menuItems);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const menuItem = await MenuItemModel.create(body);
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
