const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true, unique: true },
    route: {
        origin: { type: String, required: true },
        destination: { type: String, required: true }
    },
    aircraft: { type: mongoose.Schema.Types.ObjectId, ref: 'Aircraft', required: false },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: String, required: true }, // e.g. "2h 30m"
    basePrice: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    seatsAvailable: { type: Number, required: true },
    bookedSeats: [{ type: String }], // Array of seat numbers booked "1A", "2B"
    status: { type: String, enum: ['Scheduled', 'Delayed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);
