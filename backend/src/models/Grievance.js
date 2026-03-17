const mongoose = require('mongoose');

// Generate ticket ID: GRV-YYYY-XXXX
const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const count = await mongoose.model('Grievance').countDocuments() + 1;
  const padded = String(count).padStart(4, '0');
  return `GRV-${year}-${padded}`;
};

const grievanceSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 5000,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Infrastructure', 'Electricity', 'Water', 'Roads', 'Sanitation', 'Healthcare', 'Education', 'Public Safety', 'Environment', 'Other'],
  },
  department: {
    type: String,
    default: 'General',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'],
    default: 'submitted',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  attachments: [{
    filename: String,
    url: String,
  }],
  aiClassified: {
    type: Boolean,
    default: false,
  },
  resolution: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

grievanceSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    this.ticketId = await generateTicketId();
  }
  this.updatedAt = Date.now();
  next();
});

grievanceSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Grievance', grievanceSchema);
