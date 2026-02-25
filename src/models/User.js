const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Exclude password from query results by default
    },
    role: {
        type: String,
        enum: ['user', 'leader', 'admin'],
        default: 'user'
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }
},
    { timestamps: true });

// Hash the password before saving the user
userSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;
    // Hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    // Hash the password and replace the plain text password with the hashed one
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);