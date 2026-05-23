const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['dog', 'cat', 'bird', 'rabbit', 'other']
    },
    breed: String,
    age: Number,
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    status: {
        type: String,
        default: 'available',
        enum: ['available', 'adopted', 'pending']
    },
    imageUrl: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pet', petSchema);