    // Student.js
    import mongoose from 'mongoose';

    const archivedSchema = new mongoose.Schema({
        studentId: String,
        name: String,
        email: String,
        role: String,
        archivedAt: {
            type: Date,
            default: Date.now
          },
          restoredAt: {
            type: Date,
            default: null
          },
          archived: {
            type: Boolean,
            default: true // Indicates if the account is currently active or archived
          }    });

    const Archived = mongoose.model('Archived', archivedSchema);
    export default Archived;