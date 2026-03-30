const API_BASE = 'http://localhost:5000';
const CLASS_MULTIPLIERS = { 'Premium Economy': 1.5, Business: 3 };

let currentFlights = [];

const $ = (id) => document.getElementById(id);
const getPassengerCount = (value) => Number.parseInt(value, 10) || 1;
const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const getDisplayPrice = (price, cabinClass, passengers) =>
    Math.round(price * (CLASS_MULTIPLIERS[cabinClass] || 1) * getPassengerCount(passengers));

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = $('loginBtn');
    const searchForm = $('flightSearchForm');
    const resultsContainer = $('resultsContainer');

    if (localStorage.getItem('token') && loginBtn) {
        loginBtn.innerHTML = '<i class="fa-solid fa-user"></i> My Account';
        loginBtn.href = 'pages/booking-status.html';
    }

    searchForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const passengers = $('passengers').value;
        const cabinClass = $('cabinClass').value;
        const params = new URLSearchParams({
            origin: $('origin').value,
            destination: $('destination').value,
            date: $('departureDate').value,
            passengers
        });

        try {
            const response = await fetch(`${API_BASE}/flights?${params.toString()}`);
            const flights = await response.json();

            currentFlights = Array.isArray(flights) ? flights : [];
            renderFlights(resultsContainer, currentFlights, cabinClass, passengers);
            resultsContainer?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error fetching flights:', error);
            alert('Failed to search flights. Is the server running?');
        }
    });

    loadAvailableFlights();
});

function renderFlights(container, flights, cabinClass, passengers) {
    if (!container) return;

    if (!flights.length) {
        container.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center;"><h3>No flights found for this route and date.</h3></div>';
        return;
    }

    container.innerHTML = `
        <div class="filter-bar glass-panel" style="padding: 1rem; margin-bottom: 1rem; display: flex; gap: 1rem; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 1rem; align-items: center;">
                <label for="priceFilter" style="font-weight: 600; color: var(--secondary);">Filter by Price:</label>
                <select id="priceFilter" style="padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(255,255,255,0.1); color: var(--text-main);">
                    <option value="all">All Prices</option>
                    <option value="under-5000">Under ₹5,000</option>
                    <option value="5000-10000">₹5,000 - ₹10,000</option>
                    <option value="10000-15000">₹10,000 - ₹15,000</option>
                    <option value="over-15000">Over ₹15,000</option>
                </select>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-muted);">
                Showing <span id="flightCount">${flights.length}</span> flights
            </div>
        </div>
        <h2 style="margin-bottom: 1rem;">Select your departure flight</h2>
    `;

    $('priceFilter')?.addEventListener('change', ({ target }) => {
        renderFlightCards(container, applyPriceFilter(currentFlights, cabinClass, passengers, target.value), cabinClass, passengers);
    });

    renderFlightCards(container, flights, cabinClass, passengers);
}

function applyPriceFilter(flights, cabinClass, passengers, filterValue) {
    return flights.filter((flight) => {
        const displayPrice = getDisplayPrice(flight.currentPrice, cabinClass, passengers);

        switch (filterValue) {
            case 'under-5000': return displayPrice < 5000;
            case '5000-10000': return displayPrice >= 5000 && displayPrice <= 10000;
            case '10000-15000': return displayPrice >= 10000 && displayPrice <= 15000;
            case 'over-15000': return displayPrice > 15000;
            default: return true;
        }
    });
}

function renderFlightCards(container, flights, cabinClass, passengers) {
    container.querySelectorAll('.flight-card').forEach((card) => card.remove());

    const flightCount = $('flightCount');
    if (flightCount) flightCount.innerText = flights.length;

    const fragment = document.createDocumentFragment();

    flights.forEach((flight, index) => {
        const displayPrice = getDisplayPrice(flight.currentPrice, cabinClass, passengers);
        const card = document.createElement('div');

        card.className = 'glass-panel flight-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.innerHTML = `
            <div>
                <div style="font-weight: 600; font-size: 1.2rem;">${flight.flightNumber}</div>
                <div style="color: var(--accent); font-size: 0.9rem;">${cabinClass}</div>
            </div>
            <div class="flight-route">
                <div>
                    <div class="flight-time">${formatTime(flight.departureTime)}</div>
                    <div class="flight-city">${flight.route.origin}</div>
                </div>
                <div style="flex: 1; min-width: 100px;">
                    <div class="flight-duration">${flight.duration}</div>
                </div>
                <div>
                    <div class="flight-time">${formatTime(flight.arrivalTime)}</div>
                    <div class="flight-city">${flight.route.destination}</div>
                </div>
            </div>
            <div class="flight-price">
                <div class="price-val">₹${displayPrice.toLocaleString()}</div>
                <div class="seats-left">${flight.seatsAvailable} seats left</div>
            </div>
            <div>
                <button class="btn-primary" onclick="proceedToBooking('${flight._id}', ${displayPrice}, '${cabinClass}')">Book Now</button>
            </div>
        `;

        fragment.appendChild(card);

        if (typeof gsap !== 'undefined') {
            setTimeout(() => {
                gsap.to(card, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
            }, index * 100);
        }
    });

    container.appendChild(fragment);
}

window.proceedToBooking = (flightId, price, cabinClass) => {
    sessionStorage.setItem('selectedFlight', flightId);
    sessionStorage.setItem('selectedPrice', price);
    sessionStorage.setItem('selectedClass', cabinClass);
    window.location.href = 'pages/login.html?redirect=seat-selection.html';
};

async function loadAvailableFlights() {
    const grid = $('availableFlightsGrid');
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE}/api/flights`);
        const flights = await response.json();

        if (!Array.isArray(flights) || !flights.length) {
            grid.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center; grid-column: 1 / -1;"><h3>No flights available. Please add flights to database.</h3></div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        flights.forEach((flight, index) => {
            const aircraftModel = flight.aircraft?.model || 'Airbus A320';
            const card = document.createElement('div');

            card.className = 'glass-panel flight-card-mini';
            card.innerHTML = `
                <div class="fc-header">
                    <span style="font-weight: 600;">Flight ${flight.flightNumber}</span>
                    <span style="color: var(--accent); font-size: 0.9rem;">${aircraftModel}</span>
                </div>
                <div class="fc-route">
                    <span>${flight.route.origin}</span>
                    <i class="fa-solid fa-plane"></i>
                    <span>${flight.route.destination}</span>
                </div>
                <div class="fc-time">
                    <span>${formatTime(flight.departureTime)}</span>
                    <span>${formatTime(flight.arrivalTime)}</span>
                </div>
                <div class="fc-footer">
                    <div class="fc-price">₹${Math.round(flight.basePrice).toLocaleString()}</div>
                    <button class="btn-primary" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;" onclick="prefillBooking('${flight.route.origin}', '${flight.route.destination}', '${flight.flightNumber}')">Book Flight</button>
                </div>
            `;

            fragment.appendChild(card);

            if (typeof gsap !== 'undefined') {
                gsap.from(card, {
                    opacity: 0,
                    y: 30,
                    duration: 0.6,
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top bottom-=50',
                        toggleActions: 'play none none none'
                    }
                });
            }
        });

        grid.replaceChildren(fragment);
    } catch (error) {
        console.error('Error loading available flights:', error);
    }
}

window.prefillBooking = (origin, destination, flightNumber) => {
    const originSelect = $('origin');
    const destSelect = $('destination');
    const flightNoGroup = $('flightNumberGroup');
    const flightNoInput = $('flightNumber');

    if (originSelect) originSelect.value = origin;
    if (destSelect) destSelect.value = destination;

    if (flightNoGroup && flightNoInput) {
        flightNoGroup.style.display = 'flex';
        flightNoInput.value = flightNumber;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof gsap !== 'undefined') {
        gsap.fromTo('#flightSearchForm',
            { scale: 1.02, boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)' },
            { scale: 1, boxShadow: 'none', duration: 0.6 }
        );
    }
};
