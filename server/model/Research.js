import mongoose from 'mongoose';
const researchSchema = new mongoose.Schema({
  studentId: {
      type: String,
      ref: 'Student',
      required: true
  },
  title: {
      type: String,
      required: true
  },
  abstract: {
      type: String,
      required: true
  },
  authors: {
      type: String,
      required: true
  },
  keywords: {
      type: String,
      required: true
  },
  fileUrl: {
      type: String,
      required: true
  },
  driveFileId: {
      type: String,
      required: true
  },
  status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Revision'],
      default: 'Pending'
  },
  uploadDate: {
      type: Date,
      default: Date.now
  },
  adviser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    default: null
  }
}, { timestamps: true });
export default mongoose.model('Research', researchSchema); 