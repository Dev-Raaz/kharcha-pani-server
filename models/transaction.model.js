const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['expense', 'income']
    },

    description: {
        type: String,
    },

    imgSrc: {
        type: String,
        default: ''
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required: true
    }

},
{
    timestamps: true
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction