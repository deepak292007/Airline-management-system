const fs = require('fs');
const path = require('path');

const routes = [
    { origin: 'HYD', destination: 'DEL', basePrice: 4500, duration: '2h 15m' },
    { origin: 'HYD', destination: 'BLR', basePrice: 3200, duration: '1h 10m' },
    { origin: 'HYD', destination: 'MUM', basePrice: 3800, duration: '1h 25m' },
    { origin: 'VIJ', destination: 'HYD', basePrice: 2500, duration: '0h 45m' },
    { origin: 'DEL', destination: 'DXB', basePrice: 12500, duration: '4h 30m' },
    { origin: 'DEL', destination: 'SIN', basePrice: 15500, duration: '5h 45m' },
    { origin: 'BLR', destination: 'MAA', basePrice: 2800, duration: '1h 0m' }
];

const generateFlights = () => {
    const flights = [];
    const today = new Date();
    
    for (let i = 1; i <= 100; i++) {
        const route = routes[Math.floor(Math.random() * routes.length)];
        
        // Randomize dates over the next 30 days
        const departureDate = new Date(today);
        departureDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
        departureDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        // Add duration roughly
        const arrivalDate = new Date(departureDate);
        arrivalDate.setHours(departureDate.getHours() + parseInt(route.duration[0]));
        
        const totalSeats = 180;
        // Randomize available seats to test AI pricing
        const seatsAvailable = Math.floor(Math.random() * totalSeats);
        
        flights.push({
            flightNumber: `SSS${1000 + i}`,
            route: { origin: route.origin, destination: route.destination },
            departureTime: departureDate.toISOString(),
            arrivalTime: arrivalDate.toISOString(),
            duration: route.duration,
            basePrice: route.basePrice,
            totalSeats,
            seatsAvailable,
            status: 'Scheduled'
        });
    }
    
    fs.writeFileSync(path.join(__dirname, 'flights.json'), JSON.stringify(flights, null, 2));
    console.log('Successfully generated 100 flights to dataset/flights.json');
};

generateFlights();
