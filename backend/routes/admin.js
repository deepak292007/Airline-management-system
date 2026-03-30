const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const Passenger = require('../models/Passenger');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddle');
const jwt = require('jsonwebtoken');

// Special route just to get an admin token for simulation purposes
router.post('/login-simulation', (req, res) => {
    const { secret } = req.body;
    if (secret === 'Team4') {
        const token = jwt.sign(
            { id: 'admin1', role: 'admin' },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1d' }
        );
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid admin secret' });
    }
});

// Protect all below with admin middleware
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/flights', async (req, res) => {
    try {
        const flights = await Flight.find();
        res.json(flights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/flights', async (req, res) => {
    try {
        const flight = new Flight(req.body);
        await flight.save();
        res.status(201).json(flight);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/flights/:id', async (req, res) => {
    try {
        const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(flight);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/flights/:id', async (req, res) => {
    try {
        await Flight.findByIdAndDelete(req.params.id);
        res.json({ message: 'Flight cancelled/deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/bookings/:id', async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/passengers', async (req, res) => {
    try {
        const passenger = new Passenger(req.body);
        await passenger.save();
        res.status(201).json(passenger);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/passengers/:id', async (req, res) => {
    try {
        await Passenger.findByIdAndDelete(req.params.id);
        res.json({ message: 'Passenger deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const totalFlights = await Flight.countDocuments();
        const totalBookings = await Booking.countDocuments();
        let revenue = 0;
        
        const confirmedBookings = await Booking.find({ status: 'Confirmed' });
        confirmedBookings.forEach(b => revenue += b.totalPrice);
        
        res.json({
            totalFlights,
            totalBookings,
            revenue,
            occupancyRate: '78%' // Simulated value for charts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('flight passenger');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/passengers', async (req, res) => {
    try {
        const passengers = await Passenger.find();
        res.json(passengers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
