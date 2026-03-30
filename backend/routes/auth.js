const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Passenger = require('../models/Passenger');

// Fake OTP storage for simulation purposes (in production, use Redis or DB with TTL)
const otpStore = new Map();

// Generate a random 4 digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const normalizePhoneNumber = (value = '') => {
    const digits = String(value).replace(/\D/g, '').slice(-10);
    return digits.length === 10 ? `+91${digits}` : null;
};

router.post('/login', async (req, res) => {
    const { phoneNumber } = req.body;
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhoneNumber) {
        return res.status(400).json({ error: 'A valid 10-digit phone number is required' });
    }

    // Generate OTP
    const otp = generateOTP();
    otpStore.set(normalizedPhoneNumber, otp);

    // In a real app we would send this via SMS (Twilio/AWS SNS)
    console.log(`[SIMULATION] OTP for ${normalizedPhoneNumber} is ${otp}`);

    res.json({ message: 'OTP sent successfully', simulationOtp: otp });
});

router.post('/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    
    if (!normalizedPhoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const storedOtp = otpStore.get(normalizedPhoneNumber);

    if (storedOtp === otp) {
        // OTP verified
        otpStore.delete(normalizedPhoneNumber);

        // Find or create passenger
        let passenger = await Passenger.findOne({ phoneNumber: normalizedPhoneNumber });
        if (!passenger) {
            passenger = new Passenger({ phoneNumber: normalizedPhoneNumber });
            await passenger.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { id: passenger._id, phoneNumber: passenger.phoneNumber, role: 'passenger' },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '7d' }
        );

        return res.json({ message: 'Login successful', token, passenger });
    } else {
        return res.status(401).json({ error: 'Invalid OTP' });
    }
});

module.exports = router;
