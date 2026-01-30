import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { MenuItemModel } from '@/models';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const menuItem = await MenuItemModel.findById(id).populate('category_id');
    if (!menuItem) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    return NextResponse.json(menuItem);
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
    const menuItem = await MenuItemModel.findByIdAndUpdate(id, body, { new: true });
    if (!menuItem) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    return NextResponse.json(menuItem);
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
    const menuItem = await MenuItemModel.findByIdAndDelete(id);
    if (!menuItem) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    return NextResponse.json({ message: 'Menu item deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
