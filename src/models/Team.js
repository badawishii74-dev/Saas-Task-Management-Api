const moongose = require('mongoose');

const teamSchema = new moongose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    leader: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: moongose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    joinRequests: [{
        type: moongose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    invitations: [{
        type: moongose.Schema.Types.ObjectId,
        ref: 'User'
    }]
},
    { timestamps: true });

module.exports = moongose.model('Team', teamSchema);