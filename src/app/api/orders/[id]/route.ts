import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { OrderModel, OrderItemModel } from '@/models';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const order = await OrderModel.findById(id).populate('customer_id branch_id table_id');
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const items = await OrderItemModel.find({ order_id: id });

    return NextResponse.json({ ...order.toObject(), items });
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

    const order = await OrderModel.findById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    Object.assign(order, body);
    await order.save();

    await order.populate('customer_id branch_id table_id');
    const items = await OrderItemModel.find({ order_id: id });

    return NextResponse.json({ ...order.toObject(), items });
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
    await OrderItemModel.deleteMany({ order_id: id });
    const order = await OrderModel.findByIdAndDelete(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ message: 'Order deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
