import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { BranchModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const branches = await BranchModel.find({});
    return NextResponse.json(branches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const branch = await BranchModel.create(body);
    return NextResponse.json(branch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
