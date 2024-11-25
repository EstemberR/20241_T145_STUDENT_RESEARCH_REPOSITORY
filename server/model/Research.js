import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema({
  studentId: {
      type: String,
      ref: 'Student',
      required: true,
      index: true
  },
  mongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
  },
  title: {
      type: String,
      required: true,
      trim: true
  },
  abstract: {
      type: String,
      required: true,
      trim: true
  },
  authors: {
      type: String,
      required: true,
      trim: true
  },
  keywords: {
      type: String,
      required: true,
      trim: true
  },
  fileUrl: {
      type: String,
      required: true,
      trim: true
  },
  driveFileId: {
      type: String,
      required: true,
      trim: true
  },
  status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Revision'],
      default: 'Pending',
      index: true
  },
  comments: {
      type: String,
      trim: true,
      default: null
  },
  uploadDate: {
      type: Date,
      default: Date.now,
      index: true
  },
  adviser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor'
  },
  course: {
    type: String,
    enum: ['BS-MATH', 'BS-ES', 'BSDC', 'BSCD', 'BS-BIO', 'AB-SOCSCI', 'AB-SOCIO', 'AB-PHILO'],
    required: true
  },
  teamMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
  }],
  section: {
      type: String,
      trim: true
  },
  submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
  },
  note: {
      type: String,
      trim: true,
      default: null
  },
  version: {
      type: Number,
      default: 1
  },
  parentId: {  // Add this new field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Research',
    default: null
}
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

researchSchema.virtual('student', {
    ref: 'Student',
    localField: 'mongoId',
    foreignField: '_id',
    justOne: true
});

researchSchema.index({ studentId: 1, status: 1 });
researchSchema.index({ uploadDate: -1 });

researchSchema.methods.canEdit = function() {
    return ['Pending', 'Revision'].includes(this.status);
};

researchSchema.statics.findBySchoolId = function(schoolId) {
    return this.find({ studentId: schoolId }).sort({ uploadDate: -1 });
};

const Research = mongoose.model('Research', researchSchema);

Research.createIndexes();

export default Research; 