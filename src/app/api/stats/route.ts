import { NextResponse } from 'next/server';
import { strapiFetch } from '@/utils/strapi';

export async function GET() {
  try {
    // For stats, we might need a custom Strapi route or handle aggregation here
    // For now, let's return a mock or simplified stats until we have a custom controller in Strapi
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
