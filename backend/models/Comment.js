import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  bugReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BugReport',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;