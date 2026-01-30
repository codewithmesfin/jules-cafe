import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ReviewModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const reviews = await ReviewModel.find({}).populate('customer_id branch_id');
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const review = await ReviewModel.create(body);
    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
