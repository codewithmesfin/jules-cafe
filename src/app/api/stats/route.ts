import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { OrderModel, UserModel, BranchModel, ReviewModel } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();

    const [totalOrders, totalUsers, totalBranches, avgRating] = await Promise.all([
      OrderModel.countDocuments({}),
      UserModel.countDocuments({ role: 'customer' }),
      BranchModel.countDocuments({ is_active: true }),
      ReviewModel.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" } } }
      ])
    ]);

    const revenuePerDay = await OrderModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total_amount" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    const topBranches = await OrderModel.aggregate([
      {
        $group: {
          _id: "$branch_id",
          totalSales: { $sum: "$total_amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "branches",
          localField: "_id",
          foreignField: "_id",
          as: "branch"
        }
      },
      { $unwind: "$branch" }
    ]);

    return NextResponse.json({
      totalOrders,
      totalCustomers: totalUsers,
      activeBranches: totalBranches,
      avgRating: avgRating[0]?.avg || 0,
      revenuePerDay,
      topBranches: topBranches.map(b => ({
        name: b.branch.name,
        sales: b.totalSales,
        count: b.count
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
