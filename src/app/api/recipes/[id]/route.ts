import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { RecipeModel } from '@/models';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const recipe = await RecipeModel.findById(id).populate('menu_item_id');
    if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    return NextResponse.json(recipe);
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

    const recipe = await RecipeModel.findById(id);
    if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

    Object.assign(recipe, body);
    await recipe.save();

    await recipe.populate('menu_item_id');

    return NextResponse.json(recipe);
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
    const recipe = await RecipeModel.findByIdAndDelete(id);
    if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    return NextResponse.json({ message: 'Recipe deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
