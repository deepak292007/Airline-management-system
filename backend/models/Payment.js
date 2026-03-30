const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Success', 'Failed'], default: 'Success' },
    paymentMethod: { type: String, default: 'Simulation' },
    paymentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
