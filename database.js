const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite DB (creates file if it doesn't exist)
const dbPath = path.resolve(__dirname, 'airline.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // 1. Create Flights Table
        db.run(`
            CREATE TABLE IF NOT EXISTS flights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                flight_no TEXT NOT NULL,
                origin TEXT NOT NULL,
                destination TEXT NOT NULL,
                departure_time TEXT NOT NULL,
                pax_count INTEGER DEFAULT 0,
                max_capacity INTEGER NOT NULL,
                status TEXT DEFAULT 'On Time',
                gate TEXT,
                price REAL NOT NULL
            )
        `);

        // 2. Create Bookings Table
        db.run(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pnr TEXT UNIQUE NOT NULL,
                flight_id INTEGER NOT NULL,
                passenger_name TEXT NOT NULL,
                cabin_class TEXT NOT NULL,
                booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                price_paid REAL,
                FOREIGN KEY (flight_id) REFERENCES flights(id)
            )
        `);

        // 3. Create System Stats Table (for Admin View)
        db.run(`
            CREATE TABLE IF NOT EXISTS stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                daily_revenue REAL DEFAULT 0,
                tickets_sold INTEGER DEFAULT 0,
                active_flights INTEGER DEFAULT 0,
                system_uptime REAL DEFAULT 99.9
            )
        `);

        // Seed initial data if empty
        db.get("SELECT COUNT(*) as count FROM flights", (err, row) => {
            if (row.count === 0) {
                console.log("Seeding initial flights...");
                const stmt = db.prepare("INSERT INTO flights (flight_no, origin, destination, departure_time, pax_count, max_capacity, status, gate, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                
                stmt.run('SSS102', 'VIJ', 'HYD', '08:00 AM', 120, 180, 'On Time', 'G1', 3500.00);
                stmt.run('SSS405', 'DEL', 'BOM', '10:30 AM', 310, 350, 'Delayed', 'T3', 5500.00);
                stmt.run('SSS892', 'BLR', 'MAA', '02:15 PM', 145, 180, 'Boarding', 'A4', 2800.00);
                stmt.run('SSS334', 'HYD', 'GOI', '05:45 PM', 170, 180, 'Scheduled', 'B2', 4200.00);
                stmt.run('SSS991', 'CCU', 'DEL', '09:00 PM', 200, 220, 'Scheduled', 'C1', 6100.00);
                
                stmt.finalize();
            }
        });

        // Seed initial stats if empty
        db.get("SELECT COUNT(*) as count FROM stats", (err, row) => {
            if (row.count === 0) {
                console.log("Seeding initial stats...");
                db.run("INSERT INTO stats (daily_revenue, tickets_sold, active_flights, system_uptime) VALUES (1425000.00, 1240, 42, 99.9)");
            }
        });
        
        // Seed initial bookings if empty
        db.get("SELECT COUNT(*) as count FROM bookings", (err, row) => {
             if (row.count === 0) {
                 console.log("Seeding initial bookings...");
                  const stmt = db.prepare("INSERT INTO bookings (pnr, flight_id, passenger_name, cabin_class, price_paid) VALUES (?, ?, ?, ?, ?)");
                  stmt.run('SSS102AB', 1, 'Ravi Kumar', 'Economy', 3500.00);
                  stmt.run('SSS405XY', 2, 'Priya Sharma', 'Business', 12000.00);
                  stmt.finalize();
             }
        });
    });
}

module.exports = db;
