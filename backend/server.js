const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/flights', require('./routes/flights'));
app.use('/api/flights', require('./routes/flights')); // Added for frontend API compatibility
app.use('/booking', require('./routes/booking'));
app.use('/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running very superfast on port ${PORT}`);
});
