import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Student', 'Instructor']
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['TEAM_REQUEST', 'TEAM_REQUEST_RESPONSE', 'GENERAL'],
        default: 'GENERAL'
    },
    status: {
        type: String,
        enum: ['UNREAD', 'APPROVED', 'REJECTED', 'READ'],
        default: 'UNREAD'
    },
    relatedData: {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        teamMembers: [String],
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Instructor'
        },
        rejectMessage: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 