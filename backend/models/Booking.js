const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    seatNumber: { type: String, required: true },
    bookingId: { type: String, required: true, unique: true },
    ticketNumber: { type: String, required: true, unique: true },
    qrCode: { type: String }, // Base64 or URL of generated QR
    status: { type: String, enum: ['Confirmed', 'Cancelled', 'Pending'], default: 'Pending' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    class: { type: String, enum: ['Business', 'Premium Economy', 'Economy'], required: true },
    totalPrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
