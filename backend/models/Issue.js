const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema(
  {
    // Link to the user who reported the issue
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      enum: ['Missed Pickup', 'Overflowing Bin', 'Broken Bin', 'Other'],
      required: [true, 'Please select a category']
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
      uppercase: true
    },
    adminRemark: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Issue', IssueSchema);