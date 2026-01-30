import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { InventoryItemModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const inventory = await InventoryItemModel.find({});
    return NextResponse.json(inventory);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const item = await InventoryItemModel.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
