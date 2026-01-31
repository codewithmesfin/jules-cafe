import { NextResponse } from 'next/server';
import { strapiFetch } from '@/utils/strapi';

export async function GET(request: Request) {
  try {
    // For now, return empty stats as aggregations require custom Strapi controllers
    return NextResponse.json({
      totalOrders: 0,
      totalCustomers: 0,
      activeBranches: 0,
      avgRating: 0,
      revenuePerDay: [],
      topBranches: []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
