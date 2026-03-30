const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Passenger', passengerSchema);
