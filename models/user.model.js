const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    
    balance: {
        type: Number,
        default: 0
    },

    spent: {
        type: Number,
        default: 0
    },

    earned: {
        type: Number,
        default: 0
    },

    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction'
        }
    ]
},
{
    timestamps: true
})

const User = mongoose.model('User', userSchema)

module.exports = User