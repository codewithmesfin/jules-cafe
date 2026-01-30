import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { RecipeModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const recipes = await RecipeModel.find({}).populate('menu_item_id');
    return NextResponse.json(recipes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const recipe = await RecipeModel.create(body);
    return NextResponse.json(recipe, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
