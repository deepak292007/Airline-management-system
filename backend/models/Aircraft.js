const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "Boeing 777", "Airbus A320"
    registrationNumber: { type: String, required: true, unique: true },
    totalSeats: { type: Number, required: true },
    layout: {
        business: { type: Number, default: 0 },
        premiumEconomy: { type: Number, default: 0 },
        economy: { type: Number, default: 180 }
    }
});

module.exports = mongoose.model('Aircraft', aircraftSchema);
