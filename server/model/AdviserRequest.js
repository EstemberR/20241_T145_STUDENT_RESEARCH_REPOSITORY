import mongoose from 'mongoose';

const adviserRequestSchema = new mongoose.Schema({
    research: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Research',
        required: true
    },
    researchTitle: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
        required: true
    },
    instructorName: {
        type: String,
        required: true
    },
    instructorEmail: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AdviserRequest', adviserRequestSchema);