import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ReviewModel } from '@/models';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const review = await ReviewModel.findById(id).populate('customer_id branch_id');
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    return NextResponse.json(review);
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
    const review = await ReviewModel.findByIdAndUpdate(id, body, { new: true });
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    return NextResponse.json(review);
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
    const review = await ReviewModel.findByIdAndDelete(id);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ message: 'Review deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
