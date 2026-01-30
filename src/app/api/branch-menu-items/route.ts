import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { BranchMenuItemModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await BranchMenuItemModel.find({});
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const item = await BranchMenuItemModel.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
