import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { OrderModel, OrderItemModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await OrderModel.find({}).populate('customer_id branch_id table_id');
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { items, ...orderData } = body;

    // Auto-generate order number if not provided
    if (!orderData.order_number) {
      orderData.order_number = `ORD-${Date.now()}`;
    }

    const order = await OrderModel.create(orderData);

    if (items && Array.isArray(items) && items.length > 0) {
      const itemsWithOrderId = items.map((item: any) => ({ ...item, order_id: order._id }));
      await OrderItemModel.insertMany(itemsWithOrderId);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
