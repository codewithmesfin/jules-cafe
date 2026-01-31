import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { BranchModel } from '@/models';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const branch = await BranchModel.findById(id);
    if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    return NextResponse.json(branch);
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

    const branch = await BranchModel.findById(id);
    if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 });

    Object.assign(branch, body);
    await branch.save();

    return NextResponse.json(branch);
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
    const branch = await BranchModel.findByIdAndDelete(id);
    if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    return NextResponse.json({ message: 'Branch deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
