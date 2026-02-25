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
    leader: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: moongose.Schema.Types.ObjectId,
        ref: 'User'
    }]
},
    { timestamps: true });