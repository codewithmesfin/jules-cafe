import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { TableModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const tables = await TableModel.find({});
    return NextResponse.json(tables);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const table = await TableModel.create(body);
    return NextResponse.json(table, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
