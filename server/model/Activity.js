import mongoose from 'mongoose';

const accountActivitySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  accountType: {
    type: String,
    enum: ['student', 'instructor'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  course: String, 
  email: {
    type: String,
    required: true
  },
 status: {
    type: String,
    enum: ['active', 'pending', 'archived'],
    default: 'active'
  }
});

export default mongoose.model('AccountActivity', accountActivitySchema);