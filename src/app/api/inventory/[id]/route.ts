import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { InventoryItemModel } from '@/models';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await InventoryItemModel.findById(id);
    if (!item) return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();

    const item = await InventoryItemModel.findById(id);
    if (!item) return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });

    Object.assign(item, body);
    await item.save();

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await InventoryItemModel.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    return NextResponse.json({ message: 'Inventory item deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
