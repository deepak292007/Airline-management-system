const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Flight = require('../models/Flight');
const { calculateDynamicPrice } = require('../services/pricingAI');

router.get('/', async (req, res) => {
    try {
        const { origin, destination, date, passengers } = req.query;
        const query = {};

        if (origin) query['route.origin'] = origin.toUpperCase();
        if (destination) query['route.destination'] = destination.toUpperCase();

        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(searchDate.getDate() + 1);
            query.departureTime = { $gte: searchDate, $lt: nextDay };
        }

        const requiredSeats = Number.parseInt(passengers, 10) || 0;
        const flights = await Flight.find(query).sort({ departureTime: 1 }).lean();

        res.json(
            flights
                .filter(({ seatsAvailable }) => !requiredSeats || seatsAvailable >= requiredSeats)
                .map((flight) => ({ ...flight, currentPrice: calculateDynamicPrice(flight) }))
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/add', async (req, res) => {
    try {
        const flight = new Flight(req.body);
        await flight.save();
        res.status(201).json(flight);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/seed', async (req, res) => {
    try {
        const flightsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../dataset/flights.json'), 'utf8'));

        await Flight.deleteMany({});
        await Flight.insertMany(flightsData);

        res.json({ message: 'Database seeded with 100 flights!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to seed database' });
    }
});

module.exports = router;
