// Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    photoURL: {  
        type: String,
        default: null
    },
    uid: { 
        type: String, 
        required: true, 
        unique: true 
    },
    course: {
        type: String,
        enum: ['BS-MATH', 'BS-ES', 'BSDC', 'BSCD', 'BS-BIO', 'AB-SOCSCI', 'AB-SOCIO', 'AB-PHILO'],
        required: false
    },
    role: { 
        type: String, 
        enum: ['student'], 
        required: true,
        default: 'student'
    },
    studentId: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        index: true  // Add index for better performance
    },
    archived: { 
        type: Boolean, 
        default: false,
        index: true  // Add index for archived queries
    },
    section: { 
        type: String, 
        required: false,
        trim: true 
    },
    managedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
        required: false
    },
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Research'
    }],
    projectMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student' // Reference to other students in the project
    }],
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor' // Reference to the instructor overseeing the project
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for getting student's research
studentSchema.virtual('research', {
    ref: 'Research',
    localField: '_id',
    foreignField: 'mongoId'
});

// Add method to get active research count
studentSchema.methods.getResearchCount = async function() {
    const Research = mongoose.model('Research');
    return await Research.countDocuments({ studentId: this.studentId });
};

// Add these methods before creating the model
studentSchema.methods.removeProjectMember = async function(memberToRemove) {
  try {
    // Remove the member from projectMembers array
    this.projectMembers = this.projectMembers.filter(
      memberId => memberId.toString() !== memberToRemove.toString()
    );
    await this.save();
    return true;
  } catch (error) {
    console.error('Error removing project member:', error);
    return false;
  }
};

// Add static method to handle team updates
studentSchema.statics.updateTeamMembers = async function(leaderId, memberIdToRemove) {
  try {
    // Find the team leader
    const leader = await this.findOne({ _id: leaderId });
    if (!leader) {
      throw new Error('Team leader not found');
    }

    // Remove the member from leader's projectMembers
    await leader.removeProjectMember(memberIdToRemove);

    // Remove the leader from member's projectMembers
    const member = await this.findOne({ _id: memberIdToRemove });
    if (member) {
      member.projectMembers = member.projectMembers.filter(
        id => id.toString() !== leaderId.toString()
      );
      member.instructorId = null; // Clear instructor reference
      await member.save();
    }

    return true;
  } catch (error) {
    console.error('Error updating team members:', error);
    throw error;
  }
};

const Student = mongoose.model('Student', studentSchema);

// Ensure indexes are created
Student.createIndexes();

export default Student;
