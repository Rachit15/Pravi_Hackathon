const Grievance = require('../models/Grievance');
const User = require('../models/User');
const { getRedis } = require('../config/redis');

const CACHE_TTL = 300; // 5 minutes

const getDashboardStats = async () => {
  const redis = getRedis();
  const cacheKey = 'analytics:dashboard';

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  const [
    totalGrievances,
    statusBreakdown,
    priorityBreakdown,
    departmentBreakdown,
    recentGrievances,
    totalUsers,
    resolvedThisMonth,
  ] = await Promise.all([
    Grievance.countDocuments(),
    Grievance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Grievance.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Grievance.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
    Grievance.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email'),
    User.countDocuments({ role: 'citizen' }),
    Grievance.countDocuments({
      status: 'resolved',
      updatedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
  ]);

  const monthlyData = await Grievance.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const stats = {
    totalGrievances,
    totalUsers,
    resolvedThisMonth,
    statusBreakdown: statusBreakdown.map((s) => ({ name: s._id, value: s.count })),
    priorityBreakdown: priorityBreakdown.map((p) => ({ name: p._id, value: p.count })),
    departmentBreakdown: departmentBreakdown.map((d) => ({ name: d._id, value: d.count })),
    recentGrievances,
    monthlyData: monthlyData.map((m) => ({
      name: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      count: m.count,
    })),
  };

  try {
    const redis = getRedis();
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(stats));
  } catch (e) {}

  return stats;
};

module.exports = { getDashboardStats };
