const Department = require('../models/Department');
const { getRedis } = require('../config/redis');

const CACHE_TTL = 300;
const CACHE_KEY = 'departments:list';

const getDepartments = async (req, res) => {
  try {
    const redis = getRedis();
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return res.json({ success: true, departments: JSON.parse(cached) });
    } catch (e) {}

    const departments = await Department.find({ isActive: true }).sort({ name: 1 });

    try {
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(departments));
    } catch (e) {}

    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, description, head } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Department name is required' });

    const existing = await Department.findOne({ name });
    if (existing) return res.status(409).json({ success: false, message: 'Department already exists' });

    const dept = await Department.create({ name, description, head });

    // Invalidate cache
    try {
      const redis = getRedis();
      await redis.del(CACHE_KEY);
    } catch (e) {}

    res.status(201).json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    try {
      const redis = getRedis();
      await redis.del(CACHE_KEY);
    } catch (e) {}

    res.json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    try {
      const redis = getRedis();
      await redis.del(CACHE_KEY);
    } catch (e) {}

    res.json({ success: true, message: 'Department deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
