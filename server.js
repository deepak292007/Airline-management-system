const express = require('express');
const cors = require('cors');
const db = require('./database'); 

const app = express();
const PORT = 5500;

// Middleware
app.use(cors()); // Allow frontend to call the API
app.use(express.json()); // Parse JSON bodies
app.use(express.static('.')); // Serve the HTML/CSS/JS files from root



/**
 * GET /api/flights
 * Retrieves all upcoming flights, used for Customer viewing and Staff manifests.
 */
app.get('/api/flights', (req, res) => {
    const { origin, destination } = req.query;
    let sql = "SELECT * FROM flights";
    let params = [];

    // Optional crude filtering for the booking engine UI
    if (origin && destination) {
        sql += " WHERE origin LIKE ? AND destination LIKE ?";
        params = [`%${origin}%`, `%${destination}%`];
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

/**
 * GET /api/bookings/:pnr
 * Retrieves passenger data by PNR. Used by Staff view.
 */
app.get('/api/bookings/:pnr', (req, res) => {
    const pnr = req.params.pnr;
    const sql = `
        SELECT b.pnr, b.passenger_name, b.cabin_class, f.flight_no, f.origin, f.destination, f.status 
        FROM bookings b 
        JOIN flights f ON b.flight_id = f.id 
        WHERE b.pnr = ?`;
    
    db.get(sql, [pnr], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Booking not found." });
            return;
        }
        res.json({ data: row });
    });
});

/**
 * GET /api/stats
 * Retrieves company metrics. Used by Admin view.
 */
app.get('/api/stats', (req, res) => {
    const sql = "SELECT * FROM stats ORDER BY id DESC LIMIT 1";
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: row });
    });
});


// Start Server
app.listen(PORT, () => {
    console.log(`SSS Airlines Backend running on http://localhost:${PORT}`);
});
