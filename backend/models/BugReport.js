import mongoose from 'mongoose';

const bugReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  bountyAmount: {
    type: Number,
    default: 0
  },
  reporterEmail: {
    type: String,
    required: true
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdTimeStamp: {
    type: Date,
    default: Date.now
  },
  closedTimeStamp: {
    type: Date
  }
}, {
  timestamps: true
});

const BugReport = mongoose.model('BugReport', bugReportSchema);

export default BugReport;