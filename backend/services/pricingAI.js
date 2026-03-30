const CLASS_MULTIPLIERS = {
    'Premium Economy': 1.5,
    Business: 3
};

const calculateDynamicPrice = (flight) => {
    if (!flight?.totalSeats) return 0;

    const { basePrice, totalSeats, seatsAvailable } = flight;
    const demandFactor = (totalSeats - seatsAvailable) / totalSeats;

    return Math.round(basePrice * (1 + demandFactor * (1 + Math.random() * 0.1)));
};

const applyCabinMultiplier = (price, cabinClass = 'Economy') =>
    Math.round(price * (CLASS_MULTIPLIERS[cabinClass] || 1));

module.exports = { calculateDynamicPrice, applyCabinMultiplier };
