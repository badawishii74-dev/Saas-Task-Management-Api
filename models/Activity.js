const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            enum: ["created", "updated", "deleted", "commented", "assigned"],
            required: true,
        },

        details: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Activity', activitySchema);