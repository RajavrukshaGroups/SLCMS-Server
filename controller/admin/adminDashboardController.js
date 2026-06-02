const Receipt = require("../../models/receipt");

const AdminCalulateRevenueGenerated = async (req, res) => {
  try {
    const today = new Date();

    // Today Start & End
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // Month Start
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Year Start
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total Revenue
    const totalRevenueResult = await Receipt.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalReceipts: { $sum: 1 },
        },
      },
    ]);

    // Today Revenue
    const todayRevenueResult = await Receipt.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday,
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Current Month Revenue
    const currentMonthRevenueResult = await Receipt.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Current Year Revenue
    const currentYearRevenueResult = await Receipt.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const courseWiseRevenue = await Receipt.aggregate([
      {
        $group: {
          _id: "$course",
          revenue: {
            $sum: "$totalAmount",
          },
          receipts: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    const totalRevenue = totalRevenueResult?.[0]?.totalRevenue || 0;

    const totalReceipts = totalRevenueResult?.[0]?.totalReceipts || 0;

    const todayRevenue = todayRevenueResult?.[0]?.revenue || 0;

    const currentMonthRevenue = currentMonthRevenueResult?.[0]?.revenue || 0;

    const currentYearRevenue = currentYearRevenueResult?.[0]?.revenue || 0;

    return res.status(200).json({
      success: true,
      totalRevenue,
      totalReceipts,
      todayRevenue,
      currentMonthRevenue,
      currentYearRevenue,
      courseWiseRevenue,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  AdminCalulateRevenueGenerated,
};
