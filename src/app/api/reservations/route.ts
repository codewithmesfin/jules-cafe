import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ReservationModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const reservations = await ReservationModel.find({}).populate('customer_id branch_id table_id');
    return NextResponse.json(reservations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const reservation = await ReservationModel.create(body);
    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
