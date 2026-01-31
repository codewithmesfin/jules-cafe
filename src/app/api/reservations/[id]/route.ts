import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ReservationModel } from '@/models';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const reservation = await ReservationModel.findById(id).populate('customer_id branch_id table_id');
    if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    return NextResponse.json(reservation);
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

    const reservation = await ReservationModel.findById(id);
    if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });

    Object.assign(reservation, body);
    await reservation.save();

    await reservation.populate('customer_id branch_id table_id');

    return NextResponse.json(reservation);
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
    const reservation = await ReservationModel.findByIdAndDelete(id);
    if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    return NextResponse.json({ message: 'Reservation deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
