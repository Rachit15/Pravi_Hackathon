const Grievance = require('../models/Grievance');
const GrievanceUpdate = require('../models/GrievanceUpdate');
const AuditLog = require('../models/AuditLog');
const { getAIClassificationQueue } = require('../queues');
const { getNotificationQueue } = require('../queues');
const {
  notifyGrievanceSubmitted,
  notifyStatusUpdated,
  notifyGrievanceResolved,
  notifyOfficerAssigned,
} = require('../services/notification.service');

const createGrievance = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Title, description and category are required' });
    }

    const grievance = await Grievance.create({
      title,
      description,
      category,
      userId: req.user._id,
    });

    // Queue AI classification
    try {
      const aiQueue = getAIClassificationQueue();
      await aiQueue.add('classify', { grievanceId: grievance._id, title, description, category });
    } catch (e) {
      console.error('AI queue error:', e.message);
    }

    // Send notification
    await notifyGrievanceSubmitted(req.user._id, grievance.ticketId);

    await AuditLog.create({
      action: 'GRIEVANCE_CREATED',
      userId: req.user._id,
      targetId: grievance._id,
      targetModel: 'Grievance',
      details: { ticketId: grievance.ticketId },
    });

    await grievance.populate('userId', 'name email');
    res.status(201).json({ success: true, message: 'Grievance submitted successfully', grievance });
  } catch (error) {
    console.error('Create grievance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGrievances = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, department, search } = req.query;
    const query = {};

    // Citizens see only their grievances
    if (req.user.role === 'citizen') {
      query.userId = req.user._id;
    }
    // Officers see grievances assigned to them OR unassigned grievances in their department
    if (req.user.role === 'officer') {
      const officerDept = req.user.department || 'General';
      query.$or = [
        { assignedOfficer: req.user._id },
        { department: officerDept, assignedOfficer: null }
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [grievances, total] = await Promise.all([
      Grievance.find(query)
        .populate('userId', 'name email')
        .populate('assignedOfficer', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Grievance.countDocuments(query),
    ]);

    res.json({
      success: true,
      grievances,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedOfficer', 'name email');

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    // Citizens can only see their own
    if (req.user.role === 'citizen' && grievance.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = await GrievanceUpdate.find({ grievanceId: grievance._id })
      .populate('updatedBy', 'name role')
      .sort({ timestamp: -1 });

    res.json({ success: true, grievance, updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGrievanceStatus = async (req, res) => {
  try {
    const { status, assignedOfficer, resolution } = req.body;
    const validStatuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    const previousStatus = grievance.status;
    const updateData = {};

    if (status) updateData.status = status;
    if (resolution) updateData.resolution = resolution;
    if (assignedOfficer) updateData.assignedOfficer = assignedOfficer;

    const updated = await Grievance.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('userId', 'name email')
      .populate('assignedOfficer', 'name email');

    // Create update record
    await GrievanceUpdate.create({
      grievanceId: grievance._id,
      message: status ? `Status changed to: ${status.replace('_', ' ')}` : 'Grievance updated',
      updatedBy: req.user._id,
      previousStatus,
      newStatus: status || previousStatus,
    });

    // Send notifications
    if (status && status !== previousStatus) {
      if (status === 'resolved') {
        await notifyGrievanceResolved(grievance.userId, grievance.ticketId);
      } else {
        await notifyStatusUpdated(grievance.userId, grievance.ticketId, status);
      }
    }

    if (assignedOfficer && assignedOfficer !== grievance.assignedOfficer?.toString()) {
      await notifyOfficerAssigned(grievance.userId, assignedOfficer, grievance.ticketId);
    }

    await AuditLog.create({
      action: 'GRIEVANCE_STATUS_UPDATED',
      userId: req.user._id,
      targetId: grievance._id,
      targetModel: 'Grievance',
      details: { previousStatus, newStatus: status, ticketId: grievance.ticketId },
    });

    res.json({ success: true, message: 'Grievance updated successfully', grievance: updated });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addGrievanceUpdate = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    const update = await GrievanceUpdate.create({
      grievanceId: grievance._id,
      message,
      updatedBy: req.user._id,
    });

    await update.populate('updatedBy', 'name role');
    await notifyStatusUpdated(grievance.userId, grievance.ticketId, 'update added');

    res.status(201).json({ success: true, message: 'Update added successfully', update });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGrievance,
  getGrievances,
  getGrievanceById,
  updateGrievanceStatus,
  addGrievanceUpdate,
};
