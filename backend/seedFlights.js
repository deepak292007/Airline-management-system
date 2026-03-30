const mongoose = require('mongoose');
require('dotenv').config();
const Flight = require('./models/Flight'); // Adjust path if needed

const seedFlights = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sss-airlines');
        console.log('Connected to MongoDB');

        const now = new Date();

        // 1. Delete past flights
        const deleteResult = await Flight.deleteMany({ departureTime: { $lt: now } });
        console.log(`Deleted ${deleteResult.deletedCount} past flights.`);

        // 2. Generate 10 flights daily for the next 60 days (Morning and Evening) from HYD to DEL
        const newFlights = [];
        let flightCounter = 1000;

        for (let day = 0; day < 60; day++) {
            const currentDate = new Date(now);
            currentDate.setDate(now.getDate() + day);
            currentDate.setHours(0, 0, 0, 0); // Start of day

            // Generate 5 morning flights (06:00 to 11:00)
            for (let i = 0; i < 5; i++) {
                const depTime = new Date(currentDate);
                depTime.setHours(6 + i, 0, 0, 0);
                const arrTime = new Date(depTime);
                arrTime.setHours(depTime.getHours() + 2, 15, 0, 0); // 2h 15m duration

                newFlights.push({
                    flightNumber: `SSS${Date.now()}${flightCounter++}`,
                    route: { origin: 'HYD', destination: 'DEL' },
                    departureTime: depTime,
                    arrivalTime: arrTime,
                    duration: '2h 15m',
                    basePrice: 4500 + Math.floor(Math.random() * 2000), // Random price
                    totalSeats: 180,
                    seatsAvailable: 180,
                    bookedSeats: [],
                    status: 'Scheduled'
                });
            }

            // Generate 5 evening flights (16:00 to 20:00)
            for (let i = 0; i < 5; i++) {
                const depTime = new Date(currentDate);
                depTime.setHours(16 + i, 30, 0, 0);
                const arrTime = new Date(depTime);
                arrTime.setHours(depTime.getHours() + 2, 15, 0, 0);

                newFlights.push({
                    flightNumber: `SSS${Date.now()}${flightCounter++}`,
                    route: { origin: 'HYD', destination: 'DEL' },
                    departureTime: depTime,
                    arrivalTime: arrTime,
                    duration: '2h 15m',
                    basePrice: 5000 + Math.floor(Math.random() * 2500), // Evening flights
                    totalSeats: 180,
                    seatsAvailable: 180,
                    bookedSeats: [],
                    status: 'Scheduled'
                });
            }
        }

        // Insert new flights
        const insertResult = await Flight.insertMany(newFlights);
        console.log(`Successfully seeded ${insertResult.length} new flights (HYD to DEL).`);

        mongoose.connection.close();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error seeding flights:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedFlights();
