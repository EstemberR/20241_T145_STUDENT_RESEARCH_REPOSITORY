import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: { type: String,
        unique: true,
        required: true
    },
    email: { type: String,
         unique: true, 
         required: true },
    firstName: { type: String, 
                required: true },
    lastName: { type: String, 
                required: true },
    isVerified: { type: Boolean,
                 default: false },
    uid: { 
    type: String, 
    required: true, 
    unique: true 
    },
    verificationToken: { type: String },
    photoURL: { type: String },
    role: { type: String,
         enum: ['student', 'instructor'],
         required: true },
    name: { type: String }
});

const User = mongoose.model('Users', userSchema, 'students');
export default User;