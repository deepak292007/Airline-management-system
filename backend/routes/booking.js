const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Flight = require('../models/Flight');
const { authMiddleware } = require('../middleware/authMiddle');
const { calculateDynamicPrice, applyCabinMultiplier } = require('../services/pricingAI');

const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { flightId, seatNumber, class: cabinClass = 'Economy' } = req.body;
        const flight = await Flight.findById(flightId);

        if (!flight) return res.status(404).json({ error: 'Flight not found' });
        if ((flight.bookedSeats || []).includes(seatNumber)) return res.status(400).json({ error: 'Seat already booked' });
        if (flight.seatsAvailable <= 0) return res.status(400).json({ error: 'No seats available' });

        const ticketNumber = createId('TKT');
        const booking = new Booking({
            passenger: req.user.id,
            flight: flightId,
            seatNumber,
            bookingId: createId('BKG'),
            ticketNumber,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketNumber}`,
            class: cabinClass,
            totalPrice: applyCabinMultiplier(calculateDynamicPrice(flight), cabinClass),
            status: 'Pending'
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/payment/process', authMiddleware, async (req, res) => {
    try {
        const { bookingId, amount } = req.body;
        const booking = await Booking.findById(bookingId).populate('flight');

        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        if (booking.status === 'Confirmed') return res.status(400).json({ error: 'Booking already confirmed' });

        const payment = new Payment({
            booking: booking._id,
            amount,
            transactionId: createId('TXN'),
            status: 'Success'
        });

        booking.status = 'Confirmed';
        booking.payment = payment._id;

        const flight = await Flight.findById(booking.flight._id);
        flight.seatsAvailable -= 1;
        flight.bookedSeats.push(booking.seatNumber);

        await Promise.all([payment.save(), booking.save(), flight.save()]);
        res.json({ message: 'Payment successful, booking confirmed', booking, payment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/mine', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ passenger: req.user.id })
            .populate('flight')
            .populate('payment');

        res.json({ data: bookings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('flight')
            .populate('passenger')
            .populate('payment');

        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        if (booking.passenger._id.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
