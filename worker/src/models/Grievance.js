const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  ticketId: String,
  title: String,
  description: String,
  category: String,
  department: { type: String, default: 'General' },
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'submitted' },
  userId: mongoose.Schema.Types.ObjectId,
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, default: null },
  aiClassified: { type: Boolean, default: false },
  resolution: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Grievance', grievanceSchema);
