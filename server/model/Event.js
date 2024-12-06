import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    extendedProps: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
export default Event;